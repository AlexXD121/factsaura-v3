/**
 * Reddit API Integration Service
 * Provides real-time Reddit monitoring and trending content detection
 * Uses snoowrap for Reddit API access
 */

const snoowrap = require('snoowrap');
const axios = require('axios');
const { apiKeyManager } = require('../config/apiKeys');

class RedditApiService {
  constructor() {
    // Use API Key Manager for Reddit credentials
    this.config = apiKeyManager.getConfig('reddit');
    this.clientId = this.config.clientId;
    this.clientSecret = this.config.clientSecret;
    this.username = this.config.username;
    this.password = this.config.password;
    this.userAgent = this.config.userAgent || 'FactSaura:v1.0.0 (by /u/factsaura)';
    
    // Only initialize Reddit API if we have valid credentials
    if (apiKeyManager.isServiceAvailable('reddit')) {
      
      try {
        // Try user authentication first
        if (this.username && this.password && 
            this.username !== 'your_reddit_username' && 
            this.password !== 'your_reddit_password') {
          
          this.reddit = new snoowrap({
            userAgent: this.userAgent,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            username: this.username,
            password: this.password
          });
        } else {
          // Fall back to client credentials only (read-only access)
          this.reddit = new snoowrap({
            userAgent: this.userAgent,
            clientId: this.clientId,
            clientSecret: this.clientSecret
          });
        }
        
        // Configure request delay to respect rate limits
        this.reddit.config({ requestDelay: 1000 }); // 1 second between requests
      } catch (error) {
        console.warn('Reddit API initialization failed, falling back to client-only mode:', error.message);
        // Fall back to client credentials only
        this.reddit = new snoowrap({
          userAgent: this.userAgent,
          clientId: this.clientId,
          clientSecret: this.clientSecret
        });
        this.reddit.config({ requestDelay: 1000 });
      }
    } else {
      this.reddit = null;
    }
    
    // Crisis-related subreddits for monitoring
    this.crisisSubreddits = (process.env.REDDIT_CRISIS_SUBREDDITS || 'news,worldnews,breakingnews,emergencies,conspiracy,misinformation').split(',').map(s => s.trim());
    
    // Trending subreddits for general monitoring
    this.trendingSubreddits = (process.env.REDDIT_TRENDING_SUBREDDITS || 'all,popular,news,worldnews,technology,science,politics').split(',').map(s => s.trim());
    
    // Crisis keywords for content filtering
    this.crisisKeywords = (process.env.CRISIS_KEYWORDS || '').split(',').map(k => k.trim());
  }

  /**
   * Check if we can make more API requests (rate limiting)
   */
  canMakeRequest() {
    return apiKeyManager.checkRateLimit('reddit');
  }

  /**
   * Increment request counter
   */
  incrementRequestCount() {
    apiKeyManager.incrementRateLimit('reddit');
  }

  /**
   * Handle API errors with proper error types
   */
  handleApiError(error, operation) {
    const { handleExternalServiceError } = require('../middleware/apiServiceErrorHandler');
    throw handleExternalServiceError(error, 'Reddit API', operation);
  }

  /**
   * Check service availability and rate limits
   */
  checkServiceAvailability() {
    if (!apiKeyManager.isServiceAvailable('reddit')) {
      const { ServiceUnavailableError } = require('../middleware/errorHandlingMiddleware');
      throw new ServiceUnavailableError('Reddit API', 'Credentials not configured');
    }
    
    if (!apiKeyManager.checkRateLimit('reddit')) {
      const status = apiKeyManager.getRateLimitStatus('reddit');
      const { RateLimitError } = require('../middleware/errorHandlingMiddleware');
      throw new RateLimitError('Reddit API', Math.ceil((status.resetTime - new Date()) / 1000));
    }
    
    if (!this.reddit) {
      const { ServiceUnavailableError } = require('../middleware/errorHandlingMiddleware');
      throw new ServiceUnavailableError('Reddit API', 'Service not initialized');
    }
  }

  /**
   * Execute Reddit API request with comprehensive error handling
   */
  async executeWithErrorHandling(requestFn, operation) {
    const { executeApiRequest } = require('../middleware/apiServiceErrorHandler');
    
    return await executeApiRequest(
      requestFn,
      'Reddit API',
      operation,
      {
        timeout: 30000,
        retries: 2,
        retryDelay: 2000
      }
    );
  }

