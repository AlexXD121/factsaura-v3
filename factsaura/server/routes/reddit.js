/**
 * Reddit API Routes
 * Handles routing for Reddit API integration endpoints
 */

const express = require('express');
const router = express.Router();
const redditApiController = require('../controllers/redditApiController');
const { requireRedditAPI } = require('../middleware/apiKeyMiddleware');
const { 
  externalApiRateLimit, 
  crisisMonitoringLimiter, 
  searchLimiter,
  healthCheckBypass 
} = require('../middleware/rateLimitMiddleware');
const { asyncErrorHandler } = require('../middleware/errorHandlingMiddleware');

// Get trending posts from Reddit
router.get('/trending', 
  externalApiRateLimit(['reddit']), 
  requireRedditAPI, 
  asyncErrorHandler(redditApiController.getTrendingPosts)
);

// Search Reddit posts
router.get('/search', 
  searchLimiter,
  externalApiRateLimit(['reddit']), 
  requireRedditAPI, 
  asyncErrorHandler(redditApiController.searchPosts)
);

// Monitor crisis-related content
router.get('/crisis', 
  crisisMonitoringLimiter,
  externalApiRateLimit(['reddit']), 
  requireRedditAPI, 
  asyncErrorHandler(redditApiController.monitorCrisisContent)
);

// Get posts from specific subreddit
router.get('/subreddit/:name', 
  externalApiRateLimit(['reddit']), 
  requireRedditAPI, 
  asyncErrorHandler(redditApiController.getSubredditPosts)
);

// Get service status
router.get('/status', 
  healthCheckBypass,
  asyncErrorHandler(redditApiController.getServiceStatus)
);

// Test connection
router.get('/test', 
  externalApiRateLimit(['reddit']),
  asyncErrorHandler(redditApiController.testConnection)
);

module.exports = router;