const TestResult = require('../models/TestResult');

// @desc    Submit a test and calculate score
// @route   POST /api/tests/submit
// @access  Public
const submitTest = async (req, res) => {
  try {
    const { questions, responses } = req.body; 
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

    const questionResponses = [];

    questions.forEach(q => {
      const userAnswer = responses[q._id];
      const subject = q.Subject;
      let status = 'Unattempted';

      subjectStats[subject].total++;

      if (!userAnswer) {
        unattempted++;
        subjectStats[subject].unattempted++;
      } else if (userAnswer === q.CorrectAnswer) {
        correct++;
        subjectStats[subject].correct++;
        status = 'Correct';
      } else {
        wrong++;
        subjectStats[subject].wrong++;
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

    const testResult = await TestResult.create({
      TotalQuestions: totalQuestions,
      Attempted: attempted,
      Unattempted: unattempted,
      Correct: correct,
      Wrong: wrong,
      RawScore: rawScore,
      Accuracy: accuracy,
      AttemptRate: attemptRate,
      SubjectAnalysis: subjectAnalysis,
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

module.exports = { submitTest, getTestHistory, getTestAnalysis };
