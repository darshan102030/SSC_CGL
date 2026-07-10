const Question = require('../models/Question');
const xlsx = require('xlsx');

// @desc    Upload questions via Excel file
// @route   POST /api/questions/upload
// @access  Public (for now)
const uploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const password = req.body.password;
    if (password !== 'admin123') { // Simple verification
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validate required columns
    const requiredColumns = ['QuestionID', 'Subject', 'Year', 'Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer'];
    const firstRow = data[0];
    if (!firstRow) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }
    
    for (const col of requiredColumns) {
      if (!(col in firstRow)) {
        return res.status(400).json({ message: `Missing required column: ${col}` });
      }
    }

    let addedCount = 0;
    let duplicateCount = 0;

    for (const row of data) {
      const exists = await Question.findOne({ QuestionID: String(row.QuestionID) });
      if (!exists) {
        await Question.create({
          QuestionID: String(row.QuestionID),
          Subject: row.Subject,
          Year: String(row.Year),
          Question: row.Question,
          OptionA: String(row.OptionA),
          OptionB: String(row.OptionB),
          OptionC: String(row.OptionC),
          OptionD: String(row.OptionD),
          CorrectAnswer: row.CorrectAnswer,
          Topic: row.Topic ? String(row.Topic) : null
        });
        addedCount++;
      } else {
        duplicateCount++;
      }
    }

    res.status(200).json({ 
      message: 'Upload successful', 
      added: addedCount, 
      duplicatesIgnored: duplicateCount 
    });

  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get random questions for mock test
// @route   GET /api/questions/random
// @access  Public
const getRandomQuestions = async (req, res) => {
  try {
    const { count = 100, subject, year, topic } = req.query;
    let questions = [];

    const baseMatch = {};
    if (year && year !== 'Any') {
      baseMatch.Year = year;
    }
    if (topic) {
      baseMatch.Topic = topic;
    }

    if (subject === 'All') {
      // User requested order: Reasoning, GA, Quant, English
      const subjects = ['Reasoning', 'General Awareness', 'Quant', 'English'];
      const perSubjectCount = Math.floor(parseInt(count) / subjects.length);
      
      const promises = subjects.map(sub => 
        Question.aggregate([
          { $match: { ...baseMatch, Subject: sub } },
          { $sample: { size: perSubjectCount } }
        ])
      );
      
      const results = await Promise.all(promises);
      questions = results.flat();
    } else {
      questions = await Question.aggregate([
        { $match: { ...baseMatch, Subject: subject } },
        { $sample: { size: parseInt(count) } }
      ]);
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available years
// @route   GET /api/questions/years
// @access  Public
const getAvailableYears = async (req, res) => {
  try {
    const years = await Question.distinct('Year');
    res.status(200).json(years.sort((a, b) => b - a));
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available topics for a subject
// @route   GET /api/questions/topics
// @access  Public
const getAvailableTopics = async (req, res) => {
  try {
    const { subject } = req.query;
    const match = subject ? { Subject: subject } : {};
    const topics = await Question.distinct('Topic', match);
    res.status(200).json(topics.filter(t => t).sort());
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all questions (paginated)
// @route   GET /api/questions
// @access  Public
const getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { QuestionID: { $regex: search, $options: 'i' } },
          { Question: { $regex: search, $options: 'i' } },
          { Subject: { $regex: search, $options: 'i' } },
          { Topic: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalQuestions: total
    });
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Public (protected by password in body)
const updateQuestion = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password !== 'admin123') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Do not allow updating QuestionID
    delete updateData.QuestionID;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Public (protected by password in body/query)
const deleteQuestion = async (req, res) => {
  try {
    const password = req.body.password || req.query.password;
    if (password !== 'admin123') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  uploadQuestions, 
  getRandomQuestions, 
  getAvailableYears, 
  getAvailableTopics,
  getAllQuestions,
  updateQuestion,
  deleteQuestion
};
