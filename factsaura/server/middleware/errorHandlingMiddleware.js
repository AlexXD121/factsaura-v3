/**
 * Comprehensive Error Handling Middleware for FactSaura APIs
 * Provides structured error responses and logging for different types of errors
 */

const config = require('../config');

/**
 * Custom error classes for different types of API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class ExternalAPIError extends APIError {
  constructor(service, message, originalError = null) {
    super(`${service} API Error: ${message}`, 502, 'EXTERNAL_API_ERROR', {
      service,
      originalError: originalError?.message
    });
    this.name = 'ExternalAPIError';
    this.service = service;
  }
}

class RateLimitError extends APIError {
  constructor(service, retryAfter = 60) {
    super(`Rate limit exceeded for ${service}`, 429, 'RATE_LIMIT_EXCEEDED', {
      service,
      retryAfter
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ServiceUnavailableError extends APIError {
  constructor(service, reason = 'Service temporarily unavailable') {
    super(`${service} is currently unavailable: ${reason}`, 503, 'SERVICE_UNAVAILABLE', {
      service,
      reason
    });
    this.name = 'ServiceUnavailableError';
  }
}

class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends APIError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', { resource });
    this.name = 'NotFoundError';
  }
}

class TimeoutError extends APIError {
  constructor(operation, timeout) {
    super(`Operation timed out: ${operation}`, 408, 'TIMEOUT_ERROR', {
      operation,
      timeout
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Error logger with different levels
 */
function logError(error, req, level = 'error') {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: config.nodeEnv === 'development' ? error.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: req.timestamp || new Date().toISOString()
    },
    details: error.details
  };

  switch (level) {
    case 'error':
      console.error('API Error:', JSON.stringify(logData, null, 2));
      break;
    case 'warn':
      console.warn('API Warning:', JSON.stringify(logData, null, 2));
      break;
    case 'info':
      console.info('API Info:', JSON.stringify(logData, null, 2));
      break;
    default:
      console.log('API Log:', JSON.stringify(logData, null, 2));
  }
}

/**
 * External API error handler
 */
function handleExternalAPIError(service, error, req) {
  logError(error, req, 'warn');
  
  // Map common external API errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        return new ExternalAPIError(service, 'Invalid API credentials');
      case 403:
        return new ExternalAPIError(service, 'API access forbidden');
      case 429:
        const retryAfter = error.response.headers['retry-after'] || 60;
        return new RateLimitError(service, parseInt(retryAfter));
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServiceUnavailableError(service, 'External service error');
      default:
        return new ExternalAPIError(service, message, error);
    }
  }
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new ServiceUnavailableError(service, 'Service connection failed');
  }
  
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    return new TimeoutError(`${service} API request`, error.timeout || 30000);
  }
  
  return new ExternalAPIError(service, error.message, error);
}

/**
 * Validation error handler
 */
function handleValidationError(error, req) {
  logError(error, req, 'info');
  
  const details = {};
  
  // Handle different validation error formats
  if (error.errors) {
    // Mongoose-style validation errors
    Object.keys(error.errors).forEach(field => {
      details[field] = error.errors[field].message;
    });
  } else if (error.details) {
    // Joi-style validation errors
    error.details.forEach(detail => {
      details[detail.path.join('.')] = detail.message;
    });
  }
  
  return new ValidationError('Validation failed', details);
}

/**
 * Database error handler
 */
function handleDatabaseError(error, req) {
  logError(error, req, 'error');
  
  // Handle common database errors
  if (error.code === '23505') { // PostgreSQL unique violation
    return new ValidationError('Duplicate entry found');
  }
  
  if (error.code === '23503') { // PostgreSQL foreign key violation
    return new ValidationError('Referenced record not found');
  }
  
  if (error.code === '23502') { // PostgreSQL not null violation
    return new ValidationError('Required field missing');
  }
  
  return new APIError('Database operation failed', 500, 'DATABASE_ERROR');
}

/**
 * AI service error handler
 */
function handleAIServiceError(error, req) {
  logError(error, req, 'warn');
  
  if (error.code === 'ECONNREFUSED') {
    return new ServiceUnavailableError('Jan AI', 'Local AI server not running');
  }
  
  if (error.response?.status === 429) {
    return new RateLimitError('AI Service', 60);
  }
  
  if (error.code === 'ETIMEDOUT') {
    return new TimeoutError('AI analysis', 30000);
  }
  
  return new ExternalAPIError('AI Service', error.message, error);
}

/**
 * Main error handling middleware
 */
