const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    unique: true
  },
  Year: {
    type: String,
  },
  UploadType: {
    type: String,
    enum: ['excel', 'pdf'],
    default: 'excel'
  },
  PdfUrl: {
    type: String,
    default: null
  },
  Questions: [{
    QuestionID: { type: String }, // e.g., "1", "2"
    Subject: {
      type: String,
      enum: ['Quant', 'Reasoning', 'English', 'General Awareness']
    },
    Topic: { type: String },
    GroupText: { type: String, default: null }, // For paragraph-based questions
    QuestionText: { type: String },
    OptionA: { type: String },
    OptionB: { type: String },
    OptionC: { type: String },
    OptionD: { type: String },
    CorrectAnswer: { type: String, enum: ['A', 'B', 'C', 'D'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
