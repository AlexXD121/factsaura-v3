const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// AI routes (to be implemented in later tasks)
router.post('/analyze', aiController.analyzeContent);
router.post('/chat', aiController.chatWithAI);
router.get('/confidence/:postId', aiController.getConfidenceBreakdown);

module.exports = router;