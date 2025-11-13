/**
 * GDELT API Service Unit Tests
 */

const GdeltApiService = require('../services/gdeltApiService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('GdeltApiService', () => {
  let gdeltService;

  beforeEach(() => {
    gdeltService = new GdeltApiService();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      expect(gdeltService.baseUrl).toBe('https://api.gdeltproject.org/api/v2');
      expect(gdeltService.defaultLanguage).toBe('english');
      expect(gdeltService.defaultFormat).toBe('json');
      expect(gdeltService.defaultTimespan).toBe('3days');
      expect(gdeltService.crisisThemes).toContain('CRISIS');
      expect(gdeltService.priorityCountries).toContain('US');
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests when under rate limit', () => {
      expect(gdeltService.canMakeRequest()).toBe(true);
    });

    test('should block requests when over rate limit', () => {
      // Simulate hitting rate limit
      gdeltService.requestCount = gdeltService.maxRequestsPerMinute;
      expect(gdeltService.canMakeRequest()).toBe(false);
    });

    test('should reset rate limit after time window', () => {
      gdeltService.requestCount = gdeltService.maxRequestsPerMinute;
      gdeltService.lastReset = Date.now() - 61000; // 61 seconds ago
      
      expect(gdeltService.canMakeRequest()).toBe(true);
      expect(gdeltService.requestCount).toBe(0);
    });
  });

  describe('getGlobalEvents', () => {
    const mockResponse = {
      data: {
        articles: [
          {
            title: 'Test Crisis Event',
            content: 'Test content about crisis',
            url: 'https://example.com/test',
            seendate: '2024-01-01T12:00:00Z',
            domain: 'example.com',
            sourcecountry: 'US',
            sourcelang: 'english',
            tone: '-2.5'
          }
        ]
      }
    };

    test('should fetch global events successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await gdeltService.getGlobalEvents({
        query: 'crisis',
        maxrecords: 10
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.gdeltproject.org/api/v2/doc/doc',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'crisis',
            maxrecords: 10,
            mode: 'artlist',
            format: 'json'
          })
        })
      );

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Test Crisis Event');
      expect(result.events[0].platform).toBe('gdelt');
      expect(result.metadata.source).toBe('gdelt');
    });

    test('should handle rate limit exceeded', async () => {
      gdeltService.requestCount = gdeltService.maxRequestsPerMinute;

      await expect(gdeltService.getGlobalEvents()).rejects.toThrow(
        'GDELT API rate limit exceeded'
      );
    });

    test('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(gdeltService.getGlobalEvents()).rejects.toThrow(
        'Failed to fetch global events: Network error'
      );
    });
  });

  describe('monitorCrisisEvents', () => {
    test('should return empty result when rate limited', async () => {
      gdeltService.requestCount = gdeltService.maxRequestsPerMinute;

      const result = await gdeltService.monitorCrisisEvents();

      expect(result.events).toHaveLength(0);
      expect(result.metadata.rateLimited).toBe(true);
    });

    test('should monitor crisis events successfully', async () => {
      const mockResponse = {
        data: {
          articles: [
            {
              title: 'Emergency Alert Test',
              content: 'Emergency content',
              url: 'https://example.com/emergency',
              seendate: '2024-01-01T12:00:00Z',
              domain: 'news.com',
              sourcecountry: 'US',
              sourcelang: 'english',
              tone: '-5.0'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await gdeltService.monitorCrisisEvents();

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toHaveProperty('crisisScore');
      expect(result.events[0]).toHaveProperty('urgencyLevel');
      expect(result.events[0]).toHaveProperty('geographicRelevance');
      expect(result.metadata.type).toBe('crisis');
    });
  });

  describe('searchEvents', () => {
    test('should search events successfully', async () => {
      const mockResponse = {
        data: {
          articles: [
            {
              title: 'Earthquake News',
              content: 'Earthquake content',
              url: 'https://example.com/earthquake',
              seendate: '2024-01-01T12:00:00Z',
              domain: 'geology.com',
              sourcecountry: 'JP',
              sourcelang: 'english',
              tone: '-3.0'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await gdeltService.searchEvents('earthquake', {
        timespan: '1day',
        maxrecords: 50
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.gdeltproject.org/api/v2/doc/doc',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'earthquake',
            timespan: '1day',
            maxrecords: 50
          })
        })
      );

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Earthquake News');
      expect(result.metadata.type).toBe('search');
    });
  });

  describe('Crisis Score Calculation', () => {
    test('should calculate crisis score correctly', () => {
      const event = {
        title: 'Emergency flood crisis disaster',
        content: 'Emergency situation with flood and disaster',
        tone: { negative: true, score: -5.0 },
        themes: ['CRISIS', 'DISASTER'],
        publishedAt: new Date().toISOString() // Recent event
      };

      const score = gdeltService.calculateCrisisScore(event);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should assign higher scores to recent negative events', () => {
      const recentEvent = {
        title: 'Emergency crisis',
        content: 'Crisis content',
        tone: { negative: true, score: -8.0 },
        themes: ['CRISIS'],
        publishedAt: new Date().toISOString()
      };

      const oldEvent = {
        title: 'Emergency crisis',
        content: 'Crisis content',
        tone: { negative: true, score: -8.0 },
        themes: ['CRISIS'],
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 48 hours ago
      };

      const recentScore = gdeltService.calculateCrisisScore(recentEvent);
      const oldScore = gdeltService.calculateCrisisScore(oldEvent);

      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  describe('Urgency Level Determination', () => {
    test('should determine urgency levels correctly', () => {
      const criticalEvent = { crisisScore: 0.9 };
      const highEvent = { crisisScore: 0.7 };
      const mediumEvent = { crisisScore: 0.5 };
      const lowEvent = { crisisScore: 0.2 };

      expect(gdeltService.determineUrgencyLevel(criticalEvent)).toBe('critical');
      expect(gdeltService.determineUrgencyLevel(highEvent)).toBe('high');
      expect(gdeltService.determineUrgencyLevel(mediumEvent)).toBe('medium');
      expect(gdeltService.determineUrgencyLevel(lowEvent)).toBe('low');
    });
  });

  describe('Geographic Analysis', () => {
    test('should calculate geographic relevance correctly', () => {
      const usEvent = {
        location: { country: 'US' }
      };

      const unknownEvent = {
        location: { country: 'XX' }
      };

      const usRelevance = gdeltService.calculateGeographicRelevance(usEvent);
      const unknownRelevance = gdeltService.calculateGeographicRelevance(unknownEvent);

      expect(usRelevance.isPriorityCountry).toBe(true);
      expect(usRelevance.relevanceScore).toBe(0.8);
      expect(unknownRelevance.isPriorityCountry).toBe(false);
      expect(unknownRelevance.relevanceScore).toBe(0.5);
    });

    test('should analyze geographic distribution', () => {
      const events = [
        { location: { country: 'US' }, geographicRelevance: { region: 'North America' } },
        { location: { country: 'US' }, geographicRelevance: { region: 'North America' } },
        { location: { country: 'IN' }, geographicRelevance: { region: 'Asia' } }
      ];

      const distribution = gdeltService.analyzeGeographicDistribution(events);

      expect(distribution.byCountry).toEqual([['US', 2], ['IN', 1]]);
      expect(distribution.byRegion).toEqual([['North America', 2], ['Asia', 1]]);
      expect(distribution.totalCountries).toBe(2);
      expect(distribution.totalRegions).toBe(2);
    });
  });

  describe('Service Status', () => {
    test('should return correct service status', () => {
      const status = gdeltService.getServiceStatus();

      expect(status.service).toBe('GDELT API');
      expect(status.status).toBe('configured');
      expect(status.apiKey).toBe('not_required');
      expect(status.baseUrl).toBe('https://api.gdeltproject.org/api/v2');
      expect(status).toHaveProperty('requestsUsed');
      expect(status).toHaveProperty('requestsRemaining');
    });
  });

  describe('Connection Test', () => {
    test('should test connection successfully', async () => {
      const mockResponse = {
        data: {
          articles: [{ title: 'Test article' }]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await gdeltService.testConnection();

      expect(result.success).toBe(true);
      expect(result.status).toBe('connected');
      expect(result.eventsFound).toBe(1);
    });

    test('should handle connection failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection failed'));

      const result = await gdeltService.testConnection();

      expect(result.success).toBe(false);
      expect(result.status).toBe('connection_failed');
      expect(result.error).toBe('Connection failed');
    });

    test('should handle rate limit during connection test', async () => {
      gdeltService.requestCount = gdeltService.maxRequestsPerMinute;

      const result = await gdeltService.testConnection();

      expect(result.success).toBe(false);
      expect(result.status).toBe('rate_limited');
    });
  });

  describe('Response Processing', () => {
    test('should handle empty response', () => {
      const result = gdeltService.processGdeltResponse({}, 'test');

      expect(result.events).toHaveLength(0);
      expect(result.metadata.error).toBe('No articles found in response');
    });

    test('should process valid response correctly', () => {
      const response = {
        articles: [
          {
            title: 'Test Article',
            content: 'Test content',
            url: 'https://example.com',
            seendate: '2024-01-01T12:00:00Z',
            domain: 'example.com',
            sourcecountry: 'US',
            sourcelang: 'english',
            tone: '2.5'
          }
        ]
      };

      const result = gdeltService.processGdeltResponse(response, 'test');

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toHaveProperty('id');
      expect(result.events[0]).toHaveProperty('title');
      expect(result.events[0]).toHaveProperty('platform', 'gdelt');
      expect(result.events[0]).toHaveProperty('tone');
      expect(result.events[0].tone.positive).toBe(true);
      expect(result.metadata.source).toBe('gdelt');
      expect(result.metadata.type).toBe('test');
    });
  });
});