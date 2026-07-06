const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  Date: {
    type: Date,
    default: Date.now
  },
  TotalQuestions: {
    type: Number,
    required: true
  },
  Attempted: {
    type: Number,
    required: true
  },
  Unattempted: {
    type: Number,
    required: true
  },
  Correct: {
    type: Number,
    required: true
  },
  Wrong: {
    type: Number,
    required: true
  },
  RawScore: {
    type: Number,
    required: true
  },
  Accuracy: {
    type: Number,
    required: true
  },
  AttemptRate: {
    type: Number,
    required: true
  },
  SubjectAnalysis: [{
    Subject: String,
    Correct: Number,
    Wrong: Number,
    Unattempted: Number,
    Total: Number,
    Accuracy: Number
  }],
  QuestionResponses: [{
    Question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    UserAnswer: {
      type: String, // 'A', 'B', 'C', 'D', or null for unattempted
      default: null
    },
    Status: {
      type: String, // 'Correct', 'Wrong', 'Unattempted'
      required: true
    }
  }]
});

module.exports = mongoose.model('TestResult', testResultSchema);
