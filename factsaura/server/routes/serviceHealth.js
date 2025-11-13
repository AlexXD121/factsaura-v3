const express = require('express');
const router = express.Router();
const {
  getServiceHealth,
  getServiceStatus,
  getRateLimitStatus,
  testServiceConnectivity,
  getUsageStatistics,
  resetRateLimits
} = require('../controllers/serviceHealthController');

/**
 * Service Health Routes
 * Endpoints for monitoring API service health and managing rate limits
 */

/**
 * @route GET /api/health
 * @desc Get overall service health status
 * @access Public
 */
router.get('/', getServiceHealth);

/**
 * @route GET /api/health/service/:service
 * @desc Get detailed status for a specific service
 * @access Public
 * @param {string} service - Service name (newsApi, reddit, gdelt, etc.)
 */
router.get('/service/:service', getServiceStatus);

/**
 * @route GET /api/health/rate-limits
 * @desc Get rate limit status for all services
 * @access Public
 */
router.get('/rate-limits', getRateLimitStatus);

/**
 * @route GET /api/health/test/:service
 * @desc Test connectivity to a specific service
 * @access Public
 * @param {string} service - Service name to test
 */
router.get('/test/:service', testServiceConnectivity);

/**
 * @route GET /api/health/usage
 * @desc Get API usage statistics
 * @access Public
 */
router.get('/usage', getUsageStatistics);

/**
 * @route POST /api/health/reset-rate-limits
 * @desc Reset rate limit counters (admin function)
 * @access Admin
 * @body {string} [service] - Optional specific service to reset
 */
router.post('/reset-rate-limits', resetRateLimits);

/**
 * @route GET /api/health/services
 * @desc Get list of all configured services
 * @access Public
 */
router.get('/services', (req, res) => {
  try {
    const { apiKeyManager } = require('../config/apiKeys');
    const services = Object.keys(apiKeyManager.keys).map(service => ({
      name: service,
      displayName: apiKeyManager.keys[service].service,
      available: apiKeyManager.isServiceAvailable(service),
      required: apiKeyManager.keys[service].required
    }));

    res.json({
      services,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting services list:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve services list',
      code: 'SERVICES_LIST_FAILED'
    });
  }
});

module.exports = router;