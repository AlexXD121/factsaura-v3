/**
 * GDELT API Integration Service
 * Provides real-time global news events and crisis monitoring
 * GDELT is completely free with no API key required
 */

const axios = require('axios');
const { apiKeyManager } = require('../config/apiKeys');

class GdeltApiService {
  constructor() {
    // Use API Key Manager for GDELT configuration
    this.config = apiKeyManager.getConfig('gdelt');
    this.baseUrl = 'https://api.gdeltproject.org/api/v2';
    
    // GDELT-specific configuration
    this.defaultLanguage = 'english';
    this.defaultFormat = 'json';
    this.defaultTimespan = '3days'; // 3 days of data
    
    // Crisis-related themes and events for monitoring
    this.crisisThemes = [
      'CRISIS', 'DISASTER', 'EMERGENCY', 'FLOOD', 'EARTHQUAKE', 'FIRE',
      'MEDICAL_EMERGENCY', 'EPIDEMIC', 'VIOLENCE', 'CONFLICT', 'TERRORISM',
      'MISINFORMATION', 'FAKE_NEWS', 'CONSPIRACY', 'SCAM', 'FRAUD'
    ];
    
    // Crisis-related keywords for content filtering
    this.crisisKeywords = (process.env.CRISIS_KEYWORDS || '').split(',').map(k => k.trim());
    
    // Countries of interest for crisis monitoring
    this.priorityCountries = ['US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP'];
  }

  /**
   * Check if we can make more API requests (rate limiting)
   */
  canMakeRequest() {
    return apiKeyManager.checkRateLimit('gdelt');
  }

  /**
   * Increment request counter
   */
  incrementRequestCount() {
    apiKeyManager.incrementRateLimit('gdelt');
  }

  /**
   * Handle API errors with proper error types
   */
  handleApiError(error, operation) {
    const { handleExternalServiceError } = require('../middleware/apiServiceErrorHandler');
    throw handleExternalServiceError(error, 'GDELT API', operation);
  }

  /**
   * Execute API request with comprehensive error handling and rate limiting
   */
  async executeWithErrorHandling(requestFn, operation) {
    const { executeApiRequest } = require('../middleware/apiServiceErrorHandler');
    
    return await executeApiRequest(
      requestFn,
      'GDELT API',
      operation,
      {
        timeout: 30000,
        retries: 3,
        retryDelay: 2000
      }
    );
  }

