import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const TestContext = createContext();

export const useTest = () => useContext(TestContext);

export const TestProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  
  // Section states
  const [sections, setSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0); // Index within the current section
  const [timeLeft, setTimeLeft] = useState(0); // Timer for the current section
  const [baseSectionTime, setBaseSectionTime] = useState(0);
  
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testContext, setTestContext] = useState({});
  
  const navigate = useNavigate();

  // Derived state: questions for the current section
  const currentSectionQuestions = useMemo(() => {
    if (sections.length === 0 || questions.length === 0) return [];
    return questions.filter(q => q.Subject === sections[currentSectionIndex]);
  }, [questions, sections, currentSectionIndex]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTestActive && timeLeft === 0) {
      submitSection(); // Auto-submit section when timer ends
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const startTest = (fetchedQuestions, durationMinutes, context = {}) => {
    setQuestions(fetchedQuestions);
    setResponses({});
    setTestContext(context);
    
    // Determine sections preserving the order they appear in the fetched array
    const uniqueSubjects = [];
    fetchedQuestions.forEach(q => {
      if (!uniqueSubjects.includes(q.Subject)) {
        uniqueSubjects.push(q.Subject);
      }
    });
    setSections(uniqueSubjects);
    setCurrentSectionIndex(0);
    
    // Initialize status for all questions as 'notVisited'
    const initialStatus = {};
    fetchedQuestions.forEach(q => {
      initialStatus[q._id] = 'notVisited';
    });
    
    // First question of first section is visited
    const firstSectionQs = fetchedQuestions.filter(q => q.Subject === uniqueSubjects[0]);
    if (firstSectionQs.length > 0) {
      initialStatus[firstSectionQs[0]._id] = 'visited';
    }
    
    setQuestionStatus(initialStatus);
    setCurrentIndex(0);

    // Calculate time per section
    const timePerSection = Math.ceil((durationMinutes * 60) / uniqueSubjects.length);
    setBaseSectionTime(timePerSection);
    setTimeLeft(timePerSection);
    
    setIsTestActive(true);
    setTestResult(null);
  };

  const submitSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      // Move to next section
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setCurrentIndex(0);
      setTimeLeft(baseSectionTime);
      
      // Mark first question of new section as visited
      const nextSectionQs = questions.filter(q => q.Subject === sections[nextIndex]);
      if (nextSectionQs.length > 0) {
        updateStatus(nextSectionQs[0]._id, 'visited');
      }
    } else {
      // It was the last section, submit the entire test
      submitTest();
    }
  };

  const updateResponse = (questionId, answer) => {
    setResponses(prev => ({ ...prev, [questionId]: answer }));
  };

  const updateStatus = (questionId, status) => {
    setQuestionStatus(prev => ({ ...prev, [questionId]: status }));
  };

  const navigateToQuestion = (index, skipStatusUpdate = false) => {
    if (index >= 0 && index < currentSectionQuestions.length) {
      const currentQId = currentSectionQuestions[currentIndex]._id;
      
      if (!skipStatusUpdate) {
        // If navigating away by clicking grid, update current question status based on answer
        const currStatus = questionStatus[currentQId];
        if (currStatus === 'notVisited' || currStatus === 'visited') {
           if (responses[currentQId]) {
             updateStatus(currentQId, 'answered');
           } else {
             updateStatus(currentQId, 'visited');
           }
        } else if (currStatus === 'marked') {
           if (responses[currentQId]) {
             updateStatus(currentQId, 'answeredMarked');
           }
        } else if (currStatus === 'answeredMarked') {
           if (!responses[currentQId]) {
             updateStatus(currentQId, 'marked');
           }
        }
      }

      setCurrentIndex(index);
      
      // The new question becomes visited if it was notVisited
      const newQId = currentSectionQuestions[index]._id;
      setQuestionStatus(prev => {
        if (prev[newQId] === 'notVisited') {
           return { ...prev, [newQId]: 'visited' };
        }
        return prev;
      });
    }
  };

  const saveAndNext = () => {
    const currentQId = currentSectionQuestions[currentIndex]._id;
    if (responses[currentQId]) {
      updateStatus(currentQId, 'answered');
    } else {
      updateStatus(currentQId, 'visited');
    }
    
    if (currentIndex < currentSectionQuestions.length - 1) {
      navigateToQuestion(currentIndex + 1, true);
    }
  };

  const markForReviewAndNext = () => {
    const currentQId = currentSectionQuestions[currentIndex]._id;
    if (responses[currentQId]) {
      updateStatus(currentQId, 'answeredMarked');
    } else {
      updateStatus(currentQId, 'marked');
    }
    
    if (currentIndex < currentSectionQuestions.length - 1) {
      navigateToQuestion(currentIndex + 1, true);
    }
  };

  const clearResponse = () => {
    const currentQId = currentSectionQuestions[currentIndex]._id;
    setResponses(prev => {
      const newResp = { ...prev };
      delete newResp[currentQId];
      return newResp;
    });
    // If it was marked, we can keep it marked or change to visited. Standard is visited.
    updateStatus(currentQId, 'visited');
  };

  const submitTest = async () => {
    setIsTestActive(false);
    try {
      const payload = {
        questions: questions,
        responses: responses,
        testType: testContext.testType,
        topicName: testContext.topicName
      };
      const res = await api.post('/tests/submit', payload);
      setTestResult(res.data);
      navigate(`/analysis/${res.data._id}`);
    } catch (error) {
      console.error('Failed to submit test', error);
      alert('Failed to submit test. Please check console.');
    }
  };

  return (
    <TestContext.Provider value={{
      questions,
      sections,
      currentSectionIndex,
      currentSectionQuestions,
      responses,
      questionStatus,
      currentIndex,
      timeLeft,
      isTestActive,
      testResult,
      startTest,
      submitSection,
      updateResponse,
      navigateToQuestion,
      saveAndNext,
      markForReviewAndNext,
      clearResponse,
      submitTest
    }}>
      {children}
    </TestContext.Provider>
  );
};
