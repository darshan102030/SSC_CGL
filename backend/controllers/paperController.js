const QuestionPaper = require('../models/QuestionPaper');
const PaperResult = require('../models/PaperResult');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Upload a new question paper (Excel/CSV or PDF)
exports.uploadPaper = async (req, res) => {
  try {
    const { name, year, uploadType } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Paper name is required' });
    }

    const existingPaper = await QuestionPaper.findOne({ Name: name });
    if (existingPaper) {
      return res.status(400).json({ error: 'Paper with this name already exists' });
    }

    let pdfUrl = null;
    let questions = [];

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    if (uploadType === 'pdf') {
      pdfUrl = `/uploads/${req.files.file[0].filename}`;
      
      // Parse Answer Key if provided
      if (req.files.answerKey) {
        const workbook = xlsx.readFile(req.files.answerKey[0].path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet);
        
        questions = rawData.map((row, index) => {
          let ans = row.CorrectAnswer ? String(row.CorrectAnswer).trim().toUpperCase() : undefined;
          if (ans && !['A', 'B', 'C', 'D'].includes(ans)) ans = undefined;
          return {
            QuestionID: row.QuestionID ? String(row.QuestionID).trim() : String(index + 1),
            CorrectAnswer: ans
          };
        });
      } else {
        // Fallback: Empty questions array so exam center handles it
        questions = Array.from({ length: 100 }).map((_, i) => ({
          QuestionID: String(i + 1)
        }));
      }
    } else {
      // Process Excel/CSV
      const workbook = xlsx.readFile(req.files.file[0].path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet);
      
      questions = rawData.map((row, index) => {
        let ans = row.CorrectAnswer ? String(row.CorrectAnswer).trim().toUpperCase() : undefined;
        if (ans && !['A', 'B', 'C', 'D'].includes(ans)) ans = undefined;
        return {
          QuestionID: row.QuestionID ? String(row.QuestionID).trim() : String(index + 1),
          Subject: row.Subject ? String(row.Subject).trim() : undefined,
          Topic: row.Topic || null,
          GroupText: row.GroupText || null,
          QuestionText: row.Question,
          OptionA: row.OptionA,
          OptionB: row.OptionB,
          OptionC: row.OptionC,
          OptionD: row.OptionD,
          CorrectAnswer: ans
        };
      });
    }

    const newPaper = new QuestionPaper({
      Name: name,
      Year: year || null,
      UploadType: uploadType || 'excel',
      PdfUrl: pdfUrl,
      Questions: questions
    });

    await newPaper.save();
    res.status(201).json({ message: 'Paper uploaded successfully', paper: newPaper });
  } catch (error) {
    console.error('Upload Paper Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload paper' });
  }
};

// Get list of available papers
exports.getPapers = async (req, res) => {
  try {
    const papers = await QuestionPaper.find({}, 'Name Year UploadType PdfUrl createdAt');
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
};

// Get a specific paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.status(200).json(paper);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
};

// Submit a paper result
exports.submitPaperResult = async (req, res) => {
  try {
    const {
      paperId,
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
    } = req.body;

    const newResult = new PaperResult({
      PaperID: paperId,
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

    await newResult.save();
    res.status(201).json({ message: 'Paper result submitted successfully', result: newResult });
  } catch (error) {
    console.error('Submit Result Error:', error);
    res.status(500).json({ error: 'Failed to submit result' });
  }
};

// Get analytics/results for full papers
exports.getPaperAnalytics = async (req, res) => {
  try {
    const results = await PaperResult.find().populate('PaperID', 'Name Year').sort({ Date: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Delete a paper and its associated history
exports.deletePaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // If it's a PDF, delete the physical file
    if (paper.UploadType === 'pdf' && paper.PdfUrl) {
      const filePath = path.join(__dirname, '..', paper.PdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete all associated results (history)
    await PaperResult.deleteMany({ PaperID: paper._id });

    // Delete the paper itself
    await QuestionPaper.findByIdAndDelete(paper._id);

    res.status(200).json({ message: 'Paper and associated history deleted successfully' });
  } catch (error) {
    console.error('Delete Paper Error:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
};
