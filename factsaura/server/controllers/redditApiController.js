/**
 * Reddit API Controller
 * Handles HTTP requests for Reddit API integration
 */

const RedditApiService = require('../services/redditApiService');

class RedditApiController {
  constructor() {
    this.redditApiService = new RedditApiService();
  }

  /**
   * Get trending posts from Reddit
   * GET /api/reddit/trending
   */
  getTrendingPosts = async (req, res) => {
    try {
      const {
        subreddit = 'all',
        sort = 'hot',
        timeframe = 'day',
        limit = 25
      } = req.query;

      const options = {
        subreddit,
        sort,
        timeframe,
        limit: parseInt(limit)
      };

      const result = await this.redditApiService.getTrendingPosts(options);

      res.json({
        success: true,
        data: result,
        message: 'Reddit trending posts retrieved successfully'
      });
    } catch (error) {
      console.error('Reddit trending posts controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch trending Reddit posts'
      });
    }
  }

  /**
   * Search Reddit posts
   * GET /api/reddit/search
   */
  searchPosts = async (req, res) => {
    try {
      const {
        q: query,
        subreddit = 'all',
        sort = 'relevance',
        timeframe = 'all',
        limit = 25
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
      }

      const options = {
        subreddit,
        sort,
        timeframe,
        limit: parseInt(limit)
      };

      const result = await this.redditApiService.searchPosts(query, options);

      res.json({
        success: true,
        data: result,
        message: 'Reddit search completed successfully'
      });
    } catch (error) {
      console.error('Reddit search controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to search Reddit'
      });
    }
  }

  /**
   * Monitor crisis-related content on Reddit
   * GET /api/reddit/crisis
   */
  monitorCrisisContent = async (req, res) => {
    try {
      const result = await this.redditApiService.monitorCrisisContent();

      res.json({
        success: true,
        data: result,
        message: 'Reddit crisis content monitoring completed'
      });
    } catch (error) {
      console.error('Reddit crisis monitoring controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to monitor Reddit crisis content'
      });
    }
  }

  /**
   * Get posts from specific subreddit
   * GET /api/reddit/subreddit/:name
   */
  getSubredditPosts = async (req, res) => {
    try {
      const { name: subredditName } = req.params;
      const { sort = 'hot', limit = 25, timeframe = 'day' } = req.query;

      if (!subredditName) {
        return res.status(400).json({
          success: false,
          error: 'Subreddit name is required',
          message: 'Please provide a subreddit name'
        });
      }

      const options = {
        sort,
        limit: parseInt(limit),
        timeframe
      };

      const result = await this.redditApiService.getSubredditPosts(subredditName, options);

      res.json({
        success: true,
        data: result,
        message: `Posts from r/${subredditName} retrieved successfully`
      });
    } catch (error) {
      console.error('Reddit subreddit posts controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to fetch posts from r/${req.params.name}`
      });
    }
  }

  /**
   * Get service status and health
   * GET /api/reddit/status
   */
  getServiceStatus = async (req, res) => {
    try {
      const status = this.redditApiService.getServiceStatus();
      const connectionTest = await this.redditApiService.testConnection();

      res.json({
        success: true,
        data: {
          ...status,
          connectionTest
        },
        message: 'Reddit API service status retrieved'
      });
    } catch (error) {
      console.error('Reddit service status controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get Reddit service status'
      });
    }
  }

  /**
   * Test Reddit API connection
   * GET /api/reddit/test
   */
  testConnection = async (req, res) => {
    try {
      const result = await this.redditApiService.testConnection();

      res.json({
        success: result.success,
        data: result,
        message: result.success ? 'Reddit API connection successful' : 'Reddit API connection failed'
      });
    } catch (error) {
      console.error('Reddit connection test controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to test Reddit connection'
      });
    }
  }
}

module.exports = new RedditApiController();