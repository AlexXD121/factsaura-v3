require('dotenv').config();

/**
 * API Key Management System for FactSaura
 * Centralized management of all external API keys with validation and fallback handling
 */

class ApiKeyManager {
  constructor() {
    this.keys = {
      // News API Configuration
      newsApi: {
        key: process.env.NEWSAPI_KEY,
        required: true,
        service: 'NewsAPI.org',
        rateLimit: {
          requests: 1000,
          period: 'day',
          current: 0,
          resetTime: null
        },
        endpoints: {
          everything: 'https://newsapi.org/v2/everything',
          topHeadlines: 'https://newsapi.org/v2/top-headlines',
          sources: 'https://newsapi.org/v2/sources'
        }
      },

      // Reddit API Configuration
      reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
        userAgent: process.env.REDDIT_USER_AGENT,
        required: true,
        service: 'Reddit API',
        rateLimit: {
          requests: 60,
          period: 'minute',
          current: 0,
          resetTime: null
        },
        endpoints: {
          oauth: 'https://www.reddit.com/api/v1/access_token',
          api: 'https://oauth.reddit.com'
        }
      },

      // GDELT API Configuration (Free - No API key required)
      gdelt: {
        key: null, // GDELT is free and doesn't require API key
        required: false,
        service: 'GDELT Project',
        rateLimit: {
          requests: 100,
          period: 'minute',
          current: 0,
          resetTime: null
        },
        endpoints: {
          gkg: 'https://api.gdeltproject.org/api/v2/doc/doc',
          events: 'https://api.gdeltproject.org/api/v2/events/events',
          timeline: 'https://api.gdeltproject.org/api/v2/timeline/timeline'
        }
      },

      // Google Fact Check Tools API (Free tier)
      googleFactCheck: {
        key: process.env.GOOGLE_FACT_CHECK_API_KEY,
        required: false,
        service: 'Google Fact Check Tools',
        rateLimit: {
          requests: 1000,
          period: 'day',
          current: 0,
          resetTime: null
        },
        endpoints: {
          claims: 'https://factchecktools.googleapis.com/v1alpha1/claims:search'
        }
      },

      // Jan AI Configuration (Local)
      janAi: {
        host: process.env.JAN_AI_HOST || '127.0.0.1',
        port: process.env.JAN_AI_PORT || 1337,
        apiKey: process.env.JAN_AI_API_KEY,
        model: process.env.JAN_AI_MODEL || 'Meta-Llama-3_1-8B-Instruct-IQ4_XS',
        required: true,
        service: 'Jan AI (Local)',
        rateLimit: {
          requests: 1000,
          period: 'hour',
          current: 0,
          resetTime: null
        },
        endpoints: {
          chat: `http://${process.env.JAN_AI_HOST || '127.0.0.1'}:${process.env.JAN_AI_PORT || 1337}/v1/chat/completions`
        }
      },

      // OpenAI Fallback (Optional)
      openai: {
        key: process.env.OPENAI_API_KEY,
        required: false,
        service: 'OpenAI (Fallback)',
        rateLimit: {
          requests: 3000,
          period: 'minute',
          current: 0,
          resetTime: null
        },
        endpoints: {
          chat: 'https://api.openai.com/v1/chat/completions'
        }
      }
    };

