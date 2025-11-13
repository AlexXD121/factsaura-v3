const { apiKeyManager } = require('../config/apiKeys');

/**
 * Middleware for API key validation and rate limiting
 */

/**
 * Validate that required services are available
 */
function validateRequiredServices(requiredServices = []) {
  return (req, res, next) => {
    const unavailableServices = requiredServices.filter(service => 
      !apiKeyManager.isServiceAvailable(service)
    );

    if (unavailableServices.length > 0) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `Required services not available: ${unavailableServices.join(', ')}`,
        unavailableServices,
        code: 'SERVICES_UNAVAILABLE'
      });
    }

    // Add available services to request object
    req.availableServices = apiKeyManager.getAvailableServices();
    next();
  };
}

/**
 * Check rate limits for specified services
 */
function checkRateLimit(services = []) {
  return (req, res, next) => {
    const rateLimitExceeded = [];

    services.forEach(service => {
      if (!apiKeyManager.checkRateLimit(service)) {
        const status = apiKeyManager.getRateLimitStatus(service);
        rateLimitExceeded.push({
          service,
          resetTime: status.resetTime
        });
      }
    });

    if (rateLimitExceeded.length > 0) {
      const resetTime = Math.max(...rateLimitExceeded.map(s => s.resetTime.getTime()));
      
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'API rate limit exceeded for one or more services',
        services: rateLimitExceeded,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // Store services to increment after successful request
    req.rateLimitServices = services;
    next();
  };
}

/**
 * Increment rate limit counters after successful request
 */
function incrementRateLimit(req, res, next) {
  // Only increment on successful responses
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode < 400 && req.rateLimitServices) {
      req.rateLimitServices.forEach(service => {
        apiKeyManager.incrementRateLimit(service);
      });
    }
    originalSend.call(this, data);
  };
  next();
}

/**
 * Add API service information to response headers
 */
function addServiceHeaders(services = []) {
  return (req, res, next) => {
    services.forEach(service => {
      const status = apiKeyManager.getRateLimitStatus(service);
      if (!status.unlimited) {
        res.set(`X-RateLimit-${service}-Limit`, status.limit);
        res.set(`X-RateLimit-${service}-Remaining`, status.remaining);
        res.set(`X-RateLimit-${service}-Reset`, Math.ceil(status.resetTime.getTime() / 1000));
      }
    });
    next();
  };
}

/**
 * Middleware to check service health
 */
function serviceHealthCheck(req, res, next) {
  const health = apiKeyManager.getServiceHealth();
  const criticalServicesDown = Object.entries(health)
    .filter(([service, status]) => status.required && !status.available)
    .map(([service]) => service);

  if (criticalServicesDown.length > 0) {
    return res.status(503).json({
      error: 'Critical Services Down',
      message: 'One or more critical services are unavailable',
      services: criticalServicesDown,
      health,
      code: 'CRITICAL_SERVICES_DOWN'
    });
  }

  req.serviceHealth = health;
  next();
}

/**
 * Get service configuration for a specific service
 */
function getServiceConfig(service) {
  return (req, res, next) => {
    try {
      const config = apiKeyManager.getConfig(service);
      req.serviceConfig = config;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid Service',
        message: error.message,
        code: 'INVALID_SERVICE'
      });
    }
  };
}

/**
 * Middleware factory for specific service requirements
 */
function requireServices(...services) {
  return [
    validateRequiredServices(services),
    checkRateLimit(services),
    addServiceHeaders(services),
    incrementRateLimit
  ];
}

/**
 * Middleware for NewsAPI endpoints
 */
const requireNewsAPI = requireServices('newsApi');

/**
 * Middleware for Reddit API endpoints
 */
const requireRedditAPI = requireServices('reddit');

/**
 * Middleware for GDELT API endpoints
 */
const requireGDELTAPI = requireServices('gdelt');

/**
 * Middleware for AI services (Jan AI + OpenAI fallback)
 */
const requireAIServices = [
  validateRequiredServices(['janAi']),
  checkRateLimit(['janAi', 'openai']),
  addServiceHeaders(['janAi', 'openai']),
  incrementRateLimit
];

/**
 * Middleware for Google Fact Check API
 */
const requireFactCheckAPI = requireServices('googleFactCheck');

/**
 * Error handler for API key related errors
 */
function apiKeyErrorHandler(error, req, res, next) {
  if (error.code === 'INVALID_API_KEY') {
    return res.status(401).json({
      error: 'Invalid API Key',
      message: 'The provided API key is invalid or expired',
      service: error.service,
      code: 'INVALID_API_KEY'
    });
  }

  if (error.code === 'API_KEY_QUOTA_EXCEEDED') {
    return res.status(429).json({
      error: 'Quota Exceeded',
      message: 'API key quota has been exceeded',
      service: error.service,
      resetTime: error.resetTime,
      code: 'API_KEY_QUOTA_EXCEEDED'
    });
  }

  next(error);
}

module.exports = {
  validateRequiredServices,
  checkRateLimit,
  incrementRateLimit,
  addServiceHeaders,
  serviceHealthCheck,
  getServiceConfig,
  requireServices,
  requireNewsAPI,
  requireRedditAPI,
  requireGDELTAPI,
  requireAIServices,
  requireFactCheckAPI,
  apiKeyErrorHandler
};