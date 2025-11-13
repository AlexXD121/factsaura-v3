/**
 * NewsAPI Controller Tests
 * Tests for NewsAPI HTTP endpoints
 */

const request = require('supertest');
const express = require('express');

// Mock the NewsApiService before importing the controller
jest.mock('../services/newsApiService');

const newsApiController = require('../controllers/newsApiController');

// Create test app
const app = express();
app.use(express.json());

// Add routes
app.get('/trending', newsApiController.getTrendingNews.bind(newsApiController));
app.get('/search', newsApiController.searchNews.bind(newsApiController));
app.get('/crisis', newsApiController.monitorCrisisContent.bind(newsApiController));
app.get('/status', newsApiController.getServiceStatus.bind(newsApiController));
app.get('/test', newsApiController.testConnection.bind(newsApiController));

describe('NewsAPI Controller', () => {
  let mockNewsApiService;

  beforeEach(() => {
    // Reset the mock and create new mock functions
    jest.clearAllMocks();
    
    const NewsApiService = require('../services/newsApiService');
    mockNewsApiService = {
      getTrendingNews: jest.fn(),
      searchNews: jest.fn(),
      monitorCrisisContent: jest.fn(),
      getServiceStatus: jest.fn(),
      testConnection: jest.fn()
    };
    
    NewsApiService.mockImplementation(() => mockNewsApiService);
    
    // Reset the controller's service instance
    newsApiController.newsApiService = mockNewsApiService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /trending', () => {
    test('should return trending news successfully', async () => {
      const mockResponse = {
        articles: [
          {
            id: 'test-1',
            title: 'Test Article',
            description: 'Test description',
            url: 'https://example.com/test',
            source: { name: 'Test Source', credibility: { isTrusted: true } }
          }
        ],
        metadata: { source: 'newsapi', type: 'trending', totalResults: 1 }
      };

      mockNewsApiService.getTrendingNews.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/trending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Trending news retrieved successfully');
      expect(mockNewsApiService.getTrendingNews).toHaveBeenCalledWith({
        country: 'us',
        category: 'general',
        pageSize: 20,
        page: 1
      });
    });

    test('should handle query parameters correctly', async () => {
      mockNewsApiService.getTrendingNews.mockResolvedValue({ articles: [], metadata: {} });

      await request(app)
        .get('/trending?country=uk&category=technology&pageSize=10&page=2')
        .expect(200);

      expect(mockNewsApiService.getTrendingNews).toHaveBeenCalledWith({
        country: 'uk',
        category: 'technology',
        pageSize: 10,
        page: 2
      });
    });

    test('should handle service errors', async () => {
      mockNewsApiService.getTrendingNews.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/trending')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('API Error');
      expect(response.body.message).toBe('Failed to fetch trending news');
    });
  });

  describe('GET /search', () => {
    test('should search news successfully', async () => {
      const mockResponse = {
        articles: [
          {
            id: 'search-1',
            title: 'Search Result',
            description: 'Search description',
            url: 'https://example.com/search'
          }
        ],
        metadata: { source: 'newsapi', type: 'search', query: 'test query' }
      };

      mockNewsApiService.searchNews.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/search?q=test%20query')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(mockNewsApiService.searchNews).toHaveBeenCalledWith('test query', {
        sortBy: 'publishedAt',
        pageSize: 20,
        page: 1,
        from: undefined,
        to: undefined,
        sources: null
      });
    });

    test('should require query parameter', async () => {
      const response = await request(app)
        .get('/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Query parameter is required');
    });

    test('should handle sources parameter', async () => {
      mockNewsApiService.searchNews.mockResolvedValue({ articles: [], metadata: {} });

      await request(app)
        .get('/search?q=test&sources=reuters,bbc-news')
        .expect(200);

      expect(mockNewsApiService.searchNews).toHaveBeenCalledWith('test', {
        sortBy: 'publishedAt',
        pageSize: 20,
        page: 1,
        from: undefined,
        to: undefined,
        sources: ['reuters', 'bbc-news']
      });
    });
  });

  describe('GET /crisis', () => {
    test('should monitor crisis content successfully', async () => {
      const mockResponse = {
        articles: [
          {
            id: 'crisis-1',
            title: 'Emergency Alert',
            crisisScore: 0.8,
            urgencyLevel: 'high'
          }
        ],
        metadata: { source: 'newsapi', type: 'crisis' }
      };

      mockNewsApiService.monitorCrisisContent.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/crisis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(response.body.message).toBe('Crisis content monitoring completed');
    });

    test('should handle monitoring errors', async () => {
      mockNewsApiService.monitorCrisisContent.mockRejectedValue(new Error('Monitoring failed'));

      const response = await request(app)
        .get('/crisis')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Monitoring failed');
    });
  });

  describe('GET /status', () => {
    test('should return service status successfully', async () => {
      const mockStatus = {
        service: 'NewsAPI',
        status: 'configured',
        requestsUsed: 5,
        requestsRemaining: 95
      };

      const mockConnectionTest = {
        success: true,
        status: 'connected'
      };

      mockNewsApiService.getServiceStatus.mockReturnValue(mockStatus);
      mockNewsApiService.testConnection.mockResolvedValue(mockConnectionTest);

      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        ...mockStatus,
        connectionTest: mockConnectionTest
      });
    });
  });

  describe('GET /test', () => {
    test('should test connection successfully', async () => {
      const mockResult = {
        success: true,
        status: 'connected',
        message: 'Connection successful'
      };

      mockNewsApiService.testConnection.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(response.body.message).toBe('NewsAPI connection successful');
    });

    test('should handle connection failures', async () => {
      const mockResult = {
        success: false,
        status: 'connection_failed',
        error: 'Invalid API key'
      };

      mockNewsApiService.testConnection.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.data).toEqual(mockResult);
      expect(response.body.message).toBe('NewsAPI connection failed');
    });
  });
});