/**
 * NewsAPI.org Integration Service
 * Provides real-time news monitoring and trending topic detection
 * Free tier: 1000 requests/day, 100 requests/hour
 */

const NewsAPI = require('newsapi');
const axios = require('axios');
const { apiKeyManager } = require('../config/apiKeys');

class NewsApiService {
  constructor() {
    // Use API Key Manager instead of direct environment access
    this.config = apiKeyManager.getConfig('newsApi');
    this.apiKey = this.config.key;
    this.baseUrl = 'https://newsapi.org/v2';
    
    // Only initialize NewsAPI if we have a valid API key
    if (apiKeyManager.isServiceAvailable('newsApi')) {
      this.newsapi = new NewsAPI(this.apiKey);
    } else {
      this.newsapi = null;
      console.warn('⚠️ NewsAPI service not available - missing API key');
    }
    
    // Crisis-related keywords for monitoring
    this.crisisKeywords = (process.env.CRISIS_KEYWORDS || '').split(',').map(k => k.trim());
    
    // Trusted news sources for credibility verification
    this.trustedSources = [
      'reuters', 'ap-news', 'bbc-news', 'cnn', 'the-guardian-uk',
      'the-new-york-times', 'the-washington-post', 'npr', 'abc-news',
      'cbs-news', 'nbc-news', 'fox-news', 'usa-today'
    ];
  }

  /**
   * Check if we can make more API requests (rate limiting)
   */
  canMakeRequest() {
    return apiKeyManager.checkRateLimit('newsApi');
  }

  /**
   * Increment request counter
   */
  incrementRequestCount() {
    apiKeyManager.incrementRateLimit('newsApi');
  }

  /**
   * Handle API errors with proper error types
   */
  handleApiError(error, operation) {
    const { handleExternalServiceError } = require('../middleware/apiServiceErrorHandler');
    throw handleExternalServiceError(error, 'NewsAPI', operation);
  }

  /**
   * Check service availability and rate limits
   */
  checkServiceAvailability() {
    if (!apiKeyManager.isServiceAvailable('newsApi')) {
      const { ServiceUnavailableError } = require('../middleware/errorHandlingMiddleware');
      throw new ServiceUnavailableError('NewsAPI', 'API key not configured');
    }
    
    if (!apiKeyManager.checkRateLimit('newsApi')) {
      const status = apiKeyManager.getRateLimitStatus('newsApi');
      const { RateLimitError } = require('../middleware/errorHandlingMiddleware');
      throw new RateLimitError('NewsAPI', Math.ceil((status.resetTime - new Date()) / 1000));
    }
    
    if (!this.newsapi) {
      const { ServiceUnavailableError } = require('../middleware/errorHandlingMiddleware');
      throw new ServiceUnavailableError('NewsAPI', 'Service not initialized');
    }
  }

  /**
   * Get trending news articles with crisis detection
   * @param {Object} options - Search options
   * @returns {Promise<Object>} News articles with metadata
   */
  async getTrendingNews(options = {}) {
    const { executeApiRequest } = require('../middleware/apiServiceErrorHandler');
    
    // Check service availability and rate limits
    this.checkServiceAvailability();

    const {
      country = 'us',
      category = 'general',
      pageSize = 20,
      page = 1
    } = options;

    return await executeApiRequest(
      async () => {
        const response = await this.newsapi.v2.topHeadlines({
          country,
          category,
          pageSize,
          page
        });

        // Increment rate limit counter after successful request
        apiKeyManager.incrementRateLimit('newsApi');

        return this.processNewsResponse(response, 'trending');
      },
      'NewsAPI',
      'trending news fetch',
      {
        timeout: 30000,
        retries: 3,
        retryDelay: 2000
      }
    );
  }

  /**
   * Search for specific news articles
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with metadata
   */
  async searchNews(query, options = {}) {
    const { executeApiRequest } = require('../middleware/apiServiceErrorHandler');
    
    // Check service availability and rate limits
    this.checkServiceAvailability();

    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      const { ValidationError } = require('../middleware/errorHandlingMiddleware');
      throw new ValidationError('Search query is required and must be a non-empty string');
    }

    const {
      sortBy = 'publishedAt',
      pageSize = 20,
      page = 1,
      from = null,
      to = null,
      sources = null
    } = options;

