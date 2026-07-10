const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paperController = require('../controllers/paperController');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'answerKey', maxCount: 1 }
]), paperController.uploadPaper);
router.get('/', paperController.getPapers);
router.get('/:id', paperController.getPaperById);
router.delete('/:id', paperController.deletePaper);
router.post('/result', paperController.submitPaperResult);
router.get('/analytics/all', paperController.getPaperAnalytics);

module.exports = router;
