/**
 * Centralized API Service Error Handler
 * Provides consistent error handling across all external API services
 */

const { 
  ExternalAPIError, 
  RateLimitError, 
  ServiceUnavailableError, 
  TimeoutError,
  ValidationError 
} = require('./errorHandlingMiddleware');

/**
 * Generic API error handler for external services
 * @param {Error} error - The original error
 * @param {string} serviceName - Name of the service (e.g., 'NewsAPI', 'Reddit API')
 * @param {string} operation - The operation being performed
 * @returns {Error} Enhanced error with proper type
 */
function handleExternalServiceError(error, serviceName, operation) {
  // Handle HTTP response errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 400:
        return new ValidationError(`${serviceName}: Invalid request parameters for ${operation}`);
      case 401:
        return new ExternalAPIError(serviceName, 'Invalid API credentials or expired token');
      case 403:
        return new ExternalAPIError(serviceName, 'API access forbidden - check permissions');
      case 404:
        return new ExternalAPIError(serviceName, 'API endpoint not found');
      case 429:
        const retryAfter = error.response.headers['retry-after'] || 60;
        return new RateLimitError(serviceName, parseInt(retryAfter));
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServiceUnavailableError(serviceName, `Service temporarily unavailable during ${operation}`);
      default:
        return new ExternalAPIError(serviceName, `${operation} failed: ${message}`);
    }
  }
  
  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new ServiceUnavailableError(serviceName, `Cannot connect to ${serviceName} service`);
  }
  
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    return new TimeoutError(`${serviceName} ${operation}`, error.timeout || 30000);
  }
  
  // Handle service-specific errors
  if (error.message && error.message.includes('Invalid grant')) {
    return new ExternalAPIError(serviceName, 'Invalid user credentials - check username/password');
  }
  
  if (error.message && error.message.includes('Unauthorized')) {
    return new ExternalAPIError(serviceName, 'Unauthorized - check client credentials');
  }
  
  // Generic error fallback
  return new ExternalAPIError(serviceName, `${operation} failed: ${error.message}`);
}

/**
 * Rate limit checker with consistent interface
 * @param {Object} apiKeyManager - API key manager instance
 * @param {string} serviceName - Service name for rate limiting
 * @returns {boolean} Whether request can be made
 */
function canMakeRequest(apiKeyManager, serviceName) {
  try {
    return apiKeyManager.checkRateLimit(serviceName);
  } catch (error) {
    console.warn(`Rate limit check failed for ${serviceName}:`, error.message);
    return false;
  }
}

/**
 * Increment rate limit counter with error handling
 * @param {Object} apiKeyManager - API key manager instance
 * @param {string} serviceName - Service name for rate limiting
 */
function incrementRequestCount(apiKeyManager, serviceName) {
  try {
    apiKeyManager.incrementRateLimit(serviceName);
  } catch (error) {
    console.warn(`Rate limit increment failed for ${serviceName}:`, error.message);
  }
}

/**
 * Check service availability with consistent interface
 * @param {Object} apiKeyManager - API key manager instance
 * @param {string} serviceName - Service name to check
 * @returns {boolean} Whether service is available
 */
function isServiceAvailable(apiKeyManager, serviceName) {
  try {
    return apiKeyManager.isServiceAvailable(serviceName);
  } catch (error) {
    console.warn(`Service availability check failed for ${serviceName}:`, error.message);
    return false;
  }
}

/**
 * Get rate limit status with error handling
 * @param {Object} apiKeyManager - API key manager instance
 * @param {string} serviceName - Service name
 * @returns {Object} Rate limit status
 */
function getRateLimitStatus(apiKeyManager, serviceName) {
  try {
    return apiKeyManager.getRateLimitStatus(serviceName);
  } catch (error) {
    console.warn(`Rate limit status check failed for ${serviceName}:`, error.message);
    return {
      requestsUsed: 0,
      requestsRemaining: 0,
      resetTime: new Date().toISOString(),
      rateLimited: true
    };
  }
}

/**
 * Execute API request with comprehensive error handling
 * @param {Function} requestFn - Function that makes the API request
 * @param {string} serviceName - Name of the service
 * @param {string} operation - Operation being performed
 * @param {Object} options - Options for error handling
 * @returns {Promise} Request result or throws enhanced error
 */
async function executeApiRequest(requestFn, serviceName, operation, options = {}) {
  const { 
    timeout = 30000,
    retries = 3,
    retryDelay = 1000 
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Execute request with timeout
      const result = await Promise.race([
        requestFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${operation} timed out after ${timeout}ms`)), timeout)
        )
      ]);
      
      return result;
    } catch (error) {
      lastError = handleExternalServiceError(error, serviceName, operation);
      
      // Don't retry on certain errors
      if (isNonRetryableError(error) || attempt === retries) {
        break;
      }
      
      // Wait before retry with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.warn(`${serviceName} ${operation} attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Check if error should not be retried
 * @param {Error} error - The error to check
 * @returns {boolean} Whether error should not be retried
 */
function isNonRetryableError(error) {
  const nonRetryableCodes = [
    'ENOTFOUND', // DNS resolution failed
    'ECONNREFUSED' // Connection refused
  ];
  
  return nonRetryableCodes.includes(error.code) || 
         (error.response && error.response.status >= 400 && error.response.status < 500);
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a standardized service status object
 * @param {string} serviceName - Name of the service
 * @param {Object} config - Service configuration
 * @param {Object} rateLimit - Rate limit information
 * @returns {Object} Service status
 */
function createServiceStatus(serviceName, config, rateLimit = {}) {
  return {
    service: serviceName,
    status: config.available ? 'configured' : 'not_configured',
    apiKey: config.hasValidKey ? 'present' : 'missing',
    requestsUsed: rateLimit.requestsUsed || 0,
    requestsRemaining: rateLimit.requestsRemaining || 0,
    rateLimitReset: rateLimit.resetTime || new Date().toISOString(),
    lastChecked: new Date().toISOString()
  };
}

/**
 * Test service connection with standardized response
 * @param {Function} testFn - Function that tests the connection
 * @param {string} serviceName - Name of the service
 * @returns {Promise<Object>} Test results
 */
async function testServiceConnection(testFn, serviceName) {
  try {
    const result = await testFn();
    return {
      success: true,
      status: 'connected',
      service: serviceName,
      message: `${serviceName} connection successful`,
      ...result
    };
  } catch (error) {
    return {
      success: false,
      status: 'connection_failed',
      service: serviceName,
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR'
    };
  }
}

module.exports = {
  handleExternalServiceError,
  canMakeRequest,
  incrementRequestCount,
  isServiceAvailable,
  getRateLimitStatus,
  executeApiRequest,
  isNonRetryableError,
  sleep,
  createServiceStatus,
  testServiceConnection
};