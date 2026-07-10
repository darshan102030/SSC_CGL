const mongoose = require('mongoose');

const paperResultSchema = new mongoose.Schema({
  Date: {
    type: Date,
    default: Date.now
  },
  PaperID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionPaper',
    required: true
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
    QuestionID: {
      type: String, // String ID matching the one inside QuestionPaper.Questions
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

module.exports = mongoose.model('PaperResult', paperResultSchema);