    this.initializeRateLimits();
    this.validateKeys();
  }

  /**
   * Initialize rate limit tracking
   */
  initializeRateLimits() {
    Object.keys(this.keys).forEach(service => {
      const config = this.keys[service];
      if (config.rateLimit) {
        config.rateLimit.resetTime = this.calculateResetTime(config.rateLimit.period);
      }
    });
  }

  /**
   * Calculate when rate limits reset
   */
  calculateResetTime(period) {
    const now = new Date();
    switch (period) {
      case 'minute':
        return new Date(now.getTime() + 60 * 1000);
      case 'hour':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'day':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      default:
        return new Date(now.getTime() + 60 * 1000);
    }
  }

  /**
   * Validate all required API keys
   */
  validateKeys() {
    const missingKeys = [];
    const warnings = [];

    Object.entries(this.keys).forEach(([service, config]) => {
      if (config.required) {
        // Check for required keys
        if (service === 'reddit') {
          const requiredFields = ['clientId', 'clientSecret', 'username', 'password', 'userAgent'];
          const missing = requiredFields.filter(field => !config[field]);
          if (missing.length > 0) {
            missingKeys.push(`${service}: ${missing.join(', ')}`);
          }
        } else if (service === 'janAi') {
          if (!config.host || !config.port) {
            missingKeys.push(`${service}: host or port`);
          }
        } else if (!config.key) {
          missingKeys.push(service);
        }
      } else if (!config.key && service !== 'gdelt') {
        warnings.push(`${service}: Optional API key not configured`);
      }
    });

    if (missingKeys.length > 0) {
      console.error('❌ Missing required API keys:', missingKeys);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required API keys: ${missingKeys.join(', ')}`);
      }
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Optional API keys not configured:', warnings);
    }

    console.log('✅ API key validation completed');
  }

  /**
   * Get API key for a specific service
   */
  getKey(service) {
    const config = this.keys[service];
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }
    return config.key;
  }

  /**
   * Get full configuration for a service
   */
  getConfig(service) {
    const config = this.keys[service];
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }
    return { ...config };
  }

  /**
   * Check if service is available (has valid key)
   */
  isServiceAvailable(service) {
    const config = this.keys[service];
    if (!config) return false;
    
    if (service === 'gdelt') return true; // GDELT is always available (no key required)
    if (service === 'reddit') {
      return !!(config.clientId && config.clientSecret && config.username && config.password);
    }
    if (service === 'janAi') {
      return !!(config.host && config.port);
    }
    
    return !!config.key;
  }

  /**
   * Check rate limit for a service
   */
  checkRateLimit(service) {
    const config = this.keys[service];
    if (!config || !config.rateLimit) return true;

    const now = new Date();
    
    // Reset counter if time has passed
    if (now >= config.rateLimit.resetTime) {
      config.rateLimit.current = 0;
      config.rateLimit.resetTime = this.calculateResetTime(config.rateLimit.period);
    }

    return config.rateLimit.current < config.rateLimit.requests;
  }

  /**
   * Increment rate limit counter
   */
  incrementRateLimit(service) {
    const config = this.keys[service];
    if (config && config.rateLimit) {
      config.rateLimit.current++;
    }
  }

  /**
   * Get rate limit status for a service
   */
  getRateLimitStatus(service) {
    const config = this.keys[service];
    if (!config || !config.rateLimit) {
      return { unlimited: true };
    }

    return {
      current: config.rateLimit.current,
      limit: config.rateLimit.requests,
      period: config.rateLimit.period,
      resetTime: config.rateLimit.resetTime,
      remaining: config.rateLimit.requests - config.rateLimit.current
    };
  }

  /**
   * Get all available services
   */
  getAvailableServices() {
    return Object.keys(this.keys).filter(service => this.isServiceAvailable(service));
  }

  /**
   * Get service health status
   */
  getServiceHealth() {
    const health = {};
    
    Object.keys(this.keys).forEach(service => {
      const config = this.keys[service];
      health[service] = {
        available: this.isServiceAvailable(service),
        required: config.required,
        service: config.service,
        rateLimit: this.getRateLimitStatus(service)
      };
    });

    return health;
  }

  /**
   * Rotate API key for a service (for future use)
   */
  rotateKey(service, newKey) {
    const config = this.keys[service];
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }
    
    const oldKey = config.key;
    config.key = newKey;
    
    console.log(`🔄 API key rotated for ${service}`);
    return { oldKey, newKey };
  }

  /**
   * Get masked key for logging (security)
   */
  getMaskedKey(service) {
    const config = this.keys[service];
    if (!config || !config.key) return 'Not configured';
    
    const key = config.key;
    if (key.length <= 8) return '***';
    
    return key.substring(0, 4) + '***' + key.substring(key.length - 4);
  }

  /**
   * Log service status
   */
  logServiceStatus() {
    console.log('\n📊 API Service Status:');
    console.log('========================');
    
    Object.entries(this.keys).forEach(([service, config]) => {
      const available = this.isServiceAvailable(service);
      const status = available ? '✅' : '❌';
      const required = config.required ? '(Required)' : '(Optional)';
      const maskedKey = this.getMaskedKey(service);
      
      console.log(`${status} ${config.service} ${required}`);
      console.log(`   Key: ${maskedKey}`);
      
      if (config.rateLimit) {
        const rateStatus = this.getRateLimitStatus(service);
        console.log(`   Rate Limit: ${rateStatus.current}/${rateStatus.limit} per ${rateStatus.period}`);
      }
      console.log('');
    });
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

// Export both the class and instance
module.exports = {
  ApiKeyManager,
  apiKeyManager
};