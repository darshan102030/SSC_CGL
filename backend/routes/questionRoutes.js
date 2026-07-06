const express = require('express');
const router = express.Router();
const { uploadQuestions, getRandomQuestions, getAvailableYears } = require('../controllers/questionController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadQuestions);
router.get('/random', getRandomQuestions);
router.get('/years', getAvailableYears);

module.exports = router;