  /**
   * Get trending posts from Reddit
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Reddit posts with metadata
   */
  async getTrendingPosts(options = {}) {
    // Check service availability and rate limits
    this.checkServiceAvailability();

    return await this.executeWithErrorHandling(async () => {
      const {
        subreddit = 'all',
        sort = 'hot', // hot, new, rising, top
        timeframe = 'day', // hour, day, week, month, year, all
        limit = 25
      } = options;

      let posts;
      if (sort === 'top') {
        posts = await this.reddit.getSubreddit(subreddit).getTop({ time: timeframe, limit });
      } else if (sort === 'new') {
        posts = await this.reddit.getSubreddit(subreddit).getNew({ limit });
      } else if (sort === 'rising') {
        posts = await this.reddit.getSubreddit(subreddit).getRising({ limit });
      } else {
        posts = await this.reddit.getSubreddit(subreddit).getHot({ limit });
      }

      // Increment rate limit counter after successful request
      apiKeyManager.incrementRateLimit('reddit');

      return this.processRedditResponse(posts, 'trending', { subreddit, sort, timeframe });
    }, 'trending posts fetch');
  }

  /**
   * Search Reddit for specific content
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with metadata
   */
  async searchPosts(query, options = {}) {
    if (!this.reddit) {
      throw new Error('Reddit API not configured. Please set Reddit credentials in environment variables.');
    }

    if (!this.canMakeRequest()) {
      throw new Error('Reddit API rate limit exceeded. Try again later.');
    }

    try {
      const {
        subreddit = 'all',
        sort = 'relevance', // relevance, hot, top, new, comments
        timeframe = 'all',
        limit = 25
      } = options;

      this.incrementRequestCount();

      const searchOptions = {
        query,
        sort,
        time: timeframe,
        limit
      };

      const posts = await this.reddit.getSubreddit(subreddit).search(searchOptions);

      return this.processRedditResponse(posts, 'search', { query, subreddit, sort, timeframe });
    } catch (error) {
      console.error('Reddit search error:', error);
      this.handleApiError(error, 'search');
    }
  }

  /**
   * Monitor crisis-related content across multiple subreddits
   * @returns {Promise<Object>} Crisis-related posts
   */
  async monitorCrisisContent() {
    if (!this.reddit) {
      return { 
        posts: [], 
        metadata: { 
          source: 'reddit', 
          type: 'crisis', 
          error: 'Reddit API not configured' 
        } 
      };
    }

    if (!this.canMakeRequest()) {
      console.warn('Reddit API rate limit exceeded for crisis monitoring');
      return { posts: [], metadata: { source: 'reddit', type: 'crisis', rateLimited: true } };
    }

    try {
      const allCrisisPosts = [];
      
      // Monitor each crisis subreddit
      for (const subreddit of this.crisisSubreddits.slice(0, 3)) { // Limit to 3 subreddits to avoid rate limits
        try {
          this.incrementRequestCount();
          
          const posts = await this.reddit.getSubreddit(subreddit).getHot({ limit: 10 });
          const processedPosts = this.processRedditResponse(posts, 'crisis', { subreddit });
          
          // Filter for crisis-related content
          const crisisFilteredPosts = processedPosts.posts.filter(post => 
            this.containsCrisisKeywords(post) || this.hasCrisisIndicators(post)
          );
          
          allCrisisPosts.push(...crisisFilteredPosts);
        } catch (error) {
          console.error(`Error monitoring subreddit ${subreddit}:`, error);
          continue;
        }
      }

      // Add crisis scoring
      const scoredPosts = allCrisisPosts.map(post => ({
        ...post,
        crisisScore: this.calculateCrisisScore(post),
        urgencyLevel: this.determineUrgencyLevel(post)
      }));

      // Sort by crisis score
      scoredPosts.sort((a, b) => b.crisisScore - a.crisisScore);

      return {
        posts: scoredPosts,
        metadata: {
          source: 'reddit',
          type: 'crisis',
          subredditsMonitored: this.crisisSubreddits.slice(0, 3),
          totalPosts: scoredPosts.length,
          timestamp: new Date().toISOString(),
          requestsRemaining: this.maxRequestsPerMinute - this.requestCount
        }
      };
    } catch (error) {
      console.error('Reddit crisis monitoring error:', error);
      return { 
        posts: [], 
        metadata: { 
          source: 'reddit', 
          type: 'crisis', 
          error: error.message 
        } 
      };
    }
  }

