/**
 * NewsAPI Routes
 * Routes for NewsAPI.org integration endpoints
 */

const express = require('express');
const router = express.Router();
const newsApiController = require('../controllers/newsApiController');
const { requireNewsAPI } = require('../middleware/apiKeyMiddleware');
const { 
  externalApiRateLimit, 
  crisisMonitoringLimiter, 
  searchLimiter,
  healthCheckBypass 
} = require('../middleware/rateLimitMiddleware');
const { asyncErrorHandler } = require('../middleware/errorHandlingMiddleware');

// GET /api/news/trending - Get trending news articles
router.get('/trending', 
  externalApiRateLimit(['newsApi']), 
  requireNewsAPI, 
  asyncErrorHandler(newsApiController.getTrendingNews.bind(newsApiController))
);

// GET /api/news/search - Search news articles
router.get('/search', 
  searchLimiter,
  externalApiRateLimit(['newsApi']), 
  requireNewsAPI, 
  asyncErrorHandler(newsApiController.searchNews.bind(newsApiController))
);

// GET /api/news/crisis - Monitor crisis-related content
router.get('/crisis', 
  crisisMonitoringLimiter,
  externalApiRateLimit(['newsApi']), 
  requireNewsAPI, 
  asyncErrorHandler(newsApiController.monitorCrisisContent.bind(newsApiController))
);

// GET /api/news/status - Get service status and health
router.get('/status', 
  healthCheckBypass,
  asyncErrorHandler(newsApiController.getServiceStatus.bind(newsApiController))
);

// GET /api/news/test - Test NewsAPI connection
router.get('/test', 
  externalApiRateLimit(['newsApi']),
  asyncErrorHandler(newsApiController.testConnection.bind(newsApiController))
);

module.exports = router;