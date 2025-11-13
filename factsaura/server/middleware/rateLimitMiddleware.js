/**
 * Enhanced Rate Limiting Middleware for FactSaura APIs
 * Provides comprehensive rate limiting with different tiers and error handling
 */

const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter with custom configuration
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests from this IP, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    handler = null,
    onLimitReached = null
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      }
    },
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    handler: handler || ((req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil(windowMs / 1000),
          limit: max,
          windowMs,
          timestamp: new Date().toISOString()
        }
      });
    }),
    // onLimitReached is deprecated in express-rate-limit v7
    // Logging is handled in the handler function instead
  });
}

/**
 * General API rate limiter (applies to all API endpoints)
 */
const generalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  message: 'Too many API requests from this IP, please try again later.',
  skipSuccessfulRequests: false
});

/**
 * Strict rate limiter for resource-intensive endpoints
 */
const strictApiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes per IP
  message: 'Too many requests to this resource-intensive endpoint, please try again later.',
  skipSuccessfulRequests: false
});

/**
 * AI analysis rate limiter (for AI-powered endpoints)
 */
const aiAnalysisLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 AI analysis requests per 10 minutes per IP
  message: 'Too many AI analysis requests, please try again later.',
  skipSuccessfulRequests: false,
  onLimitReached: (req, res, options) => {
    console.warn(`AI analysis rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
  }
});

/**
 * Content submission rate limiter
 */
const contentSubmissionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 content submissions per hour per IP
  message: 'Too many content submissions, please try again later.',
  skipSuccessfulRequests: false
});

/**
 * Search rate limiter
 */
const searchLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 300 search requests per 5 minutes per IP
  message: 'Too many search requests, please try again later.',
  skipSuccessfulRequests: true // Don't count failed searches
});

/**
 * External API rate limiter (for endpoints that call external APIs)
 */
const externalApiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // 500 external API calls per hour per IP
  message: 'Too many external API requests, please try again later.',
  skipSuccessfulRequests: false,
  onLimitReached: (req, res, options) => {
    console.warn(`External API rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
  }
});

/**
 * User-specific rate limiter (for authenticated users)
 */
function createUserRateLimiter(options = {}) {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    }
  });
}

/**
 * Authenticated user rate limiter
 */
const authenticatedUserLimiter = createUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes per authenticated user
  message: 'Too many requests from this account, please try again later.'
});

/**
 * Premium user rate limiter (higher limits for premium users)
 */
const premiumUserLimiter = createUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5000 requests per 15 minutes per premium user
  message: 'Too many requests from this premium account, please try again later.'
});

/**
 * Dynamic rate limiter based on user type
 */
function dynamicUserRateLimiter(req, res, next) {
  if (!req.user) {
    return generalApiLimiter(req, res, next);
  }

  // Check if user is premium/expert
  const isPremium = req.user.badges?.some(badge => 
    ['premium', 'expert', 'verified'].includes(badge.type)
  ) || req.user.is_expert || req.user.is_verified;

  if (isPremium) {
    return premiumUserLimiter(req, res, next);
  } else {
    return authenticatedUserLimiter(req, res, next);
  }
}

/**
 * Service-specific rate limiters
 */
const serviceRateLimiters = {
  newsApi: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 900, // Leave buffer for 1000/hour NewsAPI limit
    message: 'NewsAPI rate limit exceeded, please try again later.',
    keyGenerator: () => 'newsapi-global' // Global limit for NewsAPI
  }),

  reddit: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Conservative limit for Reddit API
    message: 'Reddit API rate limit exceeded, please try again later.',
    keyGenerator: () => 'reddit-global' // Global limit for Reddit API
  }),

  gdelt: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Conservative limit for GDELT API
    message: 'GDELT API rate limit exceeded, please try again later.',
    keyGenerator: () => 'gdelt-global' // Global limit for GDELT API
  }),

  janAi: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Conservative limit for local Jan AI
    message: 'Jan AI rate limit exceeded, please try again later.',
    keyGenerator: () => 'janai-global' // Global limit for Jan AI
  }),

  openai: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Conservative limit for OpenAI API
    message: 'OpenAI API rate limit exceeded, please try again later.',
    keyGenerator: () => 'openai-global' // Global limit for OpenAI API
  })
};

