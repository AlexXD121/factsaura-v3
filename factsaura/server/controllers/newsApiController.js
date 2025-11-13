/**
 * NewsAPI Controller
 * Handles HTTP requests for NewsAPI integration
 */

const NewsApiService = require('../services/newsApiService');

class NewsApiController {
  constructor() {
    this.newsApiService = new NewsApiService();
  }

  /**
   * Get trending news articles
   * GET /api/news/trending
   */
  async getTrendingNews(req, res) {
    try {
      const { country = 'us', category = 'general', pageSize = 20, page = 1 } = req.query;
      
      const options = {
        country,
        category,
        pageSize: parseInt(pageSize),
        page: parseInt(page)
      };

      const result = await this.newsApiService.getTrendingNews(options);
      
      res.json({
        success: true,
        data: result,
        message: 'Trending news retrieved successfully'
      });
    } catch (error) {
      console.error('Trending news controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch trending news'
      });
    }
  }

  /**
   * Search news articles
   * GET /api/news/search
   */
  async searchNews(req, res) {
    try {
      const { q: query, sortBy = 'publishedAt', pageSize = 20, page = 1, from, to, sources } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
      }

      const options = {
        sortBy,
        pageSize: parseInt(pageSize),
        page: parseInt(page),
        from,
        to,
        sources: sources ? sources.split(',') : null
      };

      const result = await this.newsApiService.searchNews(query, options);
      
      res.json({
        success: true,
        data: result,
        message: 'News search completed successfully'
      });
    } catch (error) {
      console.error('News search controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to search news'
      });
    }
  }

  /**
   * Monitor crisis-related content
   * GET /api/news/crisis
   */
  async monitorCrisisContent(req, res) {
    try {
      const result = await this.newsApiService.monitorCrisisContent();
      
      res.json({
        success: true,
        data: result,
        message: 'Crisis content monitoring completed'
      });
    } catch (error) {
      console.error('Crisis monitoring controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to monitor crisis content'
      });
    }
  }

  /**
   * Get service status and health
   * GET /api/news/status
   */
  async getServiceStatus(req, res) {
    try {
      const status = this.newsApiService.getServiceStatus();
      const connectionTest = await this.newsApiService.testConnection();
      
      res.json({
        success: true,
        data: {
          ...status,
          connectionTest
        },
        message: 'NewsAPI service status retrieved'
      });
    } catch (error) {
      console.error('Service status controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get service status'
      });
    }
  }

  /**
   * Test NewsAPI connection
   * GET /api/news/test
   */
  async testConnection(req, res) {
    try {
      const result = await this.newsApiService.testConnection();
      
      res.json({
        success: result.success,
        data: result,
        message: result.success ? 'NewsAPI connection successful' : 'NewsAPI connection failed'
      });
    } catch (error) {
      console.error('Connection test controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to test connection'
      });
    }
  }
}

module.exports = new NewsApiController();