  /**
   * Get posts from specific subreddit
   * @param {string} subredditName - Subreddit name
   * @param {Object} options - Options
   * @returns {Promise<Object>} Subreddit posts
   */
  async getSubredditPosts(subredditName, options = {}) {
    if (!this.reddit) {
      throw new Error('Reddit API not configured.');
    }

    if (!this.canMakeRequest()) {
      throw new Error('Reddit API rate limit exceeded.');
    }

    try {
      const { sort = 'hot', limit = 25, timeframe = 'day' } = options;

      this.incrementRequestCount();

      let posts;
      const subreddit = this.reddit.getSubreddit(subredditName);

      switch (sort) {
        case 'new':
          posts = await subreddit.getNew({ limit });
          break;
        case 'top':
          posts = await subreddit.getTop({ time: timeframe, limit });
          break;
        case 'rising':
          posts = await subreddit.getRising({ limit });
          break;
        default:
          posts = await subreddit.getHot({ limit });
      }

      return this.processRedditResponse(posts, 'subreddit', { subreddit: subredditName, sort, timeframe });
    } catch (error) {
      console.error(`Error fetching posts from r/${subredditName}:`, error);
      throw new Error(`Failed to fetch posts from r/${subredditName}: ${error.message}`);
    }
  }

  /**
   * Process Reddit API response and add metadata
   * @param {Array} posts - Raw Reddit posts
   * @param {string} type - Type of request
   * @param {Object} context - Request context
   * @returns {Object} Processed response with metadata
   */
  processRedditResponse(posts, type, context = {}) {
    if (!posts || !Array.isArray(posts)) {
      throw new Error('Invalid Reddit API response');
    }

    const processedPosts = posts.map(post => ({
      id: this.generatePostId(post),
      title: post.title,
      content: post.selftext || post.url, // Use selftext for text posts, URL for link posts
      url: `https://reddit.com${post.permalink}`,
      externalUrl: post.url !== `https://reddit.com${post.permalink}` ? post.url : null,
      author: post.author ? post.author.name : '[deleted]',
      subreddit: post.subreddit.display_name,
      score: post.score,
      upvoteRatio: post.upvote_ratio,
      numComments: post.num_comments,
      created: new Date(post.created_utc * 1000).toISOString(),
      isVideo: post.is_video,
      isImage: post.post_hint === 'image',
      isLink: post.is_self === false,
      isText: post.is_self === true,
      flair: post.link_flair_text,
      nsfw: post.over_18,
      stickied: post.stickied,
      locked: post.locked,
      // Add FactSaura-specific metadata
      detectedAt: new Date().toISOString(),
      platform: 'reddit',
      contentType: 'reddit_post',
      language: 'en', // Reddit is primarily English
      wordCount: post.selftext ? post.selftext.split(' ').length : 0,
      engagement: {
        score: post.score,
        comments: post.num_comments,
        upvoteRatio: post.upvote_ratio
      }
    }));

    return {
      posts: processedPosts,
      metadata: {
        source: 'reddit',
        type,
        context,
        retrievedCount: processedPosts.length,
        timestamp: new Date().toISOString(),
        requestsRemaining: this.maxRequestsPerMinute - this.requestCount
      }
    };
  }