/**
 * Apply service-specific rate limiting
 */
function serviceRateLimit(serviceName) {
  return (req, res, next) => {
    const limiter = serviceRateLimiters[serviceName];
    if (!limiter) {
      console.warn(`No rate limiter configured for service: ${serviceName}`);
      return next();
    }
    return limiter(req, res, next);
  };
}

/**
 * Combined rate limiting middleware for external API endpoints
 */
function externalApiRateLimit(services = []) {
  return (req, res, next) => {
    // Apply general external API rate limiting first
    externalApiLimiter(req, res, (err) => {
      if (err) return next(err);
      
      // Then apply service-specific rate limiting
      let serviceIndex = 0;
      
      function applyNextServiceLimit() {
        if (serviceIndex >= services.length) {
          return next();
        }
        
        const service = services[serviceIndex++];
        const limiter = serviceRateLimiters[service];
        
        if (limiter) {
          limiter(req, res, (err) => {
            if (err) return next(err);
            applyNextServiceLimit();
          });
        } else {
          applyNextServiceLimit();
        }
      }
      
      applyNextServiceLimit();
    });
  };
}

/**
 * Rate limiting for crisis monitoring endpoints
 */
const crisisMonitoringLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10, // 10 crisis monitoring requests per 2 minutes per IP
  message: 'Too many crisis monitoring requests, please try again later.',
  skipSuccessfulRequests: false
});

/**
 * Rate limiting for trending content endpoints
 */
const trendingContentLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 trending content requests per 5 minutes per IP
  message: 'Too many trending content requests, please try again later.',
  skipSuccessfulRequests: true
});

/**
 * Bypass rate limiting for specific conditions
 */
function bypassRateLimit(condition) {
  return (req, res, next) => {
    if (typeof condition === 'function' && condition(req)) {
      return next();
    }
    if (typeof condition === 'boolean' && condition) {
      return next();
    }
    return next();
  };
}

/**
 * Rate limit bypass for admin users
 */
const adminBypass = bypassRateLimit((req) => {
  return req.user?.badges?.some(badge => badge.type === 'admin') || 
         req.user?.is_admin === true;
});

/**
 * Rate limit bypass for system health checks
 */
const healthCheckBypass = bypassRateLimit((req) => {
  return req.path === '/health' || req.path === '/api/health';
});

/**
 * Middleware to add rate limit information to response headers
 */
function addRateLimitHeaders(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Add custom rate limit headers
    res.set('X-RateLimit-Policy', 'FactSaura-API-v1');
    res.set('X-RateLimit-Endpoint', req.path);
    
    if (req.user) {
      res.set('X-RateLimit-User-Type', req.user.is_expert ? 'expert' : 'standard');
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

/**
 * Error handler for rate limiting errors
 */
function rateLimitErrorHandler(error, req, res, next) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message || 'Rate limit exceeded',
        retryAfter: error.retryAfter || 60,
        endpoint: req.path,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Wait before making another request',
          'Consider upgrading to premium for higher limits',
          'Use batch requests where possible'
        ]
      }
    });
  }
  
  next(error);
}

module.exports = {
  // Basic rate limiters
  generalApiLimiter,
  strictApiLimiter,
  aiAnalysisLimiter,
  contentSubmissionLimiter,
  searchLimiter,
  externalApiLimiter,
  
  // User-based rate limiters
  authenticatedUserLimiter,
  premiumUserLimiter,
  dynamicUserRateLimiter,
  
  // Service-specific rate limiters
  serviceRateLimit,
  serviceRateLimiters,
  externalApiRateLimit,
  
  // Specialized rate limiters
  crisisMonitoringLimiter,
  trendingContentLimiter,
  
  // Utility functions
  createRateLimiter,
  createUserRateLimiter,
  bypassRateLimit,
  adminBypass,
  healthCheckBypass,
  addRateLimitHeaders,
  rateLimitErrorHandler
};