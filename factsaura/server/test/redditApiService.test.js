/**
 * Reddit API Service Unit Tests
 */

const RedditApiService = require('../services/redditApiService');

// Mock snoowrap
jest.mock('snoowrap');
const snoowrap = require('snoowrap');

describe('RedditApiService', () => {
  let redditService;
  let mockReddit;

  beforeEach(() => {
    // Reset environment variables
    process.env.REDDIT_CLIENT_ID = 'test_client_id';
    process.env.REDDIT_CLIENT_SECRET = 'test_client_secret';
    process.env.REDDIT_USERNAME = 'test_username';
    process.env.REDDIT_PASSWORD = 'test_password';
    process.env.REDDIT_USER_AGENT = 'TestAgent:v1.0.0';
    process.env.REDDIT_CRISIS_SUBREDDITS = 'news,worldnews,emergencies';
    process.env.REDDIT_TRENDING_SUBREDDITS = 'all,popular,technology';
    process.env.CRISIS_KEYWORDS = 'emergency,crisis,fake,misinformation';

    // Mock Reddit API responses
    mockReddit = {
      config: jest.fn(),
      getSubreddit: jest.fn()
    };

    snoowrap.mockImplementation(() => mockReddit);

    redditService = new RedditApiService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with valid credentials', () => {
      expect(redditService.clientId).toBe('test_client_id');
      expect(redditService.clientSecret).toBe('test_client_secret');
      expect(redditService.username).toBe('test_username');
      expect(redditService.password).toBe('test_password');
      expect(redditService.reddit).toBeTruthy();
    });

    test('should not initialize Reddit API with invalid credentials', () => {
      process.env.REDDIT_CLIENT_ID = 'your_reddit_client_id';
      const serviceWithInvalidCreds = new RedditApiService();
      expect(serviceWithInvalidCreds.reddit).toBeNull();
    });

    test('should parse crisis subreddits correctly', () => {
      expect(redditService.crisisSubreddits).toEqual(['news', 'worldnews', 'emergencies']);
    });

    test('should parse trending subreddits correctly', () => {
      expect(redditService.trendingSubreddits).toEqual(['all', 'popular', 'technology']);
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests within rate limit', () => {
      expect(redditService.canMakeRequest()).toBe(true);
    });

    test('should block requests when rate limit exceeded', () => {
      redditService.requestCount = 60; // Exceed limit
      expect(redditService.canMakeRequest()).toBe(false);
    });

    test('should reset rate limit after time window', () => {
      redditService.requestCount = 60;
      redditService.lastReset = Date.now() - 61000; // 61 seconds ago
      expect(redditService.canMakeRequest()).toBe(true);
      expect(redditService.requestCount).toBe(0);
    });

    test('should increment request count', () => {
      const initialCount = redditService.requestCount;
      redditService.incrementRequestCount();
      expect(redditService.requestCount).toBe(initialCount + 1);
    });
  });

  describe('getTrendingPosts', () => {
    beforeEach(() => {
      const mockPosts = [
        {
          id: 'test1',
          title: 'Test Post 1',
          selftext: 'Test content',
          permalink: '/r/test/comments/test1',
          url: 'https://reddit.com/r/test/comments/test1',
          author: { name: 'testuser' },
          subreddit: { display_name: 'test' },
          score: 100,
          upvote_ratio: 0.85,
          num_comments: 25,
          created_utc: Date.now() / 1000,
          is_video: false,
          is_self: true,
          post_hint: null,
          link_flair_text: null,
          over_18: false,
          stickied: false,
          locked: false
        }
      ];

      const mockSubreddit = {
        getHot: jest.fn().mockResolvedValue(mockPosts),
        getNew: jest.fn().mockResolvedValue(mockPosts),
        getRising: jest.fn().mockResolvedValue(mockPosts),
        getTop: jest.fn().mockResolvedValue(mockPosts)
      };

      mockReddit.getSubreddit.mockReturnValue(mockSubreddit);
    });

    test('should fetch trending posts successfully', async () => {
      const result = await redditService.getTrendingPosts({
        subreddit: 'test',
        sort: 'hot',
        limit: 10
      });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post 1');
      expect(result.posts[0].platform).toBe('reddit');
      expect(result.metadata.source).toBe('reddit');
      expect(result.metadata.type).toBe('trending');
    });

    test('should handle different sort options', async () => {
      await redditService.getTrendingPosts({ sort: 'new' });
      expect(mockReddit.getSubreddit().getNew).toHaveBeenCalled();

      await redditService.getTrendingPosts({ sort: 'rising' });
      expect(mockReddit.getSubreddit().getRising).toHaveBeenCalled();

      await redditService.getTrendingPosts({ sort: 'top', timeframe: 'week' });
      expect(mockReddit.getSubreddit().getTop).toHaveBeenCalledWith({ time: 'week', limit: 25 });
    });

    test('should throw error when Reddit API not configured', async () => {
      redditService.reddit = null;
      await expect(redditService.getTrendingPosts()).rejects.toThrow('Reddit API not configured');
    });

    test('should throw error when rate limited', async () => {
      redditService.requestCount = 60;
      await expect(redditService.getTrendingPosts()).rejects.toThrow('rate limit exceeded');
    });
  });

  describe('searchPosts', () => {
    beforeEach(() => {
      const mockPosts = [
        {
          id: 'search1',
          title: 'Search Result 1',
          selftext: 'Search content',
          permalink: '/r/test/comments/search1',
          url: 'https://reddit.com/r/test/comments/search1',
          author: { name: 'searchuser' },
          subreddit: { display_name: 'test' },
          score: 50,
          upvote_ratio: 0.75,
          num_comments: 10,
          created_utc: Date.now() / 1000,
          is_video: false,
          is_self: true,
          post_hint: null,
          link_flair_text: null,
          over_18: false,
          stickied: false,
          locked: false
        }
      ];

      const mockSubreddit = {
        search: jest.fn().mockResolvedValue(mockPosts)
      };

      mockReddit.getSubreddit.mockReturnValue(mockSubreddit);
    });

    test('should search posts successfully', async () => {
      const result = await redditService.searchPosts('test query', {
        subreddit: 'test',
        sort: 'relevance',
        limit: 10
      });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Search Result 1');
      expect(result.metadata.type).toBe('search');
      expect(result.metadata.context.query).toBe('test query');
    });

    test('should pass correct search options', async () => {
      await redditService.searchPosts('misinformation', {
        subreddit: 'news',
        sort: 'top',
        timeframe: 'week',
        limit: 5
      });

      expect(mockReddit.getSubreddit().search).toHaveBeenCalledWith({
        query: 'misinformation',
        sort: 'top',
        time: 'week',
        limit: 5
      });
    });
  });

  describe('Crisis Content Detection', () => {
    test('should detect crisis keywords', () => {
      const post = {
        title: 'Emergency situation developing',
        content: 'This is a crisis alert'
      };

      expect(redditService.containsCrisisKeywords(post)).toBe(true);
    });

    test('should detect crisis indicators', () => {
      const post = {
        subreddit: 'news',
        score: 150,
        flair: 'BREAKING NEWS',
        numComments: 60,
        upvoteRatio: 0.6
      };

      expect(redditService.hasCrisisIndicators(post)).toBe(true);
    });

    test('should calculate crisis score correctly', () => {
      const post = {
        title: 'Emergency fake news crisis',
        content: 'Misinformation spreading',
        subreddit: 'news',
        score: 500,
        numComments: 100,
        upvoteRatio: 0.5,
        created: new Date().toISOString()
      };

      const score = redditService.calculateCrisisScore(post);
      expect(score).toBeGreaterThan(0.5);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    test('should determine urgency levels', () => {
      const highCrisisPost = { crisisScore: 0.9 };
      const mediumCrisisPost = { crisisScore: 0.5 };
      const lowCrisisPost = { crisisScore: 0.2 };

      expect(redditService.determineUrgencyLevel(highCrisisPost)).toBe('critical');
      expect(redditService.determineUrgencyLevel(mediumCrisisPost)).toBe('medium');
      expect(redditService.determineUrgencyLevel(lowCrisisPost)).toBe('low');
    });
  });

  describe('processRedditResponse', () => {
    test('should process Reddit posts correctly', () => {
      const mockPosts = [
        {
          id: 'test1',
          title: 'Test Post',
          selftext: 'Test content',
          permalink: '/r/test/comments/test1',
          url: 'https://reddit.com/r/test/comments/test1',
          author: { name: 'testuser' },
          subreddit: { display_name: 'test' },
          score: 100,
          upvote_ratio: 0.85,
          num_comments: 25,
          created_utc: Date.now() / 1000,
          is_video: false,
          is_self: true,
          post_hint: null,
          link_flair_text: 'Discussion',
          over_18: false,
          stickied: false,
          locked: false
        }
      ];

      const result = redditService.processRedditResponse(mockPosts, 'test', { subreddit: 'test' });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject({
        title: 'Test Post',
        content: 'Test content',
        author: 'testuser',
        subreddit: 'test',
        score: 100,
        platform: 'reddit',
        contentType: 'reddit_post'
      });
      expect(result.metadata.source).toBe('reddit');
      expect(result.metadata.type).toBe('test');
    });

    test('should handle deleted authors', () => {
      const mockPosts = [
        {
          id: 'test1',
          title: 'Test Post',
          selftext: 'Test content',
          permalink: '/r/test/comments/test1',
          url: 'https://reddit.com/r/test/comments/test1',
          author: null,
          subreddit: { display_name: 'test' },
          score: 100,
          upvote_ratio: 0.85,
          num_comments: 25,
          created_utc: Date.now() / 1000,
          is_video: false,
          is_self: true,
          post_hint: null,
          link_flair_text: null,
          over_18: false,
          stickied: false,
          locked: false
        }
      ];

      const result = redditService.processRedditResponse(mockPosts, 'test');
      expect(result.posts[0].author).toBe('[deleted]');
    });
  });

  describe('Service Status and Health', () => {
    test('should return correct service status', () => {
      const status = redditService.getServiceStatus();

      expect(status.service).toBe('Reddit API');
      expect(status.status).toBe('configured');
      expect(status.credentials).toBe('present');
      expect(status.crisisSubredditsCount).toBe(3);
      expect(status.trendingSubredditsCount).toBe(3);
    });

    test('should return not configured status with invalid credentials', () => {
      process.env.REDDIT_CLIENT_ID = 'your_reddit_client_id';
      const serviceWithInvalidCreds = new RedditApiService();
      const status = serviceWithInvalidCreds.getServiceStatus();

      expect(status.status).toBe('not_configured');
      expect(status.credentials).toBe('missing');
    });
  });

  describe('generatePostId', () => {
    test('should generate unique post ID', () => {
      const post = {
        id: 'abc123',
        created_utc: 1234567890,
        subreddit: { display_name: 'test' }
      };

      const id = redditService.generatePostId(post);
      expect(id).toBe('reddit-1234567890-test-abc123');
    });
  });
});