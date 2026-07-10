const express = require('express');
const router = express.Router();
const { uploadQuestions, getRandomQuestions, getAvailableYears, getAvailableTopics, getAllQuestions, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadQuestions);
router.get('/random', getRandomQuestions);
router.get('/years', getAvailableYears);
router.get('/topics', getAvailableTopics);
router.get('/', getAllQuestions);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
