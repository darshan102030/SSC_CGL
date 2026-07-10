const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  QuestionID: {
    type: String,
    required: true,
    unique: true
  },
  Subject: {
    type: String,
    required: true,
    enum: ['Quant', 'Reasoning', 'English', 'General Awareness']
  },
  Topic: {
    type: String,
    default: null
  },
  Year: {
    type: String,
    required: true
  },
  Question: {
    type: String,
    required: true
  },
  OptionA: {
    type: String,
    required: true
  },
  OptionB: {
    type: String,
    required: true
  },
  OptionC: {
    type: String,
    required: true
  },
  OptionD: {
    type: String,
    required: true
  },
  CorrectAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
