const TestResult = require('../models/TestResult');

// @desc    Submit a test and calculate score
// @route   POST /api/tests/submit
// @access  Public
  const submitTest = async (req, res) => {
  try {
    const { questions, responses, testType, topicName } = req.body; 
    // questions: array of question objects (with _id, Subject, CorrectAnswer)
    // responses: object mapping question._id to user answer ('A', 'B', 'C', 'D', null)

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    let totalQuestions = questions.length;
    
    let subjectStats = {
      Quant: { correct: 0, wrong: 0, unattempted: 0, total: 0 },
      Reasoning: { correct: 0, wrong: 0, unattempted: 0, total: 0 },
      English: { correct: 0, wrong: 0, unattempted: 0, total: 0 },
      'General Awareness': { correct: 0, wrong: 0, unattempted: 0, total: 0 }
    };

    let topicStats = {}; // { 'Quant|Algebra': { subject: 'Quant', topic: 'Algebra', correct: 0, ... } }

    const questionResponses = [];

    questions.forEach(q => {
      const userAnswer = responses[q._id];
      const subject = q.Subject;
      const topic = q.Topic || 'Uncategorized';
      let status = 'Unattempted';

      subjectStats[subject].total++;
      
      const topicKey = `${subject}|${topic}`;
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { subject, topic, correct: 0, wrong: 0, unattempted: 0, total: 0 };
      }
      topicStats[topicKey].total++;

      if (!userAnswer) {
        unattempted++;
        subjectStats[subject].unattempted++;
        topicStats[topicKey].unattempted++;
      } else if (userAnswer === q.CorrectAnswer) {
        correct++;
        subjectStats[subject].correct++;
        topicStats[topicKey].correct++;
        status = 'Correct';
      } else {
        wrong++;
        subjectStats[subject].wrong++;
        topicStats[topicKey].wrong++;
        status = 'Wrong';
      }

      questionResponses.push({
        Question: q._id,
        UserAnswer: userAnswer,
        Status: status
      });
    });

    const rawScore = (correct * 2) - (wrong * 0.5);
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const attemptRate = totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0;

    const subjectAnalysis = Object.keys(subjectStats).map(sub => {
      const stats = subjectStats[sub];
      const subAttempted = stats.correct + stats.wrong;
      const subAccuracy = subAttempted > 0 ? (stats.correct / subAttempted) * 100 : 0;
      return {
        Subject: sub,
        Correct: stats.correct,
        Wrong: stats.wrong,
        Unattempted: stats.unattempted,
        Total: stats.total,
        Accuracy: subAccuracy
      };
    }).filter(s => s.Total > 0); // Only include subjects that were in the test

    const topicAnalysis = Object.keys(topicStats).map(key => {
      const stats = topicStats[key];
      const topAttempted = stats.correct + stats.wrong;
      const topAccuracy = topAttempted > 0 ? (stats.correct / topAttempted) * 100 : 0;
      return {
        Subject: stats.subject,
        Topic: stats.topic,
        Correct: stats.correct,
        Wrong: stats.wrong,
        Unattempted: stats.unattempted,
        Total: stats.total,
        Accuracy: topAccuracy
      };
    });

    const testResult = await TestResult.create({
      TestType: testType || 'Mock',
      TopicName: topicName || null,
      TotalQuestions: totalQuestions,
      Attempted: attempted,
      Unattempted: unattempted,
      Correct: correct,
      Wrong: wrong,
      RawScore: rawScore,
      Accuracy: accuracy,
      AttemptRate: attemptRate,
      SubjectAnalysis: subjectAnalysis,
      TopicAnalysis: topicAnalysis,
      QuestionResponses: questionResponses
    });

    res.status(201).json(testResult);
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all test history
// @route   GET /api/tests/history
// @access  Public
const getTestHistory = async (req, res) => {
  try {
    const history = await TestResult.find().sort({ Date: -1 }).select('-QuestionResponses'); // Exclude large array for list view
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single test result analysis
// @route   GET /api/tests/:id
// @access  Public
const getTestAnalysis = async (req, res) => {
  try {
    const test = await TestResult.findById(req.params.id).populate('QuestionResponses.Question');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error('Error fetching test analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all test history
// @route   DELETE /api/tests/history/clear
// @access  Public (protected by password)
const clearHistory = async (req, res) => {
  try {
    const password = req.query.password || req.body.password;
    if (password !== 'admin123') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await TestResult.deleteMany({});
    res.status(200).json({ message: 'All test history has been cleared successfully.' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitTest, getTestHistory, getTestAnalysis, clearHistory };