    return await executeApiRequest(
      async () => {
        this.incrementRequestCount();

        const response = await this.newsapi.v2.everything({
          q: query.trim(),
          sortBy,
          pageSize,
          page,
          from,
          to,
          sources: sources ? sources.join(',') : null
        });

        return this.processNewsResponse(response, 'search', query);
      },
      'NewsAPI',
      'news search',
      {
        timeout: 30000,
        retries: 2,
        retryDelay: 1500
      }
    );
  }

  /**
   * Monitor crisis-related content
   * @returns {Promise<Object>} Crisis-related articles
   */
  async monitorCrisisContent() {
    const { executeApiRequest } = require('../middleware/apiServiceErrorHandler');
    
    if (!this.newsapi) {
      return { 
        articles: [], 
        metadata: { 
          source: 'newsapi', 
          type: 'crisis', 
          error: 'NewsAPI not configured' 
        } 
      };
    }

    if (!this.canMakeRequest()) {
      console.warn('NewsAPI rate limit exceeded for crisis monitoring');
      return { articles: [], metadata: { source: 'newsapi', type: 'crisis', rateLimited: true } };
    }

    try {
      return await executeApiRequest(
        async () => {
          const crisisQuery = this.crisisKeywords.filter(k => k.trim()).join(' OR ') || 'breaking news emergency';
          
          this.incrementRequestCount();

          const response = await this.newsapi.v2.everything({
            q: crisisQuery,
            sortBy: 'publishedAt',
            pageSize: 50,
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
          });

          const processedResponse = this.processNewsResponse(response, 'crisis');
          
          // Add crisis urgency scoring
          processedResponse.articles = processedResponse.articles.map(article => ({
            ...article,
            crisisScore: this.calculateCrisisScore(article),
            urgencyLevel: this.determineUrgencyLevel(article)
          }));

          return processedResponse;
        },
        'NewsAPI',
        'crisis monitoring',
        {
          timeout: 25000,
          retries: 2,
          retryDelay: 3000
        }
      );
    } catch (error) {
      console.error('NewsAPI crisis monitoring error:', error);
      // For monitoring, return graceful degradation instead of throwing
      return { 
        articles: [], 
        metadata: { 
          source: 'newsapi', 
          type: 'crisis', 
          error: error.message,
          degraded: true
        } 
      };
    }
  }

  /**
   * Verify source credibility
   * @param {string} sourceId - Source identifier
   * @returns {Object} Credibility information
   */
  getSourceCredibility(sourceId) {
    const isTrusted = this.trustedSources.includes(sourceId);
    
    return {
      sourceId,
      isTrusted,
      credibilityScore: isTrusted ? 0.9 : 0.6,
      category: isTrusted ? 'trusted_mainstream' : 'general_news',
      verificationStatus: isTrusted ? 'verified' : 'unverified'
    };
  }

  /**
   * Process NewsAPI response and add metadata
   * @param {Object} response - Raw NewsAPI response
   * @param {string} type - Type of request (trending, search, crisis)
   * @param {string} query - Search query if applicable
   * @returns {Object} Processed response with metadata
   */
  processNewsResponse(response, type, query = null) {
    if (!response || response.status !== 'ok') {
      throw new Error('Invalid NewsAPI response');
    }

    const processedArticles = response.articles.map(article => ({
      id: this.generateArticleId(article),
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        id: article.source.id,
        name: article.source.name,
        credibility: this.getSourceCredibility(article.source.id)
      },
      author: article.author,
      // Add FactSaura-specific metadata
      detectedAt: new Date().toISOString(),
      platform: 'newsapi',
      contentType: 'news_article',
      language: 'en', // NewsAPI primarily returns English content
      wordCount: article.content ? article.content.split(' ').length : 0
    }));

    return {
      articles: processedArticles,
      metadata: {
        source: 'newsapi',
        type,
        query,
        totalResults: response.totalResults,
        retrievedCount: processedArticles.length,
        timestamp: new Date().toISOString(),
        requestsRemaining: this.maxRequestsPerHour - this.requestCount
      }
    };
  }

  /**
   * Calculate crisis score for an article
   * @param {Object} article - Article object
   * @returns {number} Crisis score (0-1)
   */
  calculateCrisisScore(article) {
    let score = 0;
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    // Check for crisis keywords
    const crisisMatches = this.crisisKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    score += Math.min(crisisMatches * 0.2, 0.6); // Max 0.6 from keywords
    
    // Boost score for trusted sources
    if (article.source?.credibility?.isTrusted) {
      score += 0.2;
    }
    
    // Recent articles get higher crisis scores
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 2) score += 0.2;
    else if (hoursOld < 6) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Determine urgency level based on crisis score
   * @param {Object} article - Article object
   * @returns {string} Urgency level
   */
  determineUrgencyLevel(article) {
    const score = article.crisisScore || this.calculateCrisisScore(article);
    
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate unique article ID
   * @param {Object} article - Article object
   * @returns {string} Unique ID
   */
  generateArticleId(article) {
    const urlHash = article.url ? article.url.split('/').pop() : '';
    const titleHash = article.title ? article.title.replace(/\s+/g, '-').toLowerCase() : '';
    const timestamp = new Date(article.publishedAt).getTime();
    
    return `newsapi-${timestamp}-${titleHash}-${urlHash}`.substring(0, 100);
  }

  /**
   * Get service health and status
   * @returns {Object} Service status
   */
  getServiceStatus() {
    const hasValidKey = this.apiKey && this.apiKey !== 'your_newsapi_key_here';
    return {
      service: 'NewsAPI',
      status: hasValidKey ? 'configured' : 'not_configured',
      apiKey: hasValidKey ? 'present' : 'missing',
      requestsUsed: this.requestCount,
      requestsRemaining: this.maxRequestsPerHour - this.requestCount,
      rateLimitReset: new Date(this.lastReset + 60 * 60 * 1000).toISOString(),
      trustedSourcesCount: this.trustedSources.length,
      crisisKeywordsCount: this.crisisKeywords.length
    };
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Test results
   */
  async testConnection() {
    try {
      if (!this.apiKey || this.apiKey === 'your_newsapi_key_here') {
        return {
          success: false,
          error: 'NewsAPI key not configured',
          status: 'not_configured'
        };
      }

      if (!this.newsapi) {
        return {
          success: false,
          error: 'NewsAPI service not initialized',
          status: 'not_initialized'
        };
      }

      if (!this.canMakeRequest()) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          status: 'rate_limited'
        };
      }

      // Test with a simple query
      this.incrementRequestCount();
      const response = await this.newsapi.v2.topHeadlines({
        country: 'us',
        pageSize: 1
      });

      return {
        success: true,
        status: 'connected',
        articlesFound: response.totalResults,
        message: 'NewsAPI connection successful'
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

module.exports = NewsApiService;