const { apiKeyManager } = require('../config/apiKeys');

/**
 * Service Health Controller
 * Provides endpoints for monitoring API service health and status
 */

/**
 * Get overall service health status
 */
async function getServiceHealth(req, res) {
  try {
    const health = apiKeyManager.getServiceHealth();
    const availableServices = apiKeyManager.getAvailableServices();
    
    // Calculate overall health score
    const totalServices = Object.keys(health).length;
    const availableCount = availableServices.length;
    const requiredServices = Object.values(health).filter(s => s.required);
    const availableRequiredCount = requiredServices.filter(s => s.available).length;
    
    const overallHealth = {
      status: availableRequiredCount === requiredServices.length ? 'healthy' : 'degraded',
      score: Math.round((availableCount / totalServices) * 100),
      timestamp: new Date().toISOString(),
      services: health,
      summary: {
        total: totalServices,
        available: availableCount,
        required: requiredServices.length,
        requiredAvailable: availableRequiredCount
      }
    };

    res.json(overallHealth);
  } catch (error) {
    console.error('Error getting service health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve service health',
      code: 'HEALTH_CHECK_FAILED'
    });
  }
}

/**
 * Get detailed status for a specific service
 */
async function getServiceStatus(req, res) {
  try {
    const { service } = req.params;
    
    if (!apiKeyManager.keys[service]) {
      return res.status(404).json({
        error: 'Service Not Found',
        message: `Service '${service}' is not configured`,
        code: 'SERVICE_NOT_FOUND'
      });
    }

    const config = apiKeyManager.getConfig(service);
    const available = apiKeyManager.isServiceAvailable(service);
    const rateLimit = apiKeyManager.getRateLimitStatus(service);
    
    const status = {
      service: config.service,
      available,
      required: config.required,
      rateLimit,
      endpoints: config.endpoints || {},
      maskedKey: apiKeyManager.getMaskedKey(service),
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    console.error(`Error getting status for service ${req.params.service}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve service status',
      code: 'SERVICE_STATUS_FAILED'
    });
  }
}

/**
 * Get rate limit status for all services
 */
async function getRateLimitStatus(req, res) {
  try {
    const rateLimits = {};
    
    Object.keys(apiKeyManager.keys).forEach(service => {
      const status = apiKeyManager.getRateLimitStatus(service);
      if (!status.unlimited) {
        rateLimits[service] = {
          ...status,
          service: apiKeyManager.keys[service].service
        };
      }
    });

    res.json({
      timestamp: new Date().toISOString(),
      rateLimits
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve rate limit status',
      code: 'RATE_LIMIT_STATUS_FAILED'
    });
  }
}

/**
 * Test connectivity to a specific service
 */
async function testServiceConnectivity(req, res) {
  try {
    const { service } = req.params;
    
    if (!apiKeyManager.keys[service]) {
      return res.status(404).json({
        error: 'Service Not Found',
        message: `Service '${service}' is not configured`,
        code: 'SERVICE_NOT_FOUND'
      });
    }

    const config = apiKeyManager.getConfig(service);
    const available = apiKeyManager.isServiceAvailable(service);
    
    if (!available) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `Service '${service}' is not available (missing configuration)`,
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // Perform basic connectivity test based on service type
    let testResult = { connected: false, latency: null, error: null };
    const startTime = Date.now();

    try {
      switch (service) {
        case 'newsApi':
          // Test NewsAPI connectivity
          const newsResponse = await fetch(`${config.endpoints.sources}?apiKey=${config.key}`);
          testResult.connected = newsResponse.ok;
          testResult.statusCode = newsResponse.status;
          break;

        case 'reddit':
          // Test Reddit API connectivity (just check if we can reach the endpoint)
          const redditResponse = await fetch(config.endpoints.oauth, { method: 'HEAD' });
          testResult.connected = redditResponse.status !== 404;
          testResult.statusCode = redditResponse.status;
          break;

        case 'gdelt':
          // Test GDELT API connectivity
          const gdeltResponse = await fetch(`${config.endpoints.gkg}?query=test&mode=artlist&maxrecords=1&format=json`);
          testResult.connected = gdeltResponse.ok;
          testResult.statusCode = gdeltResponse.status;
          break;

        case 'janAi':
          // Test Jan AI connectivity
          const janResponse = await fetch(config.endpoints.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: config.model,
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            })
          });
          testResult.connected = janResponse.status !== 404;
          testResult.statusCode = janResponse.status;
          break;

        default:
          testResult.connected = true; // Assume available if configured
          testResult.statusCode = 200;
      }

      testResult.latency = Date.now() - startTime;
    } catch (error) {
      testResult.error = error.message;
      testResult.latency = Date.now() - startTime;
    }

    res.json({
      service: config.service,
      testResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error testing connectivity for service ${req.params.service}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to test service connectivity',
      code: 'CONNECTIVITY_TEST_FAILED'
    });
  }
}

/**
 * Get API usage statistics
 */
async function getUsageStatistics(req, res) {
  try {
    const stats = {};
    
    Object.keys(apiKeyManager.keys).forEach(service => {
      const config = apiKeyManager.keys[service];
      const rateLimit = apiKeyManager.getRateLimitStatus(service);
      
      if (!rateLimit.unlimited) {
        stats[service] = {
          service: config.service,
          used: rateLimit.current,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          period: rateLimit.period,
          usagePercentage: Math.round((rateLimit.current / rateLimit.limit) * 100),
          resetTime: rateLimit.resetTime
        };
      }
    });

    res.json({
      timestamp: new Date().toISOString(),
      statistics: stats
    });
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve usage statistics',
      code: 'USAGE_STATS_FAILED'
    });
  }
}

/**
 * Reset rate limit counters (admin function)
 */
async function resetRateLimits(req, res) {
  try {
    const { service } = req.body;
    
    if (service && !apiKeyManager.keys[service]) {
      return res.status(404).json({
        error: 'Service Not Found',
        message: `Service '${service}' is not configured`,
        code: 'SERVICE_NOT_FOUND'
      });
    }

    if (service) {
      // Reset specific service
      const config = apiKeyManager.keys[service];
      if (config.rateLimit) {
        config.rateLimit.current = 0;
        config.rateLimit.resetTime = apiKeyManager.calculateResetTime(config.rateLimit.period);
      }
    } else {
      // Reset all services
      Object.keys(apiKeyManager.keys).forEach(serviceName => {
        const config = apiKeyManager.keys[serviceName];
        if (config.rateLimit) {
          config.rateLimit.current = 0;
          config.rateLimit.resetTime = apiKeyManager.calculateResetTime(config.rateLimit.period);
        }
      });
    }

    res.json({
      message: service ? `Rate limits reset for ${service}` : 'All rate limits reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reset rate limits',
      code: 'RATE_LIMIT_RESET_FAILED'
    });
  }
}

module.exports = {
  getServiceHealth,
  getServiceStatus,
  getRateLimitStatus,
  testServiceConnectivity,
  getUsageStatistics,
  resetRateLimits
};