  /**
   * Get global news events from GDELT
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Global events with metadata
   */
  async getGlobalEvents(options = {}) {
    // Check rate limits using API Key Manager
    if (!apiKeyManager.checkRateLimit('gdelt')) {
      const status = apiKeyManager.getRateLimitStatus('gdelt');
      const { RateLimitError } = require('../middleware/errorHandlingMiddleware');
      throw new RateLimitError('GDELT API', Math.ceil((status.resetTime - new Date()) / 1000));
    }

    return await this.executeWithErrorHandling(async () => {
      const {
        query = '',
        timespan = this.defaultTimespan,
        maxrecords = 250,
        format = this.defaultFormat,
        mode = 'artlist', // artlist, timeline, wordcloud
        sort = 'hybridrel'
      } = options;

      const params = {
        query: query || 'crisis OR emergency OR breaking',
        mode,
        format,
        timespan,
        maxrecords,
        sort
      };

      const response = await axios.get(`${this.baseUrl}/doc/doc`, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'FactSaura/1.0.0 (Crisis Monitoring System)'
        }
      });

      // Increment rate limit counter after successful request
      apiKeyManager.incrementRateLimit('gdelt');

      return this.processGdeltResponse(response.data, 'events', options);
    }, 'global events fetch');
  }

  /**
   * Monitor crisis-related events globally
   * @returns {Promise<Object>} Crisis events with urgency scoring
   */
  async monitorCrisisEvents() {
    if (!this.canMakeRequest()) {
      console.warn('GDELT API rate limit exceeded for crisis monitoring');
      const { RateLimitError } = require('../middleware/errorHandlingMiddleware');
      const status = apiKeyManager.getRateLimitStatus('gdelt');
      throw new RateLimitError('GDELT API', Math.ceil((status.resetTime - new Date()) / 1000));
    }

    try {
      return await this.executeWithErrorHandling(async () => {
        // Build crisis query from keywords and themes
        const crisisQuery = [
          ...this.crisisKeywords.filter(k => k),
          'emergency', 'breaking', 'alert', 'crisis', 'disaster'
        ].join(' OR ');

        this.incrementRequestCount();

        const params = {
          query: crisisQuery,
          mode: 'artlist',
          format: 'json',
          timespan: '1day', // Last 24 hours for crisis monitoring
          maxrecords: 500,
          sort: 'hybridrel'
        };

        const response = await axios.get(`${this.baseUrl}/doc/doc`, {
          params,
          timeout: 30000,
          headers: {
            'User-Agent': 'FactSaura/1.0.0 (Crisis Monitoring System)'
          }
        });

        const processedResponse = this.processGdeltResponse(response.data, 'crisis');
        
        // Add crisis urgency scoring
        processedResponse.events = processedResponse.events.map(event => ({
          ...event,
          crisisScore: this.calculateCrisisScore(event),
          urgencyLevel: this.determineUrgencyLevel(event),
          geographicRelevance: this.calculateGeographicRelevance(event)
        }));

        // Sort by crisis score
        processedResponse.events.sort((a, b) => b.crisisScore - a.crisisScore);

        return processedResponse;
      }, 'crisis monitoring');
    } catch (error) {
      console.error('GDELT crisis monitoring error:', error);
      // For monitoring endpoints, provide graceful degradation
      return { 
        events: [], 
        metadata: { 
          source: 'gdelt', 
          type: 'crisis', 
          error: error.message,
          degraded: true
        } 
      };
    }
  }

  /**
   * Get trending topics and themes
   * @param {Object} options - Options for trending analysis
   * @returns {Promise<Object>} Trending topics with metadata
   */
  async getTrendingTopics(options = {}) {
    if (!this.canMakeRequest()) {
      throw new Error('GDELT API rate limit exceeded. Try again later.');
    }

    try {
      const {
        timespan = '1day',
        maxrecords = 100,
        sourcecountry = '',
        theme = ''
      } = options;

      this.incrementRequestCount();

      const params = {
        query: theme || 'trending OR viral OR breaking',
        mode: 'timeline',
        format: 'json',
        timespan,
        maxrecords,
        sourcecountry
      };

      const response = await axios.get(`${this.baseUrl}/doc/doc`, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'FactSaura/1.0.0 (Trending Analysis System)'
        }
      });

      return this.processGdeltResponse(response.data, 'trending', options);
    } catch (error) {
      console.error('GDELT trending topics error:', error);
      this.handleApiError(error, 'trending topics fetch');
    }
  }

  /**
   * Search for specific events or topics
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with metadata
   */
  async searchEvents(query, options = {}) {
    if (!this.canMakeRequest()) {
      throw new Error('GDELT API rate limit exceeded. Try again later.');
    }

    try {
      const {
        timespan = this.defaultTimespan,
        maxrecords = 250,
        mode = 'artlist',
        sort = 'hybridrel',
        sourcecountry = '',
        sourcelang = this.defaultLanguage
      } = options;

      this.incrementRequestCount();

      const params = {
        query,
        mode,
        format: this.defaultFormat,
        timespan,
        maxrecords,
        sort,
        sourcecountry,
        sourcelang
      };

      const response = await axios.get(`${this.baseUrl}/doc/doc`, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'FactSaura/1.0.0 (Event Search System)'
        }
      });

      return this.processGdeltResponse(response.data, 'search', { query, ...options });
    } catch (error) {
      console.error('GDELT search error:', error);
      this.handleApiError(error, 'search events');
    }
  }

  /**
   * Get geographic event distribution
   * @param {Object} options - Geographic options
   * @returns {Promise<Object>} Geographic event data
   */
  async getGeographicEvents(options = {}) {
    if (!this.canMakeRequest()) {
      throw new Error('GDELT API rate limit exceeded. Try again later.');
    }

    try {
      const {
        query = 'crisis OR emergency',
        timespan = '1day',
        maxrecords = 500
      } = options;

      this.incrementRequestCount();

      const params = {
        query,
        mode: 'artlist',
        format: 'json',
        timespan,
        maxrecords,
        sort: 'hybridrel'
      };

      const response = await axios.get(`${this.baseUrl}/doc/doc`, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'FactSaura/1.0.0 (Geographic Analysis System)'
        }
      });

      const processedResponse = this.processGdeltResponse(response.data, 'geographic', options);
      
      // Add geographic analysis
      processedResponse.geographicDistribution = this.analyzeGeographicDistribution(processedResponse.events);
      
      return processedResponse;
    } catch (error) {
      console.error('GDELT geographic events error:', error);
      this.handleApiError(error, 'geographic events fetch');
    }
  }

  /**
   * Process GDELT API response and add metadata
   * @param {Object} response - Raw GDELT response
   * @param {string} type - Type of request
   * @param {Object} context - Request context
   * @returns {Object} Processed response with metadata
   */
  processGdeltResponse(response, type, context = {}) {
    if (!response || !response.articles) {
      return {
        events: [],
        metadata: {
          source: 'gdelt',
          type,
          context,
          error: 'No articles found in response',
          timestamp: new Date().toISOString()
        }
      };
    }

    const processedEvents = response.articles.map(article => ({
      id: this.generateEventId(article),
      title: article.title,
      content: article.content || article.title,
      url: article.url,
      urlToImage: article.socialimage || null,
      publishedAt: article.seendate,
      source: {
        name: article.domain,
        url: article.url,
        country: article.sourcecountry,
        language: article.sourcelang
      },
      location: {
        country: article.sourcecountry,
        coordinates: this.parseCoordinates(article)
      },
      tone: {
        score: parseFloat(article.tone) || 0,
        positive: parseFloat(article.tone) > 0,
        negative: parseFloat(article.tone) < 0,
        neutral: parseFloat(article.tone) === 0
      },
      themes: this.extractThemes(article),
      // Add FactSaura-specific metadata
      detectedAt: new Date().toISOString(),
      platform: 'gdelt',
      contentType: 'global_event',
      language: article.sourcelang || 'en',
      wordCount: article.content ? article.content.split(' ').length : article.title.split(' ').length,
      socialMetrics: {
        socialImage: article.socialimage || null,
        domain: article.domain,
        seenDate: article.seendate
      }
    }));

    return {
      events: processedEvents,
      metadata: {
        source: 'gdelt',
        type,
        context,
        totalResults: response.articles.length,
        retrievedCount: processedEvents.length,
        timestamp: new Date().toISOString(),
        requestsRemaining: this.maxRequestsPerMinute - this.requestCount,
        timespan: context.timespan || this.defaultTimespan
      }
    };
  }

  /**
   * Calculate crisis score for an event
   * @param {Object} event - GDELT event
   * @returns {number} Crisis score (0-1)
   */
  calculateCrisisScore(event) {
    let score = 0;
    const text = `${event.title} ${event.content || ''}`.toLowerCase();
    
    // Check for crisis keywords
    const crisisMatches = this.crisisKeywords.filter(keyword => 
      keyword && text.includes(keyword.toLowerCase())
    ).length;
    
    score += Math.min(crisisMatches * 0.15, 0.45); // Max 0.45 from keywords
    
    // Tone analysis (negative tone indicates potential crisis)
    if (event.tone.negative && Math.abs(event.tone.score) > 5) {
      score += 0.2;
    } else if (event.tone.negative && Math.abs(event.tone.score) > 2) {
      score += 0.1;
    }
    
    // Crisis themes boost
    const crisisThemeMatches = event.themes.filter(theme => 
      this.crisisThemes.some(crisisTheme => 
        theme.toUpperCase().includes(crisisTheme)
      )
    ).length;
    
    score += Math.min(crisisThemeMatches * 0.1, 0.3);
    
    // Recent events get higher crisis scores
    const hoursOld = (Date.now() - new Date(event.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 1) score += 0.15;
    else if (hoursOld < 6) score += 0.1;
    else if (hoursOld < 24) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  /**
   * Determine urgency level based on crisis score
   * @param {Object} event - GDELT event
   * @returns {string} Urgency level
   */
  determineUrgencyLevel(event) {
    const score = event.crisisScore || this.calculateCrisisScore(event);
    
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate geographic relevance
   * @param {Object} event - GDELT event
   * @returns {Object} Geographic relevance data
   */
  calculateGeographicRelevance(event) {
    const country = event.location.country;
    const isPriorityCountry = this.priorityCountries.includes(country);
    
    return {
      country,
      isPriorityCountry,
      relevanceScore: isPriorityCountry ? 0.8 : 0.5,
      region: this.getRegionFromCountry(country)
    };
  }

  /**
   * Analyze geographic distribution of events
   * @param {Array} events - Array of events
   * @returns {Object} Geographic distribution analysis
   */
  analyzeGeographicDistribution(events) {
    const countryCount = {};
    const regionCount = {};
    
    events.forEach(event => {
      const country = event.location.country;
      const region = event.geographicRelevance?.region || 'Unknown';
      
      countryCount[country] = (countryCount[country] || 0) + 1;
      regionCount[region] = (regionCount[region] || 0) + 1;
    });
    
    return {
      byCountry: Object.entries(countryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      byRegion: Object.entries(regionCount)
        .sort(([,a], [,b]) => b - a),
      totalCountries: Object.keys(countryCount).length,
      totalRegions: Object.keys(regionCount).length
    };
  }

  /**
   * Extract themes from GDELT article
   * @param {Object} article - GDELT article
   * @returns {Array} Array of themes
   */
  extractThemes(article) {
    // GDELT doesn't always provide themes in the basic API
    // We'll extract them from the content and title
    const text = `${article.title} ${article.content || ''}`.toLowerCase();
    const detectedThemes = [];
    
    this.crisisThemes.forEach(theme => {
      if (text.includes(theme.toLowerCase().replace('_', ' '))) {
        detectedThemes.push(theme);
      }
    });
    
    return detectedThemes;
  }

  /**
   * Parse coordinates from GDELT article
   * @param {Object} article - GDELT article
   * @returns {Object} Coordinates object
   */
  parseCoordinates(article) {
    // GDELT basic API doesn't always include coordinates
    // Return null for now, could be enhanced with geocoding
    return {
      latitude: null,
      longitude: null
    };
  }

  /**
   * Get region from country code
   * @param {string} country - Country code
   * @returns {string} Region name
   */
  getRegionFromCountry(country) {
    const regionMap = {
      'US': 'North America',
      'CA': 'North America',
      'MX': 'North America',
      'GB': 'Europe',
      'DE': 'Europe',
      'FR': 'Europe',
      'IT': 'Europe',
      'ES': 'Europe',
      'IN': 'Asia',
      'CN': 'Asia',
      'JP': 'Asia',
      'KR': 'Asia',
      'AU': 'Oceania',
      'NZ': 'Oceania',
      'BR': 'South America',
      'AR': 'South America',
      'ZA': 'Africa',
      'NG': 'Africa',
      'EG': 'Africa'
    };
    
    return regionMap[country] || 'Other';
  }

  /**
   * Generate unique event ID
   * @param {Object} article - GDELT article
   * @returns {string} Unique ID
   */
  generateEventId(article) {
    const urlHash = article.url ? article.url.split('/').pop() : '';
    const titleHash = article.title ? article.title.replace(/\s+/g, '-').toLowerCase() : '';
    const timestamp = new Date(article.seendate).getTime();
    
    return `gdelt-${timestamp}-${titleHash}-${urlHash}`.substring(0, 100);
  }

  /**
   * Get service health and status
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      service: 'GDELT API',
      status: 'configured', // GDELT is always available (no API key required)
      apiKey: 'not_required',
      requestsUsed: this.requestCount,
      requestsRemaining: this.maxRequestsPerMinute - this.requestCount,
      rateLimitReset: new Date(this.lastReset + 60 * 1000).toISOString(),
      crisisThemesCount: this.crisisThemes.length,
      crisisKeywordsCount: this.crisisKeywords.length,
      priorityCountriesCount: this.priorityCountries.length,
      baseUrl: this.baseUrl
    };
  }

  /**
   * Test GDELT API connection
   * @returns {Promise<Object>} Test results
   */
  async testConnection() {
    try {
      if (!this.canMakeRequest()) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          status: 'rate_limited'
        };
      }

      // Test with a simple query
      this.incrementRequestCount();
      
      const response = await axios.get(`${this.baseUrl}/doc/doc`, {
        params: {
          query: 'test',
          mode: 'artlist',
          format: 'json',
          timespan: '1day',
          maxrecords: 1
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'FactSaura/1.0.0 (Connection Test)'
        }
      });

      return {
        success: true,
        status: 'connected',
        eventsFound: response.data.articles ? response.data.articles.length : 0,
        message: 'GDELT API connection successful',
        responseTime: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'connection_failed'
      };
    }
  }
}

module.exports = GdeltApiService;