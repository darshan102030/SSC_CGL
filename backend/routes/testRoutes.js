const express = require('express');
const router = express.Router();
const { submitTest, getTestHistory, getTestAnalysis, clearHistory } = require('../controllers/testController');

router.post('/submit', submitTest);
router.get('/history', getTestHistory);
router.delete('/history/clear', clearHistory);
router.get('/:id', getTestAnalysis);

module.exports = router;
