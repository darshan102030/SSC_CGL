import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../context/TestContext';
import { Clock, AlertCircle } from 'lucide-react';

const TestInterface = () => {
  const {
    sections,
    currentSectionIndex,
    currentSectionQuestions,
    responses,
    questionStatus,
    currentIndex,
    timeLeft,
    isTestActive,
    updateResponse,
    navigateToQuestion,
    saveAndNext,
    markForReviewAndNext,
    clearResponse,
    submitSection,
    submitTest
  } = useTest();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTestActive) {
      navigate('/');
    }
  }, [isTestActive, navigate]);

  if (!isTestActive || currentSectionQuestions.length === 0) return null;

  const currentQ = currentSectionQuestions[currentIndex];
  
  // Format timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPaletteColor = (status) => {
    switch(status) {
      case 'answered': return 'bg-palette-answered text-white border-transparent';
      case 'visited': return 'bg-palette-visited text-white border-transparent';
      case 'marked': return 'bg-purple-500 text-white border-transparent'; // Fixed bug here: hardcoded tailwind color instead of custom palette to ensure it renders correctly
      case 'answeredMarked': return 'bg-blue-500 text-white border-transparent relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-400 after:rounded-full';
      default: return 'bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  // Stats for palette summary
  const getStats = () => {
    const stats = { answered: 0, notVisited: 0, visited: 0, marked: 0, answeredMarked: 0 };
    Object.values(questionStatus).forEach(s => {
      if (stats[s] !== undefined) stats[s]++;
    });
    return stats;
  };
  const stats = getStats();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-ssc-dark text-white p-3 flex justify-between items-center shrink-0 shadow-md">
        <div className="font-bold text-lg">SSC CGL Mock Exam</div>
        <div className="flex items-center gap-6">
          <div className="bg-gray-800 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700">
            Subject: <span className="text-blue-400">{currentQ.Subject}</span>
          </div>
          <div className={`flex items-center gap-2 font-bold text-xl px-4 py-1.5 rounded-full ${timeLeft < 300 ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-gray-800 border border-gray-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Question */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-ssc-dark overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
            <span>Section: {sections[currentSectionIndex]} | Question {currentIndex + 1} of {currentSectionQuestions.length} <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs border border-gray-200 dark:border-gray-700">ID: {currentQ.QuestionID}</span></span>
            <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-4 h-4"/> 0.50 Negative Marks</span>
          </div>
          
          <div className="p-8 flex-1">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-8 whitespace-pre-wrap leading-relaxed">
              {currentQ.Question}
            </div>
            
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map(opt => (
                <label 
                  key={opt}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    responses[currentQ._id] === opt 
                      ? 'border-ssc-primary bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="option" 
                    value={opt}
                    checked={responses[currentQ._id] === opt}
                    onChange={() => updateResponse(currentQ._id, opt)}
                    className="mt-1 h-5 w-5 text-ssc-primary focus:ring-ssc-primary"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold mr-2">{opt}.</span>
                    {currentQ[`Option${opt}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between shrink-0">
            <div className="flex gap-3">
              <button 
                onClick={markForReviewAndNext}
                className="px-6 py-2.5 rounded shadow-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={clearResponse}
                className="px-6 py-2.5 rounded shadow-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Clear Response
              </button>
            </div>
            
            <button 
              onClick={saveAndNext}
              className="px-8 py-2.5 rounded shadow bg-ssc-primary hover:bg-blue-600 text-white font-bold transition-all active:scale-[0.98]"
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Section - Palette */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 flex flex-col shrink-0">
          {/* User Info Mock */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
              IMG
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 dark:text-gray-200">Candidate Name</div>
              <div className="text-xs text-gray-500">John Doe</div>
            </div>
          </div>

          {/* Palette Info */}
          <div className="p-4 grid grid-cols-2 gap-3 text-xs border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full flex items-center justify-center bg-palette-answered text-white">{stats.answered}</span> Answered</div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full flex items-center justify-center bg-palette-visited text-white">{stats.visited}</span> Not Answered</div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">{stats.notVisited}</span> Not Visited</div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-500 text-white">{stats.marked}</span> Marked for Review</div>
            <div className="flex items-center gap-2 col-span-2"><span className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-1.5 after:h-1.5 after:bg-green-400 after:rounded-full">{stats.answeredMarked}</span> Answered & Marked for Review</div>
          </div>

          {/* Sections Tabs Mock */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 p-2">
            {sections.map((sec, idx) => (
              <div 
                key={sec}
                className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap rounded ${
                  idx === currentSectionIndex 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {sec}
              </div>
            ))}
          </div>

          {/* Question Grid */}
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {currentSectionQuestions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => navigateToQuestion(idx)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold border transition-all ${getPaletteColor(questionStatus[q._id])} ${idx === currentIndex ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 ring-offset-gray-50 dark:ring-offset-gray-900' : ''}`}
                  style={
                    questionStatus[q._id] === 'notVisited' 
                      ? { borderRadius: '4px' } 
                      : { borderRadius: '50% 50% 50% 0' } // Exam style shape
                  }
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => {
                if(window.confirm(`Are you sure you want to submit the ${sections[currentSectionIndex]} section? You cannot return to it.`)) {
                  submitSection();
                }
              }}
              className="w-full py-3 bg-palette-answered hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              {currentSectionIndex === sections.length - 1 ? 'Submit Final Test' : 'Submit Section'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;
