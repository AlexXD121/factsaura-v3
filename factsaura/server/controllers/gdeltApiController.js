/**
 * GDELT API Controller
 * Handles HTTP requests for GDELT API integration
 */

const GdeltApiService = require('../services/gdeltApiService');

class GdeltApiController {
  constructor() {
    this.gdeltApiService = new GdeltApiService();
  }

  /**
   * Get global events from GDELT
   * GET /api/gdelt/events
   */
  async getGlobalEvents(req, res) {
    try {
      const {
        query = '',
        timespan = '3days',
        maxrecords = 250,
        mode = 'artlist',
        sort = 'hybridrel'
      } = req.query;

      const options = {
        query,
        timespan,
        maxrecords: parseInt(maxrecords),
        mode,
        sort
      };

      const result = await this.gdeltApiService.getGlobalEvents(options);

      res.json({
        success: true,
        data: result,
        message: 'Global events retrieved successfully'
      });
    } catch (error) {
      console.error('GDELT global events controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch global events'
      });
    }
  }

  /**
   * Monitor crisis-related events
   * GET /api/gdelt/crisis
   */
  async monitorCrisisEvents(req, res) {
    try {
      const result = await this.gdeltApiService.monitorCrisisEvents();

      res.json({
        success: true,
        data: result,
        message: 'Crisis events monitoring completed'
      });
    } catch (error) {
      console.error('GDELT crisis monitoring controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to monitor crisis events'
      });
    }
  }

  /**
   * Get trending topics and themes
   * GET /api/gdelt/trending
   */
  async getTrendingTopics(req, res) {
    try {
      const {
        timespan = '1day',
        maxrecords = 100,
        sourcecountry = '',
        theme = ''
      } = req.query;

      const options = {
        timespan,
        maxrecords: parseInt(maxrecords),
        sourcecountry,
        theme
      };

      const result = await this.gdeltApiService.getTrendingTopics(options);

      res.json({
        success: true,
        data: result,
        message: 'Trending topics retrieved successfully'
      });
    } catch (error) {
      console.error('GDELT trending topics controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch trending topics'
      });
    }
  }

  /**
   * Search for specific events or topics
   * GET /api/gdelt/search
   */
  async searchEvents(req, res) {
    try {
      const {
        q: query,
        timespan = '3days',
        maxrecords = 250,
        mode = 'artlist',
        sort = 'hybridrel',
        sourcecountry = '',
        sourcelang = 'english'
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
      }

      const options = {
        timespan,
        maxrecords: parseInt(maxrecords),
        mode,
        sort,
        sourcecountry,
        sourcelang
      };

      const result = await this.gdeltApiService.searchEvents(query, options);

      res.json({
        success: true,
        data: result,
        message: 'Event search completed successfully'
      });
    } catch (error) {
      console.error('GDELT search controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to search events'
      });
    }
  }

  /**
   * Get geographic event distribution
   * GET /api/gdelt/geographic
   */
  async getGeographicEvents(req, res) {
    try {
      const {
        query = 'crisis OR emergency',
        timespan = '1day',
        maxrecords = 500
      } = req.query;

      const options = {
        query,
        timespan,
        maxrecords: parseInt(maxrecords)
      };

      const result = await this.gdeltApiService.getGeographicEvents(options);

      res.json({
        success: true,
        data: result,
        message: 'Geographic events retrieved successfully'
      });
    } catch (error) {
      console.error('GDELT geographic events controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch geographic events'
      });
    }
  }

  /**
   * Get service status and health
   * GET /api/gdelt/status
   */
  async getServiceStatus(req, res) {
    try {
      const status = this.gdeltApiService.getServiceStatus();
      const connectionTest = await this.gdeltApiService.testConnection();

      res.json({
        success: true,
        data: {
          ...status,
          connectionTest
        },
        message: 'GDELT API service status retrieved'
      });
    } catch (error) {
      console.error('GDELT service status controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get service status'
      });
    }
  }

  /**
   * Test GDELT API connection
   * GET /api/gdelt/test
   */
  async testConnection(req, res) {
    try {
      const result = await this.gdeltApiService.testConnection();

      res.json({
        success: result.success,
        data: result,
        message: result.success ? 'GDELT API connection successful' : 'GDELT API connection failed'
      });
    } catch (error) {
      console.error('GDELT connection test controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to test connection'
      });
    }
  }
}

module.exports = new GdeltApiController();