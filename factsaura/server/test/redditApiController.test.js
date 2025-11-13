/**
 * Reddit API Controller Unit Tests
 */

const request = require('supertest');
const express = require('express');

// Mock the Reddit API service before requiring the controller
jest.mock('../services/redditApiService');
const RedditApiService = require('../services/redditApiService');

describe('RedditApiController', () => {
  let app;
  let mockRedditService;

  beforeEach(() => {
    // Create fresh app for each test
    app = express();
    app.use(express.json());

    mockRedditService = {
      getTrendingPosts: jest.fn(),
      searchPosts: jest.fn(),
      monitorCrisisContent: jest.fn(),
      getSubredditPosts: jest.fn(),
      getServiceStatus: jest.fn(),
      testConnection: jest.fn()
    };

    RedditApiService.mockImplementation(() => mockRedditService);
    
    // Clear the module cache and require fresh controller
    delete require.cache[require.resolve('../controllers/redditApiController')];
    const redditApiController = require('../controllers/redditApiController');
    
    // Set up routes
    app.get('/trending', redditApiController.getTrendingPosts);
    app.get('/search', redditApiController.searchPosts);
    app.get('/crisis', redditApiController.monitorCrisisContent);
    app.get('/subreddit/:name', redditApiController.getSubredditPosts);
    app.get('/status', redditApiController.getServiceStatus);
    app.get('/test', redditApiController.testConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /trending', () => {
    test('should return trending posts successfully', async () => {
      const mockResponse = {
        posts: [
          {
            id: 'test1',
            title: 'Test Post',
            subreddit: 'test',
            score: 100
          }
        ],
        metadata: {
          source: 'reddit',
          type: 'trending'
        }
      };

      mockRedditService.getTrendingPosts.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/trending')
        .query({
          subreddit: 'news',
          sort: 'hot',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Reddit trending posts retrieved successfully');
      
      expect(mockRedditService.getTrendingPosts).toHaveBeenCalledWith({
        subreddit: 'news',
        sort: 'hot',
        timeframe: 'day',
        limit: 10
      });
    });

    test('should use default parameters when not provided', async () => {
      const mockResponse = { posts: [], metadata: {} };
      mockRedditService.getTrendingPosts.mockResolvedValue(mockResponse);

      await request(app).get('/trending');

      expect(mockRedditService.getTrendingPosts).toHaveBeenCalledWith({
        subreddit: 'all',
        sort: 'hot',
        timeframe: 'day',
        limit: 25
      });
    });

    test('should handle service errors', async () => {
      mockRedditService.getTrendingPosts.mockRejectedValue(new Error('Reddit API error'));

      const response = await request(app).get('/trending');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Reddit API error');
      expect(response.body.message).toBe('Failed to fetch trending Reddit posts');
    });
  });

  describe('GET /search', () => {
    test('should search posts successfully', async () => {
      const mockResponse = {
        posts: [
          {
            id: 'search1',
            title: 'Search Result',
            subreddit: 'test'
          }
        ],
        metadata: {
          source: 'reddit',
          type: 'search'
        }
      };

      mockRedditService.searchPosts.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/search')
        .query({
          q: 'misinformation',
          subreddit: 'news',
          sort: 'relevance',
          limit: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Reddit search completed successfully');
      
      expect(mockRedditService.searchPosts).toHaveBeenCalledWith('misinformation', {
        subreddit: 'news',
        sort: 'relevance',
        timeframe: 'all',
        limit: 5
      });
    });

    test('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Query parameter is required');
      expect(response.body.message).toBe('Please provide a search query');
    });

    test('should use default parameters', async () => {
      const mockResponse = { posts: [], metadata: {} };
      mockRedditService.searchPosts.mockResolvedValue(mockResponse);

      await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(mockRedditService.searchPosts).toHaveBeenCalledWith('test', {
        subreddit: 'all',
        sort: 'relevance',
        timeframe: 'all',
        limit: 25
      });
    });

    test('should handle service errors', async () => {
      mockRedditService.searchPosts.mockRejectedValue(new Error('Search failed'));

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Search failed');
    });
  });

  describe('GET /crisis', () => {
    test('should monitor crisis content successfully', async () => {
      const mockResponse = {
        posts: [
          {
            id: 'crisis1',
            title: 'Crisis Post',
            crisisScore: 0.8,
            urgencyLevel: 'high'
          }
        ],
        metadata: {
          source: 'reddit',
          type: 'crisis'
        }
      };

      mockRedditService.monitorCrisisContent.mockResolvedValue(mockResponse);

      const response = await request(app).get('/crisis');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Reddit crisis content monitoring completed');
      
      expect(mockRedditService.monitorCrisisContent).toHaveBeenCalled();
    });

    test('should handle service errors', async () => {
      mockRedditService.monitorCrisisContent.mockRejectedValue(new Error('Crisis monitoring failed'));

      const response = await request(app).get('/crisis');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Crisis monitoring failed');
    });
  });

  describe('GET /subreddit/:name', () => {
    test('should get subreddit posts successfully', async () => {
      const mockResponse = {
        posts: [
          {
            id: 'sub1',
            title: 'Subreddit Post',
            subreddit: 'technology'
          }
        ],
        metadata: {
          source: 'reddit',
          type: 'subreddit'
        }
      };

      mockRedditService.getSubredditPosts.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/subreddit/technology')
        .query({
          sort: 'hot',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Posts from r/technology retrieved successfully');
      
      expect(mockRedditService.getSubredditPosts).toHaveBeenCalledWith('technology', {
        sort: 'hot',
        limit: 10,
        timeframe: 'day'
      });
    });

    test('should use default parameters', async () => {
      const mockResponse = { posts: [], metadata: {} };
      mockRedditService.getSubredditPosts.mockResolvedValue(mockResponse);

      await request(app).get('/subreddit/news');

      expect(mockRedditService.getSubredditPosts).toHaveBeenCalledWith('news', {
        sort: 'hot',
        limit: 25,
        timeframe: 'day'
      });
    });

    test('should handle service errors', async () => {
      mockRedditService.getSubredditPosts.mockRejectedValue(new Error('Subreddit not found'));

      const response = await request(app).get('/subreddit/nonexistent');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Subreddit not found');
    });
  });

  describe('GET /status', () => {
    test('should return service status successfully', async () => {
      const mockStatus = {
        service: 'Reddit API',
        status: 'configured',
        requestsUsed: 5,
        requestsRemaining: 55
      };

      const mockConnectionTest = {
        success: true,
        status: 'connected'
      };

      mockRedditService.getServiceStatus.mockReturnValue(mockStatus);
      mockRedditService.testConnection.mockResolvedValue(mockConnectionTest);

      const response = await request(app).get('/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        ...mockStatus,
        connectionTest: mockConnectionTest
      });
      expect(response.body.message).toBe('Reddit API service status retrieved');
    });

    test('should handle service errors', async () => {
      mockRedditService.getServiceStatus.mockImplementation(() => {
        throw new Error('Status check failed');
      });

      const response = await request(app).get('/status');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Status check failed');
    });
  });

  describe('GET /test', () => {
    test('should test connection successfully', async () => {
      const mockTestResult = {
        success: true,
        status: 'connected',
        message: 'Reddit API connection successful'
      };

      mockRedditService.testConnection.mockResolvedValue(mockTestResult);

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTestResult);
      expect(response.body.message).toBe('Reddit API connection successful');
    });

    test('should handle connection failure', async () => {
      const mockTestResult = {
        success: false,
        status: 'connection_failed',
        error: 'Invalid credentials'
      };

      mockRedditService.testConnection.mockResolvedValue(mockTestResult);

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toEqual(mockTestResult);
      expect(response.body.message).toBe('Reddit API connection failed');
    });

    test('should handle service errors', async () => {
      mockRedditService.testConnection.mockRejectedValue(new Error('Connection test failed'));

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Connection test failed');
    });
  });
});