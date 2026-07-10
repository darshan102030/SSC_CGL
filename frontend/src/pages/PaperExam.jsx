import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, AlertTriangle } from 'lucide-react';

const PaperExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins
  const [currentSection, setCurrentSection] = useState(1);
  const [showSectionPopup, setShowSectionPopup] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Prevent accidental tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasSubmitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Hack to prevent back button without useBlocker
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      if (!hasSubmitted) {
        const confirmLeave = window.confirm("Wait, exam in progress! If you leave now, your progress will be lost. Are you sure you want to exit?");
        if (!confirmLeave) {
          window.history.pushState(null, null, window.location.pathname);
        } else {
          window.history.back();
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasSubmitted]);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/papers/${id}`);
        setPaper(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching paper', error);
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && !hasSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Sectional timing logic
          if (newTime === 45 * 60) {
            setCurrentSection(2);
            triggerSectionPopup();
          } else if (newTime === 30 * 60) {
            setCurrentSection(3);
            triggerSectionPopup();
          } else if (newTime === 15 * 60) {
            setCurrentSection(4);
            triggerSectionPopup();
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !loading && !hasSubmitted) {
      handleSubmit();
    }
  }, [loading, timeLeft, hasSubmitted]);

  const triggerSectionPopup = () => {
    setShowSectionPopup(true);
    setTimeout(() => {
      setShowSectionPopup(false);
    }, 5000);
  };

  const handleAnswer = (questionId, option) => {
    const qNum = parseInt(questionId, 10);
    const startQ = (currentSection - 1) * 25 + 1;
    const endQ = currentSection * 25;
    
    // Prevent answering outside active section
    if (qNum < startQ || qNum > endQ) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSkipSection = () => {
    if (currentSection < 4) {
      const confirmSkip = window.confirm(`Are you sure you want to skip Section ${currentSection}? You cannot come back to these questions.`);
      if (confirmSkip) {
        setCurrentSection(prev => prev + 1);
        setTimeLeft((4 - currentSection) * 15 * 60);
        triggerSectionPopup();
      }
    } else {
      const confirmSubmit = window.confirm("You are about to submit the exam early. Are you sure?");
      if (confirmSubmit) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!paper) return;
    setHasSubmitted(true);

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    const questionResponses = paper.Questions.map(q => {
      const userAnswer = answers[q.QuestionID] || null;
      let status = 'Unattempted';
      
      if (userAnswer) {
        attempted++;
        if (userAnswer === q.CorrectAnswer) {
          correct++;
          status = 'Correct';
        } else {
          wrong++;
          status = 'Wrong';
        }
      }
      
      return {
        QuestionID: q.QuestionID,
        UserAnswer: userAnswer,
        Status: status
      };
    });

    const totalQuestions = paper.Questions.length;
    const unattempted = totalQuestions - attempted;
    const rawScore = correct * 2 - wrong * 0.5; // Standard SSC scoring
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const attemptRate = (attempted / totalQuestions) * 100;

    // Simple subject analysis
    const subjects = ['Quant', 'Reasoning', 'English', 'General Awareness'];
    const subjectAnalysis = subjects.map(sub => {
      const subQs = paper.Questions.filter(q => q.Subject === sub);
      const subTotal = subQs.length;
      if (subTotal === 0) return null;

      let subCorrect = 0, subWrong = 0, subAttempted = 0;
      subQs.forEach(q => {
        const ans = answers[q.QuestionID];
        if (ans) {
          subAttempted++;
          if (ans === q.CorrectAnswer) subCorrect++;
          else subWrong++;
        }
      });
      return {
        Subject: sub,
        Total: subTotal,
        Attempted: subAttempted,
        Unattempted: subTotal - subAttempted,
        Correct: subCorrect,
        Wrong: subWrong,
        Accuracy: subAttempted > 0 ? (subCorrect / subAttempted) * 100 : 0
      };
    }).filter(Boolean);

    try {
      await axios.post('http://localhost:5000/api/papers/result', {
        paperId: id,
        totalQuestions,
        attempted,
        unattempted,
        correct,
        wrong,
        rawScore,
        accuracy,
        attemptRate,
        subjectAnalysis,
        questionResponses
      });
      navigate('/papers/dashboard');
    } catch (error) {
      console.error('Error submitting test', error);
      alert('Failed to submit test');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!paper) {
    return <div className="min-h-screen flex justify-center items-center">Paper not found.</div>;
  }

  const isPdfMode = paper.UploadType === 'pdf';
  const currentQ = paper.Questions && paper.Questions.length > 0 ? paper.Questions[currentQIndex] : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Section Transition Popup */}
      {showSectionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce">
            <AlertCircle className="w-16 h-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Section Ended</h2>
            <p className="text-gray-600 mt-2">Moving to Section {currentSection}. Previous questions are now locked.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-gray-800">{paper.Name}</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-mono font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSkipSection}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold transition-colors border border-gray-300"
            >
              {currentSection < 4 ? 'Skip Section' : 'Finish Early'}
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left/Center Panel (Question or PDF) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6">
          {isPdfMode ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 h-full flex flex-col p-2">
               {/* Note: This assumes static files are served at /uploads */}
               <iframe 
                 src={`http://localhost:5000${paper.PdfUrl}`} 
                 className="w-full h-full rounded-lg"
                 title="Question Paper PDF"
               />
            </div>
          ) : (
            currentQ && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 p-8">
                {/* Subject Badge */}
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold mb-6">
                  {currentQ.Subject || 'General'} {currentQ.Topic ? `• ${currentQ.Topic}` : ''}
                </div>

                <div className="flex gap-8">
                  {/* Group Text (e.g. Reading Comprehension) */}
                  {currentQ.GroupText && (
                    <div className="flex-1 border-r border-gray-200 pr-8">
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        Read the following text carefully:
                      </h3>
                      <div className="prose text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                        {currentQ.GroupText}
                      </div>
                    </div>
                  )}

                  {/* Question and Options */}
                  <div className={`flex-1 ${currentQ.GroupText ? 'pl-2' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex gap-4">
                      <span className="text-blue-600">Q.{currentQIndex + 1}</span>
                      <span>{currentQ.QuestionText}</span>
                    </h2>

                    <div className="space-y-4">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <label 
                          key={opt}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            answers[currentQ.QuestionID] === opt 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name={`question-${currentQ.QuestionID}`}
                            className="hidden"
                            checked={answers[currentQ.QuestionID] === opt}
                            onChange={() => handleAnswer(currentQ.QuestionID, opt)}
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            answers[currentQ.QuestionID] === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {opt}
                          </div>
                          <span className="text-gray-800 font-medium">
                            {currentQ[`Option${opt}`] || `Option ${opt}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.min(paper.Questions.length - 1, prev + 1))}
                    disabled={currentQIndex === paper.Questions.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Save & Next <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Panel (Question Palette / OMR) */}
        <div className="w-80 bg-white border-l border-gray-200 shrink-0 flex flex-col p-4">
          <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">Question Palette</h3>
          
          <div className="flex-1 overflow-y-auto">
            {isPdfMode ? (
               // OMR Sheet for PDF
               <div className="space-y-3">
                 {/* Generate 100 empty questions for PDF if not pre-provided in DB */}
                 {Array.from({ length: 100 }).map((_, i) => {
                   const qNum = i + 1;
                   const startQ = (currentSection - 1) * 25 + 1;
                   const endQ = currentSection * 25;
                   const isLocked = qNum < startQ || qNum > endQ;
                   
                   return (
                   <div key={i} className={`flex items-center justify-between p-2 rounded border ${isLocked ? 'bg-gray-100 border-gray-200 opacity-60' : 'hover:bg-gray-50 border-gray-100'}`}>
                     <span className="font-bold text-gray-900 text-sm w-8">{qNum}.</span>
                     <div className="flex gap-2">
                       {['A', 'B', 'C', 'D'].map(opt => (
                         <button
                           key={opt}
                           onClick={() => handleAnswer(String(qNum), opt)}
                           disabled={isLocked}
                           className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                             answers[String(qNum)] === opt 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : isLocked 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                   </div>
                 )})}
               </div>
            ) : (
              // Standard CBT Palette
              <div className="grid grid-cols-5 gap-2">
                {paper.Questions.map((q, idx) => {
                  const qNum = idx + 1;
                  const startQ = (currentSection - 1) * 25 + 1;
                  const endQ = currentSection * 25;
                  const isLocked = qNum < startQ || qNum > endQ;
                  
                  return (
                  <button
                    key={q.QuestionID}
                    onClick={() => setCurrentQIndex(idx)}
                    disabled={isLocked}
                    className={`h-10 rounded-md font-bold text-sm transition-all ${
                      currentQIndex === idx ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    } ${
                      isLocked ? 'opacity-40 cursor-not-allowed grayscale' : ''
                    } ${
                      answers[q.QuestionID] 
                        ? 'bg-green-500 text-white border-transparent' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )})}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div> Attempted
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div> Unattempted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperExam;
