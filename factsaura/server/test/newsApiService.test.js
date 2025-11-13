/**
 * NewsAPI Service Tests
 * Tests for NewsAPI.org integration functionality
 */

const NewsApiService = require('../services/newsApiService');

// Mock NewsAPI to avoid actual API calls during testing
jest.mock('newsapi');

describe('NewsApiService', () => {
  let newsApiService;
  let mockNewsAPI;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.NEWSAPI_KEY = 'test-api-key';
    process.env.CRISIS_KEYWORDS = 'flood,earthquake,emergency,scam';
    
    // Mock NewsAPI constructor and methods
    mockNewsAPI = {
      v2: {
        topHeadlines: jest.fn(),
        everything: jest.fn()
      }
    };
    
    require('newsapi').mockImplementation(() => mockNewsAPI);
    
    newsApiService = new NewsApiService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with correct configuration', () => {
      expect(newsApiService.apiKey).toBe('test-api-key');
      expect(newsApiService.crisisKeywords).toEqual(['flood', 'earthquake', 'emergency', 'scam']);
      expect(newsApiService.trustedSources).toContain('reuters');
      expect(newsApiService.maxRequestsPerHour).toBe(100);
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests when under limit', () => {
      expect(newsApiService.canMakeRequest()).toBe(true);
    });

    test('should block requests when over limit', () => {
      newsApiService.requestCount = 100;
      expect(newsApiService.canMakeRequest()).toBe(false);
    });

    test('should reset counter after an hour', () => {
      newsApiService.requestCount = 100;
      newsApiService.lastReset = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      
      expect(newsApiService.canMakeRequest()).toBe(true);
      expect(newsApiService.requestCount).toBe(0);
    });
  });

  describe('getTrendingNews', () => {
    test('should fetch trending news successfully', async () => {
      const mockResponse = {
        status: 'ok',
        totalResults: 2,
        articles: [
          {
            title: 'Test Article 1',
            description: 'Test description',
            content: 'Test content',
            url: 'https://example.com/article1',
            urlToImage: 'https://example.com/image1.jpg',
            publishedAt: '2025-01-01T12:00:00Z',
            source: { id: 'reuters', name: 'Reuters' },
            author: 'Test Author'
          },
          {
            title: 'Test Article 2',
            description: 'Another test description',
            content: 'Another test content',
            url: 'https://example.com/article2',
            urlToImage: null,
            publishedAt: '2025-01-01T11:00:00Z',
            source: { id: 'unknown-source', name: 'Unknown Source' },
            author: null
          }
        ]
      };

      mockNewsAPI.v2.topHeadlines.mockResolvedValue(mockResponse);

      const result = await newsApiService.getTrendingNews();

      expect(mockNewsAPI.v2.topHeadlines).toHaveBeenCalledWith({
        country: 'us',
        category: 'general',
        pageSize: 20,
        page: 1
      });

      expect(result.articles).toHaveLength(2);
      expect(result.articles[0].title).toBe('Test Article 1');
      expect(result.articles[0].source.credibility.isTrusted).toBe(true);
      expect(result.articles[1].source.credibility.isTrusted).toBe(false);
      expect(result.metadata.source).toBe('newsapi');
      expect(result.metadata.type).toBe('trending');
    });

    test('should handle rate limit exceeded', async () => {
      newsApiService.requestCount = 100;

      await expect(newsApiService.getTrendingNews()).rejects.toThrow('NewsAPI rate limit exceeded');
    });

    test('should handle API errors', async () => {
      mockNewsAPI.v2.topHeadlines.mockRejectedValue(new Error('API Error'));

      await expect(newsApiService.getTrendingNews()).rejects.toThrow('Failed to fetch trending news');
    });
  });

  describe('searchNews', () => {
    test('should search news successfully', async () => {
      const mockResponse = {
        status: 'ok',
        totalResults: 1,
        articles: [
          {
            title: 'Search Result',
            description: 'Search description',
            content: 'Search content',
            url: 'https://example.com/search',
            urlToImage: null,
            publishedAt: '2025-01-01T10:00:00Z',
            source: { id: 'bbc-news', name: 'BBC News' },
            author: 'BBC Reporter'
          }
        ]
      };

      mockNewsAPI.v2.everything.mockResolvedValue(mockResponse);

      const result = await newsApiService.searchNews('test query');

      expect(mockNewsAPI.v2.everything).toHaveBeenCalledWith({
        q: 'test query',
        sortBy: 'publishedAt',
        pageSize: 20,
        page: 1,
        from: null,
        to: null,
        sources: null
      });

      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('Search Result');
      expect(result.metadata.query).toBe('test query');
      expect(result.metadata.type).toBe('search');
    });
  });

  describe('monitorCrisisContent', () => {
    test('should monitor crisis content successfully', async () => {
      const mockResponse = {
        status: 'ok',
        totalResults: 1,
        articles: [
          {
            title: 'Emergency Flood Warning',
            description: 'Flood emergency in the city',
            content: 'Emergency flood situation requires immediate attention',
            url: 'https://example.com/flood-warning',
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { id: 'reuters', name: 'Reuters' },
            author: 'Emergency Reporter'
          }
        ]
      };

      mockNewsAPI.v2.everything.mockResolvedValue(mockResponse);

      const result = await newsApiService.monitorCrisisContent();

      expect(mockNewsAPI.v2.everything).toHaveBeenCalledWith({
        q: 'flood OR earthquake OR emergency OR scam',
        sortBy: 'publishedAt',
        pageSize: 50,
        from: expect.any(String)
      });

      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].crisisScore).toBeGreaterThan(0);
      expect(result.articles[0].urgencyLevel).toBeDefined();
      expect(result.metadata.type).toBe('crisis');
    });

    test('should handle rate limit gracefully during crisis monitoring', async () => {
      newsApiService.requestCount = 100;

      const result = await newsApiService.monitorCrisisContent();

      expect(result.articles).toHaveLength(0);
      expect(result.metadata.rateLimited).toBe(true);
    });
  });

  describe('Source Credibility', () => {
    test('should identify trusted sources correctly', () => {
      const trustedResult = newsApiService.getSourceCredibility('reuters');
      expect(trustedResult.isTrusted).toBe(true);
      expect(trustedResult.credibilityScore).toBe(0.9);
      expect(trustedResult.verificationStatus).toBe('verified');

      const untrustedResult = newsApiService.getSourceCredibility('unknown-blog');
      expect(untrustedResult.isTrusted).toBe(false);
      expect(untrustedResult.credibilityScore).toBe(0.6);
      expect(untrustedResult.verificationStatus).toBe('unverified');
    });
  });

  describe('Crisis Scoring', () => {
    test('should calculate crisis score correctly', () => {
      const article = {
        title: 'Emergency Flood Warning',
        description: 'Urgent flood emergency situation',
        content: 'Emergency flood requires immediate evacuation',
        publishedAt: new Date().toISOString(),
        source: { credibility: { isTrusted: true } }
      };

      const score = newsApiService.calculateCrisisScore(article);
      expect(score).toBeGreaterThan(0.5); // Should be high due to keywords + trusted source + recent
    });

    test('should determine urgency levels correctly', () => {
      const criticalArticle = { crisisScore: 0.9 };
      const highArticle = { crisisScore: 0.7 };
      const mediumArticle = { crisisScore: 0.5 };
      const lowArticle = { crisisScore: 0.2 };

      expect(newsApiService.determineUrgencyLevel(criticalArticle)).toBe('critical');
      expect(newsApiService.determineUrgencyLevel(highArticle)).toBe('high');
      expect(newsApiService.determineUrgencyLevel(mediumArticle)).toBe('medium');
      expect(newsApiService.determineUrgencyLevel(lowArticle)).toBe('low');
    });
  });

  describe('Service Status', () => {
    test('should return correct service status', () => {
      const status = newsApiService.getServiceStatus();

      expect(status.service).toBe('NewsAPI');
      expect(status.status).toBe('configured');
      expect(status.apiKey).toBe('present');
      expect(status.trustedSourcesCount).toBeGreaterThan(0);
      expect(status.crisisKeywordsCount).toBe(4);
    });

    test('should indicate missing API key', () => {
      process.env.NEWSAPI_KEY = '';
      const serviceWithoutKey = new NewsApiService();
      const status = serviceWithoutKey.getServiceStatus();

      expect(status.status).toBe('not_configured');
      expect(status.apiKey).toBe('missing');
    });
  });

  describe('testConnection', () => {
    test('should test connection successfully', async () => {
      const mockResponse = {
        status: 'ok',
        totalResults: 100,
        articles: []
      };

      mockNewsAPI.v2.topHeadlines.mockResolvedValue(mockResponse);

      const result = await newsApiService.testConnection();

      expect(result.success).toBe(true);
      expect(result.status).toBe('connected');
      expect(result.articlesFound).toBe(100);
    });

    test('should handle missing API key', async () => {
      process.env.NEWSAPI_KEY = '';
      const serviceWithoutKey = new NewsApiService();

      const result = await serviceWithoutKey.testConnection();

      expect(result.success).toBe(false);
      expect(result.status).toBe('not_configured');
    });

    test('should handle connection failures', async () => {
      mockNewsAPI.v2.topHeadlines.mockRejectedValue(new Error('Network error'));

      const result = await newsApiService.testConnection();

      expect(result.success).toBe(false);
      expect(result.status).toBe('connection_failed');
    });
  });
});

