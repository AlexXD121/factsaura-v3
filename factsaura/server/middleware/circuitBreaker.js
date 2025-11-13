/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring service health and temporarily disabling failing services
 */

const { ServiceUnavailableError } = require('./errorHandlingMiddleware');

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.expectedErrors = options.expectedErrors || [];
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.requestCount = 0;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      stateChanges: [],
      lastReset: new Date()
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn, serviceName = 'Service') {
    this.stats.totalRequests++;
    this.requestCount++;

    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.logStateChange('HALF_OPEN', serviceName);
      } else {
        throw new ServiceUnavailableError(
          serviceName, 
          `Circuit breaker is OPEN. Service temporarily disabled due to repeated failures.`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(error, serviceName);
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  onSuccess(serviceName) {
    this.stats.totalSuccesses++;
    this.successCount++;
    
    if (this.state === 'HALF_OPEN') {
      // If we're in half-open state and got a success, close the circuit
      this.reset(serviceName);
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed request
   */
  onFailure(error, serviceName) {
    this.stats.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = new Date();

    // Don't count expected errors as failures
    if (this.isExpectedError(error)) {
      return;
    }

    if (this.state === 'HALF_OPEN') {
      // If we're in half-open state and got a failure, open the circuit
      this.trip(serviceName);
    } else if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      // If we've exceeded the failure threshold, open the circuit
      this.trip(serviceName);
    }
  }

  /**
   * Check if error is expected and shouldn't trigger circuit breaker
   */
  isExpectedError(error) {
    return this.expectedErrors.some(expectedError => {
      if (typeof expectedError === 'string') {
        return error.message.includes(expectedError);
      }
      if (expectedError instanceof RegExp) {
        return expectedError.test(error.message);
      }
      if (typeof expectedError === 'function') {
        return expectedError(error);
      }
      return false;
    });
  }

  /**
   * Trip the circuit breaker (open it)
   */
  trip(serviceName) {
    this.state = 'OPEN';
    this.logStateChange('OPEN', serviceName);
    console.warn(`🔴 Circuit breaker OPENED for ${serviceName} after ${this.failureCount} failures`);
  }

  /**
   * Reset the circuit breaker (close it)
   */
  reset(serviceName) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.logStateChange('CLOSED', serviceName);
    console.log(`🟢 Circuit breaker CLOSED for ${serviceName} - service recovered`);
  }

  /**
   * Check if we should attempt to reset the circuit breaker
   */
  shouldAttemptReset() {
    return this.lastFailureTime && 
           (Date.now() - this.lastFailureTime.getTime()) >= this.recoveryTimeout;
  }

  /**
   * Log state changes for monitoring
   */
  logStateChange(newState, serviceName) {
    this.stats.stateChanges.push({
      from: this.state,
      to: newState,
      timestamp: new Date(),
      service: serviceName,
      failureCount: this.failureCount,
      successCount: this.successCount
    });

    // Keep only last 100 state changes
    if (this.stats.stateChanges.length > 100) {
      this.stats.stateChanges = this.stats.stateChanges.slice(-100);
    }
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      recoveryTimeout: this.recoveryTimeout,
      nextRetryTime: this.lastFailureTime ? 
        new Date(this.lastFailureTime.getTime() + this.recoveryTimeout) : null,
      stats: {
        ...this.stats,
        failureRate: this.stats.totalRequests > 0 ? 
          (this.stats.totalFailures / this.stats.totalRequests) * 100 : 0,
        successRate: this.stats.totalRequests > 0 ? 
          (this.stats.totalSuccesses / this.stats.totalRequests) * 100 : 0
      }
    };
  }

  /**
   * Force reset the circuit breaker (for admin use)
   */
  forceReset(serviceName) {
    this.reset(serviceName);
    this.stats.totalRequests = 0;
    this.stats.totalFailures = 0;
    this.stats.totalSuccesses = 0;
    this.stats.lastReset = new Date();
    console.log(`🔄 Circuit breaker FORCE RESET for ${serviceName}`);
  }

  /**
   * Check if circuit breaker is healthy
   */
  isHealthy() {
    return this.state === 'CLOSED' || this.state === 'HALF_OPEN';
  }
}

/**
 * Circuit Breaker Manager for multiple services
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
    this.defaultOptions = {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 10000,
      expectedErrors: [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        /rate limit/i,
        /quota exceeded/i
      ]
    };
  }

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceName, options = {}) {
    if (!this.breakers.has(serviceName)) {
      const breakerOptions = { ...this.defaultOptions, ...options };
      this.breakers.set(serviceName, new CircuitBreaker(breakerOptions));
    }
    return this.breakers.get(serviceName);
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute(serviceName, fn, options = {}) {
    const breaker = this.getBreaker(serviceName, options);
    return await breaker.execute(fn, serviceName);
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus() {
    const status = {};
    for (const [serviceName, breaker] of this.breakers) {
      status[serviceName] = breaker.getStatus();
    }
    return status;
  }

  /**
   * Get health status of all services
   */
  getHealthStatus() {
    const health = {};
    for (const [serviceName, breaker] of this.breakers) {
      health[serviceName] = {
        healthy: breaker.isHealthy(),
        state: breaker.state,
        failureCount: breaker.failureCount,
        lastFailureTime: breaker.lastFailureTime
      };
    }
    return health;
  }

  /**
   * Force reset all circuit breakers
   */
  resetAll() {
    for (const [serviceName, breaker] of this.breakers) {
      breaker.forceReset(serviceName);
    }
  }

  /**
   * Force reset specific circuit breaker
   */
  reset(serviceName) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.forceReset(serviceName);
    }
  }
}

// Create singleton instance
const circuitBreakerManager = new CircuitBreakerManager();

module.exports = {
  CircuitBreaker,
  CircuitBreakerManager,
  circuitBreakerManager
};