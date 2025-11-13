/**
 * GDELT API Routes
 * Routes for GDELT (Global Database of Events, Language, and Tone) integration endpoints
 */

const express = require('express');
const router = express.Router();
const gdeltApiController = require('../controllers/gdeltApiController');
const { requireGDELTAPI } = require('../middleware/apiKeyMiddleware');
const { 
  externalApiRateLimit, 
  crisisMonitoringLimiter, 
  searchLimiter,
  trendingContentLimiter,
  healthCheckBypass 
} = require('../middleware/rateLimitMiddleware');
const { asyncErrorHandler } = require('../middleware/errorHandlingMiddleware');

// GET /api/gdelt/events - Get global events
router.get('/events', 
  externalApiRateLimit(['gdelt']), 
  requireGDELTAPI, 
  asyncErrorHandler(gdeltApiController.getGlobalEvents.bind(gdeltApiController))
);

// GET /api/gdelt/crisis - Monitor crisis-related events
router.get('/crisis', 
  crisisMonitoringLimiter,
  externalApiRateLimit(['gdelt']), 
  requireGDELTAPI, 
  asyncErrorHandler(gdeltApiController.monitorCrisisEvents.bind(gdeltApiController))
);

// GET /api/gdelt/trending - Get trending topics and themes
router.get('/trending', 
  trendingContentLimiter,
  externalApiRateLimit(['gdelt']), 
  requireGDELTAPI, 
  asyncErrorHandler(gdeltApiController.getTrendingTopics.bind(gdeltApiController))
);

// GET /api/gdelt/search - Search for specific events or topics
router.get('/search', 
  searchLimiter,
  externalApiRateLimit(['gdelt']), 
  requireGDELTAPI, 
  asyncErrorHandler(gdeltApiController.searchEvents.bind(gdeltApiController))
);

// GET /api/gdelt/geographic - Get geographic event distribution
router.get('/geographic', 
  externalApiRateLimit(['gdelt']),
  asyncErrorHandler(gdeltApiController.getGeographicEvents.bind(gdeltApiController))
);

// GET /api/gdelt/status - Get service status and health
router.get('/status', 
  healthCheckBypass,
  asyncErrorHandler(gdeltApiController.getServiceStatus.bind(gdeltApiController))
);

// GET /api/gdelt/test - Test GDELT API connection
router.get('/test', 
  externalApiRateLimit(['gdelt']),
  asyncErrorHandler(gdeltApiController.testConnection.bind(gdeltApiController))
);

module.exports = router;