  /**
   * Check if post contains crisis keywords
   * @param {Object} post - Reddit post
   * @returns {boolean} Whether post contains crisis keywords
   */
  containsCrisisKeywords(post) {
    const text = `${post.title} ${post.content || ''}`.toLowerCase();
    return this.crisisKeywords.some(keyword => 
      keyword && text.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if post has crisis indicators
   * @param {Object} post - Reddit post
   * @returns {boolean} Whether post has crisis indicators
   */
  hasCrisisIndicators(post) {
    // High engagement posts in crisis subreddits
    if (this.crisisSubreddits.includes(post.subreddit.toLowerCase()) && post.score > 100) {
      return true;
    }
    
    // Posts with emergency-related flairs
    if (post.flair && /breaking|urgent|emergency|alert/i.test(post.flair)) {
      return true;
    }
    
    // High comment activity (potential controversy)
    if (post.numComments > 50 && post.upvoteRatio < 0.7) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate crisis score for a Reddit post
   * @param {Object} post - Reddit post
   * @returns {number} Crisis score (0-1)
   */
  calculateCrisisScore(post) {
    let score = 0;
    
    // Check for crisis keywords
    if (this.containsCrisisKeywords(post)) {
      score += 0.3;
    }
    
    // Crisis subreddit bonus
    if (this.crisisSubreddits.includes(post.subreddit.toLowerCase())) {
      score += 0.2;
    }
    
    // High engagement indicates viral potential
    if (post.score > 1000) score += 0.2;
    else if (post.score > 500) score += 0.15;
    else if (post.score > 100) score += 0.1;
    
    // High comment activity
    if (post.numComments > 200) score += 0.15;
    else if (post.numComments > 50) score += 0.1;
    
    // Low upvote ratio indicates controversy
    if (post.upvoteRatio < 0.6) score += 0.15;
    else if (post.upvoteRatio < 0.8) score += 0.1;
    
    // Recent posts get higher scores
    const hoursOld = (Date.now() - new Date(post.created).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 2) score += 0.1;
    else if (hoursOld < 6) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  /**
   * Determine urgency level based on crisis score
   * @param {Object} post - Reddit post
   * @returns {string} Urgency level
   */
  determineUrgencyLevel(post) {
    const score = post.crisisScore || this.calculateCrisisScore(post);
    
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate unique post ID
   * @param {Object} post - Reddit post
   * @returns {string} Unique ID
   */
  generatePostId(post) {
    const timestamp = post.created_utc;
    const subreddit = post.subreddit.display_name;
    const postId = post.id;
    
    return `reddit-${timestamp}-${subreddit}-${postId}`;
  }

  /**
   * Get service health and status
   * @returns {Object} Service status
   */
  getServiceStatus() {
    const hasValidCredentials = this.clientId && this.clientSecret && this.username && this.password &&
                               this.clientId !== 'your_reddit_client_id' && 
                               this.clientSecret !== 'your_reddit_client_secret';
    
    return {
      service: 'Reddit API',
      status: hasValidCredentials ? 'configured' : 'not_configured',
      credentials: hasValidCredentials ? 'present' : 'missing',
      requestsUsed: this.requestCount,
      requestsRemaining: this.maxRequestsPerMinute - this.requestCount,
      rateLimitReset: new Date(this.lastReset + 60 * 1000).toISOString(),
      crisisSubredditsCount: this.crisisSubreddits.length,
      trendingSubredditsCount: this.trendingSubreddits.length,
      crisisKeywordsCount: this.crisisKeywords.length
    };
  }

  /**
   * Test Reddit API connection
   * @returns {Promise<Object>} Test results
   */
  async testConnection() {
    try {
      if (!this.clientId || !this.clientSecret ||
          this.clientId === 'your_reddit_client_id' || 
          this.clientSecret === 'your_reddit_client_secret') {
        return {
          success: false,
          error: 'Reddit API credentials not configured',
          status: 'not_configured'
        };
      }

      if (!this.reddit) {
        return {
          success: false,
          error: 'Reddit API service not initialized',
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

      // Test with a simple request
      this.incrementRequestCount();
      const testPost = await this.reddit.getSubreddit('test').getHot({ limit: 1 });

      const hasUserAuth = this.username && this.password && 
                         this.username !== 'your_reddit_username' && 
                         this.password !== 'your_reddit_password';

      return {
        success: true,
        status: 'connected',
        postsFound: testPost.length,
        authType: hasUserAuth ? 'user_auth' : 'client_only',
        message: `Reddit API connection successful (${hasUserAuth ? 'with user auth' : 'client-only mode'})`
      };
    } catch (error) {
      // If user auth fails, try client-only mode
      if (error.message.includes('Invalid grant') || error.message.includes('Unauthorized')) {
        try {
          console.log('User authentication failed, trying client-only mode...');
          
          // Get client credentials access token
          const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
          
          const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
            'grant_type=client_credentials',
            {
              headers: {
                'Authorization': `Basic ${authString}`,
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );
          
          // Create a new client-only instance with access token
          const clientOnlyReddit = new snoowrap({
            userAgent: this.userAgent,
            accessToken: tokenResponse.data.access_token
          });
          
          clientOnlyReddit.config({ requestDelay: 1000 });
          
          const testPost = await clientOnlyReddit.getSubreddit('test').getHot({ limit: 1 });
          
          // Update the main instance to client-only
          this.reddit = clientOnlyReddit;
          
          return {
            success: true,
            status: 'connected',
            postsFound: testPost.length,
            authType: 'client_only',
            message: 'Reddit API connection successful (client-only mode)',
            warning: 'User authentication failed, using read-only access'
          };
        } catch (clientError) {
          return {
            success: false,
            error: clientError.message,
            status: 'connection_failed'
          };
        }
      }
      
      return {
        success: false,
        error: error.message,
        status: 'connection_failed'
      };
    }
  }
}

module.exports = RedditApiService;