function errorHandler(error, req, res, next) {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }
  
  let apiError = error;
  
  // Convert different error types to APIError
  if (!(error instanceof APIError)) {
    if (error.name === 'ValidationError') {
      apiError = handleValidationError(error, req);
    } else if (error.name === 'CastError' || error.name === 'MongoError') {
      apiError = handleDatabaseError(error, req);
    } else if (error.isAxiosError || error.response) {
      // Determine service from request path or error details
      const service = determineServiceFromRequest(req) || 'External API';
      apiError = handleExternalAPIError(service, error, req);
    } else if (error.code === 'ECONNREFUSED' && req.path.includes('/ai/')) {
      apiError = handleAIServiceError(error, req);
    } else {
      // Generic error
      logError(error, req, 'error');
      apiError = new APIError(
        config.nodeEnv === 'development' ? error.message : 'Internal server error',
        500,
        'INTERNAL_ERROR'
      );
    }
  } else {
    // Already an APIError, just log it
    logError(apiError, req, apiError.statusCode >= 500 ? 'error' : 'warn');
  }
  
  // Build error response
  const errorResponse = {
    error: {
      code: apiError.code,
      message: apiError.message,
      timestamp: apiError.timestamp,
      path: req.path,
      method: req.method
    }
  };
  
  // Add details in development or for client errors
  if (config.nodeEnv === 'development' || apiError.statusCode < 500) {
    if (apiError.details) {
      errorResponse.error.details = apiError.details;
    }
    
    if (config.nodeEnv === 'development' && apiError.stack) {
      errorResponse.error.stack = apiError.stack;
    }
  }
  
  // Add retry information for rate limits and service unavailable
  if (apiError.statusCode === 429) {
    errorResponse.error.retryAfter = apiError.retryAfter || 60;
    res.set('Retry-After', errorResponse.error.retryAfter);
  }
  
  if (apiError.statusCode === 503) {
    errorResponse.error.retryAfter = 300; // 5 minutes for service unavailable
    res.set('Retry-After', errorResponse.error.retryAfter);
  }
  
  // Add helpful suggestions for common errors
  errorResponse.error.suggestions = getErrorSuggestions(apiError);
  
  res.status(apiError.statusCode).json(errorResponse);
}

/**
 * Determine service from request path or headers
 */
function determineServiceFromRequest(req) {
  const path = req.path.toLowerCase();
  
  if (path.includes('/newsapi') || path.includes('/news')) return 'NewsAPI';
  if (path.includes('/reddit')) return 'Reddit API';
  if (path.includes('/gdelt')) return 'GDELT API';
  if (path.includes('/ai') || path.includes('/analyze')) return 'AI Service';
  if (path.includes('/factcheck')) return 'Fact Check API';
  
  return null;
}

/**
 * Get helpful suggestions for different error types
 */
function getErrorSuggestions(error) {
  const suggestions = [];
  
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      suggestions.push('Wait before making another request');
      suggestions.push('Consider upgrading to premium for higher limits');
      suggestions.push('Use batch requests where possible');
      break;
      
    case 'EXTERNAL_API_ERROR':
      suggestions.push('Check if the external service is operational');
      suggestions.push('Verify API credentials are correct');
      suggestions.push('Try again in a few minutes');
      break;
      
    case 'SERVICE_UNAVAILABLE':
      suggestions.push('The service is temporarily down');
      suggestions.push('Try again in a few minutes');
      suggestions.push('Check service status page');
      break;
      
    case 'VALIDATION_ERROR':
      suggestions.push('Check request parameters and format');
      suggestions.push('Ensure all required fields are provided');
      suggestions.push('Verify data types match expected format');
      break;
      
    case 'AUTHENTICATION_ERROR':
      suggestions.push('Provide a valid authentication token');
      suggestions.push('Check if your token has expired');
      suggestions.push('Ensure proper authorization header format');
      break;
      
    case 'TIMEOUT_ERROR':
      suggestions.push('The request took too long to complete');
      suggestions.push('Try with a smaller request size');
      suggestions.push('Check your network connection');
      break;
      
    default:
      suggestions.push('Check the API documentation');
      suggestions.push('Contact support if the issue persists');
  }
  
  return suggestions;
}

/**
 * Async error wrapper for route handlers
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Endpoint ${req.method} ${req.path}`);
  next(error);
}

/**
 * Request timeout middleware
 */
function requestTimeout(timeout = 30000) {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const error = new TimeoutError('Request processing', timeout);
      next(error);
    });
    next();
  };
}

/**
 * Error recovery middleware for external API failures
 */
function errorRecovery(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If this is an error response, add recovery information
    if (res.statusCode >= 400) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData.error) {
          parsedData.error.recovery = {
            canRetry: res.statusCode < 500 || res.statusCode === 503,
            retryDelay: getRetryDelay(res.statusCode),
            maxRetries: getMaxRetries(res.statusCode)
          };
          data = JSON.stringify(parsedData);
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

/**
 * Get recommended retry delay based on status code
 */
function getRetryDelay(statusCode) {
  switch (statusCode) {
    case 429: return 60; // Rate limit - wait 1 minute
    case 503: return 300; // Service unavailable - wait 5 minutes
    case 502:
    case 504: return 30; // Gateway errors - wait 30 seconds
    default: return 10; // Other errors - wait 10 seconds
  }
}

/**
 * Get maximum retry attempts based on status code
 */
function getMaxRetries(statusCode) {
  switch (statusCode) {
    case 429: return 3; // Rate limit - retry 3 times
    case 503: return 2; // Service unavailable - retry 2 times
    case 502:
    case 504: return 5; // Gateway errors - retry 5 times
    default: return 1; // Other errors - retry once
  }
}

module.exports = {
  // Error classes
  APIError,
  ValidationError,
  ExternalAPIError,
  RateLimitError,
  ServiceUnavailableError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  TimeoutError,
  
  // Error handlers
  errorHandler,
  handleExternalAPIError,
  handleValidationError,
  handleDatabaseError,
  handleAIServiceError,
  
  // Utility functions
  asyncErrorHandler,
  notFoundHandler,
  requestTimeout,
  errorRecovery,
  logError
};