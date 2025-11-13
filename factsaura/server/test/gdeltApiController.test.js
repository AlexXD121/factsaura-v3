/**
 * GDELT API Controller Unit Tests
 */

const request = require('supertest');
const express = require('express');

// Mock the GDELT service before requiring the controller
const mockGdeltService = {
  getGlobalEvents: jest.fn(),
  monitorCrisisEvents: jest.fn(),
  getTrendingTopics: jest.fn(),
  searchEvents: jest.fn(),
  getGeographicEvents: jest.fn(),
  getServiceStatus: jest.fn(),
  testConnection: jest.fn()
};

jest.mock('../services/gdeltApiService', () => {
  return jest.fn().mockImplementation(() => mockGdeltService);
});

const gdeltApiController = require('../controllers/gdeltApiController');

const app = express();
app.use(express.json());

// Set up routes
app.get('/events', gdeltApiController.getGlobalEvents.bind(gdeltApiController));
app.get('/crisis', gdeltApiController.monitorCrisisEvents.bind(gdeltApiController));
app.get('/trending', gdeltApiController.getTrendingTopics.bind(gdeltApiController));
app.get('/search', gdeltApiController.searchEvents.bind(gdeltApiController));
app.get('/geographic', gdeltApiController.getGeographicEvents.bind(gdeltApiController));
app.get('/status', gdeltApiController.getServiceStatus.bind(gdeltApiController));
app.get('/test', gdeltApiController.testConnection.bind(gdeltApiController));

