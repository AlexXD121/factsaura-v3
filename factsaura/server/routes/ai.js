const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { 
  aiAnalysisLimiter, 
  externalApiRateLimit 
} = require('../middleware/rateLimitMiddleware');
const { asyncErrorHandler } = require('../middleware/errorHandlingMiddleware');

// AI routes with rate limiting and error handling
router.post('/analyze', 
  aiAnalysisLimiter,
  externalApiRateLimit(['janAi']),
  asyncErrorHandler(aiController.analyzeContent)
);

router.post('/chat', 
  aiAnalysisLimiter,
  externalApiRateLimit(['janAi']),
  asyncErrorHandler(aiController.chatWithAI)
);

router.get('/confidence/:postId', 
  asyncErrorHandler(aiController.getConfidenceBreakdown)
);

module.exports = router;