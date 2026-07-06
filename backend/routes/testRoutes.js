const express = require('express');
const router = express.Router();
const { submitTest, getTestHistory, getTestAnalysis } = require('../controllers/testController');

router.post('/submit', submitTest);
router.get('/history', getTestHistory);
router.get('/:id', getTestAnalysis);

module.exports = router;