describe('GdeltApiController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    test('should return global events successfully', async () => {
      const mockEvents = {
        events: [
          {
            id: 'gdelt-123',
            title: 'Test Crisis Event',
            platform: 'gdelt'
          }
        ],
        metadata: {
          source: 'gdelt',
          type: 'events',
          totalResults: 1
        }
      };

      mockGdeltService.getGlobalEvents.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/events')
        .query({
          query: 'crisis',
          maxrecords: 10,
          timespan: '1day'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.message).toBe('Global events retrieved successfully');
      
      expect(mockGdeltService.getGlobalEvents).toHaveBeenCalledWith({
        query: 'crisis',
        timespan: '1day',
        maxrecords: 10,
        mode: 'artlist',
        sort: 'hybridrel'
      });
    });

    test('should handle service errors', async () => {
      mockGdeltService.getGlobalEvents.mockRejectedValue(new Error('Service error'));

      const response = await request(app).get('/events');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Service error');
      expect(response.body.message).toBe('Failed to fetch global events');
    });
  });

  describe('GET /crisis', () => {
    test('should return crisis events successfully', async () => {
      const mockCrisisEvents = {
        events: [
          {
            id: 'gdelt-crisis-123',
            title: 'Emergency Alert',
            crisisScore: 0.8,
            urgencyLevel: 'high'
          }
        ],
        metadata: {
          source: 'gdelt',
          type: 'crisis'
        }
      };

      mockGdeltService.monitorCrisisEvents.mockResolvedValue(mockCrisisEvents);

      const response = await request(app).get('/crisis');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.data.events[0].crisisScore).toBe(0.8);
      expect(response.body.message).toBe('Crisis events monitoring completed');
    });

    test('should handle crisis monitoring errors', async () => {
      mockGdeltService.monitorCrisisEvents.mockRejectedValue(new Error('Crisis monitoring failed'));

      const response = await request(app).get('/crisis');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Crisis monitoring failed');
    });
  });

  describe('GET /trending', () => {
    test('should return trending topics successfully', async () => {
      const mockTrending = {
        events: [
          {
            id: 'gdelt-trending-123',
            title: 'Trending Topic'
          }
        ],
        metadata: {
          source: 'gdelt',
          type: 'trending'
        }
      };

      mockGdeltService.getTrendingTopics.mockResolvedValue(mockTrending);

      const response = await request(app)
        .get('/trending')
        .query({
          timespan: '1day',
          maxrecords: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Trending topics retrieved successfully');
      
      expect(mockGdeltService.getTrendingTopics).toHaveBeenCalledWith({
        timespan: '1day',
        maxrecords: 50,
        sourcecountry: '',
        theme: ''
      });
    });
  });

  describe('GET /search', () => {
    test('should search events successfully', async () => {
      const mockSearchResults = {
        events: [
          {
            id: 'gdelt-search-123',
            title: 'Earthquake News'
          }
        ],
        metadata: {
          source: 'gdelt',
          type: 'search'
        }
      };

      mockGdeltService.searchEvents.mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .get('/search')
        .query({
          q: 'earthquake',
          maxrecords: 25,
          timespan: '3days'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event search completed successfully');
      
      expect(mockGdeltService.searchEvents).toHaveBeenCalledWith('earthquake', {
        timespan: '3days',
        maxrecords: 25,
        mode: 'artlist',
        sort: 'hybridrel',
        sourcecountry: '',
        sourcelang: 'english'
      });
    });

    test('should return 400 for missing query parameter', async () => {
      const response = await request(app).get('/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Query parameter is required');
      expect(response.body.message).toBe('Please provide a search query');
    });

    test('should handle search errors', async () => {
      mockGdeltService.searchEvents.mockRejectedValue(new Error('Search failed'));

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Search failed');
    });
  });

  describe('GET /geographic', () => {
    test('should return geographic events successfully', async () => {
      const mockGeoEvents = {
        events: [
          {
            id: 'gdelt-geo-123',
            title: 'Regional Event',
            location: { country: 'US' }
          }
        ],
        geographicDistribution: {
          byCountry: [['US', 1]],
          totalCountries: 1
        },
        metadata: {
          source: 'gdelt',
          type: 'geographic'
        }
      };

      mockGdeltService.getGeographicEvents.mockResolvedValue(mockGeoEvents);

      const response = await request(app)
        .get('/geographic')
        .query({
          query: 'emergency',
          maxrecords: 100
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.geographicDistribution).toBeDefined();
      expect(response.body.message).toBe('Geographic events retrieved successfully');
    });
  });

  describe('GET /status', () => {
    test('should return service status successfully', async () => {
      const mockStatus = {
        service: 'GDELT API',
        status: 'configured',
        requestsUsed: 5,
        requestsRemaining: 95
      };

      const mockConnectionTest = {
        success: true,
        status: 'connected'
      };

      mockGdeltService.getServiceStatus.mockReturnValue(mockStatus);
      mockGdeltService.testConnection.mockResolvedValue(mockConnectionTest);

      const response = await request(app).get('/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBe('GDELT API');
      expect(response.body.data.connectionTest.success).toBe(true);
      expect(response.body.message).toBe('GDELT API service status retrieved');
    });

    test('should handle status errors', async () => {
      mockGdeltService.getServiceStatus.mockImplementation(() => {
        throw new Error('Status error');
      });

      const response = await request(app).get('/status');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Status error');
    });
  });

  describe('GET /test', () => {
    test('should test connection successfully', async () => {
      const mockTestResult = {
        success: true,
        status: 'connected',
        eventsFound: 1,
        message: 'GDELT API connection successful'
      };

      mockGdeltService.testConnection.mockResolvedValue(mockTestResult);

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('connected');
      expect(response.body.message).toBe('GDELT API connection successful');
    });

    test('should handle connection test failure', async () => {
      const mockTestResult = {
        success: false,
        status: 'connection_failed',
        error: 'Network error'
      };

      mockGdeltService.testConnection.mockResolvedValue(mockTestResult);

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.data.error).toBe('Network error');
      expect(response.body.message).toBe('GDELT API connection failed');
    });

    test('should handle test connection errors', async () => {
      mockGdeltService.testConnection.mockRejectedValue(new Error('Test error'));

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Test error');
    });
  });
});