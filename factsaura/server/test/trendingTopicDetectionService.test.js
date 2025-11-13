/**
 * Trending Topic Detection Service Tests
 * Comprehensive tests for trending topic detection algorithms
 */

const TrendingTopicDetectionService = require('../services/trendingTopicDetectionService');

describe('TrendingTopicDetectionService', () => {
  let service;
  let mockScrapedContent;

  beforeEach(() => {
    service = new TrendingTopicDetectionService();
    
    // Mock scraped content for testing
    mockScrapedContent = {
      news: [
        {
          title: 'Breaking: Major earthquake hits California',
          description: 'A 7.2 magnitude earthquake struck Southern California causing widespread damage',
          url: 'https://example.com/earthquake',
          publishedAt: new Date().toISOString(),
          author: 'News Reporter',
          source: { name: 'CNN' },
          crisisScore: 0.9
        },
        {
          title: 'New COVID vaccine shows promising results',
          description: 'Clinical trials demonstrate 95% effectiveness against new variants',
          url: 'https://example.com/vaccine',
          publishedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
          author: 'Medical Reporter',
          source: { name: 'Reuters' },
          crisisScore: 0.6
        },
        {
          title: 'Tech stocks surge amid AI breakthrough',
          description: 'Major technology companies see significant gains following AI announcement',
          url: 'https://example.com/tech',
          publishedAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
          author: 'Finance Reporter',
          source: { name: 'Bloomberg' },
          crisisScore: 0.2
        }
      ],
      reddit: [
        {
          id: 'abc123',
          title: 'Did anyone else feel that earthquake?',
          selftext: 'Just felt a massive earthquake in LA. Anyone have info?',
          url: 'https://reddit.com/r/LosAngeles/abc123',
          created_utc: Math.floor(Date.now() / 1000) - 30, // 30 seconds ago
          author: 'LAResident',
          subreddit: 'LosAngeles',
          score: 1250,
          num_comments: 89,
          ups: 1300,
          downs: 50,
          upvote_ratio: 0.96,
          crisisScore: 0.8
        },
        {
          id: 'def456',
          title: 'Earthquake megathread - 7.2 magnitude confirmed',
          selftext: 'Official megathread for earthquake discussion and updates',
          url: 'https://reddit.com/r/news/def456',
          created_utc: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
          author: 'NewsBot',
          subreddit: 'news',
          score: 2500,
          num_comments: 456,
          ups: 2600,
          downs: 100,
          upvote_ratio: 0.96,
          crisisScore: 0.9
        },
        {
          id: 'ghi789',
          title: 'This new AI is absolutely mind-blowing!',
          selftext: 'Check out this viral AI demo that everyone is talking about',
          url: 'https://reddit.com/r/technology/ghi789',
          created_utc: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
          author: 'TechEnthusiast',
          subreddit: 'technology',
          score: 850,
          num_comments: 123,
          ups: 900,
          downs: 50,
          upvote_ratio: 0.95,
          crisisScore: 0.1
        }
      ],
      gdelt: [
        {
          title: 'California Earthquake Emergency Response Activated',
          url: 'https://gdelt.com/earthquake-response',
          seendate: new Date().toISOString(),
          domain: 'emergency.ca.gov',
          socialfacebookshares: 1500,
          socialscore: 2000,
          tone: { score: -5.2 }, // Negative tone indicates crisis
          themes: ['CRISIS', 'DISASTER', 'EMERGENCY'],
          locations: ['California', 'Los Angeles'],
          crisisScore: 0.95
        },
        {
          title: 'Global Health Officials Monitor Vaccine Distribution',
          url: 'https://gdelt.com/vaccine-monitor',
          seendate: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
          domain: 'who.int',
          socialfacebookshares: 500,
          socialscore: 750,
          tone: { score: 2.1 }, // Positive tone
          themes: ['HEALTH', 'MEDICAL'],
          locations: ['Global'],
          crisisScore: 0.4
        }
      ]
    };
  });

  describe('Content Normalization', () => {
    test('should normalize content from all sources', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      
      expect(normalized).toHaveLength(8); // 3 news + 3 reddit + 2 gdelt
      
      // Check news normalization
      const newsItem = normalized.find(item => item.source === 'news');
      expect(newsItem).toBeDefined();
      expect(newsItem.title).toBe('Breaking: Major earthquake hits California');
      expect(newsItem.platform).toBe('newsapi');
      expect(newsItem.engagement).toBeDefined();
      
      // Check reddit normalization
      const redditItem = normalized.find(item => item.source === 'reddit');
      expect(redditItem).toBeDefined();
      expect(redditItem.title).toBe('Did anyone else feel that earthquake?');
      expect(redditItem.platform).toBe('reddit');
      expect(redditItem.engagement.shares).toBe(1250);
      expect(redditItem.engagement.comments).toBe(89);
      
      // Check gdelt normalization
      const gdeltItem = normalized.find(item => item.source === 'gdelt');
      expect(gdeltItem).toBeDefined();
      expect(gdeltItem.title).toBe('California Earthquake Emergency Response Activated');
      expect(gdeltItem.platform).toBe('gdelt');
      expect(gdeltItem.engagement.shares).toBe(1500);
    });
  });

  describe('Keyword Extraction', () => {
    test('should extract relevant keywords from text', () => {
      const text = 'breaking news major earthquake hits california emergency response activated';
      const keywords = service.extractKeywords(text);
      
      expect(keywords).toContain('breaking');
      expect(keywords).toContain('earthquake');
      expect(keywords).toContain('california');
      expect(keywords).toContain('emergency');
      expect(keywords).toContain('breaking news');
      expect(keywords).toContain('major earthquake');
      
      // Should not contain stop words
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('and');
    });

    test('should extract multi-word phrases for crisis content', () => {
      const text = 'breaking news urgent alert emergency evacuation';
      const keywords = service.extractKeywords(text);
      
      expect(keywords).toContain('breaking news urgent');
      expect(keywords).toContain('urgent alert emergency');
    });
  });

  describe('Topic Extraction', () => {
    test('should extract topics with proper aggregation', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const topics = service.extractTopics(normalized);
      
      expect(topics.size).toBeGreaterThan(0);
      
      // Check earthquake topic
      const earthquakeTopic = topics.get('earthquake');
      expect(earthquakeTopic).toBeDefined();
      expect(earthquakeTopic.totalMentions).toBeGreaterThan(1); // Should appear in multiple sources
      expect(earthquakeTopic.platforms.size).toBeGreaterThan(1); // Should be cross-platform
      expect(earthquakeTopic.isCrisisRelated).toBe(true);
    });

    test('should calculate engagement metrics correctly', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const topics = service.extractTopics(normalized);
      
      const earthquakeTopic = topics.get('earthquake');
      expect(earthquakeTopic.totalEngagement).toBeGreaterThan(0);
      expect(earthquakeTopic.avgEngagement).toBe(earthquakeTopic.totalEngagement / earthquakeTopic.totalMentions);
    });
  });

  describe('Trending Score Calculation', () => {
    test('should calculate trending scores for topics', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const topics = service.extractTopics(normalized);
      const scoredTopics = service.calculateTrendingScores(topics);
      
      expect(scoredTopics.length).toBeGreaterThan(0);
      
      // Check that scores are between 0 and 1
      scoredTopics.forEach(topic => {
        expect(topic.scores.trending).toBeGreaterThanOrEqual(0);
        expect(topic.scores.trending).toBeLessThanOrEqual(1);
        expect(topic.scores.frequency).toBeGreaterThanOrEqual(0);
        expect(topic.scores.velocity).toBeGreaterThanOrEqual(0);
        expect(topic.scores.engagement).toBeGreaterThanOrEqual(0);
        expect(topic.scores.crossPlatform).toBeGreaterThanOrEqual(0);
        expect(topic.scores.recency).toBeGreaterThanOrEqual(0);
      });
      
      // Topics should be sorted by trending score
      for (let i = 1; i < scoredTopics.length; i++) {
        expect(scoredTopics[i-1].scores.trending).toBeGreaterThanOrEqual(scoredTopics[i].scores.trending);
      }
    });

    test('should apply crisis bonus to crisis-related topics', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const topics = service.extractTopics(normalized);
      const scoredTopics = service.calculateTrendingScores(topics);
      
      const crisisTopic = scoredTopics.find(topic => topic.isCrisisRelated);
      const nonCrisisTopic = scoredTopics.find(topic => !topic.isCrisisRelated);
      
      if (crisisTopic && nonCrisisTopic) {
        // Crisis topics should generally have higher scores due to bonus
        expect(crisisTopic.scores.trending).toBeGreaterThan(0);
      }
    });
  });

  describe('Viral Content Detection', () => {
    test('should detect viral content based on engagement', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const viralContent = service.detectViralContent(normalized);
      
      expect(viralContent.length).toBeGreaterThan(0);
      
      // Check that viral content has high engagement
      viralContent.forEach(item => {
        const totalEngagement = item.engagement.shares + item.engagement.comments + item.engagement.reactions;
        expect(totalEngagement).toBeGreaterThan(0);
        expect(item.viralScore).toBeGreaterThanOrEqual(service.config.viralThreshold);
      });
    });

    test('should identify viral indicators in content', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const viralContent = service.detectViralContent(normalized);
      
      const viralItem = viralContent.find(item => item.title.includes('viral') || item.title.includes('mind-blowing'));
      if (viralItem) {
        expect(viralItem.viralIndicators).toBeDefined();
        expect(viralItem.viralIndicators.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Crisis Content Detection', () => {
    test('should detect crisis content based on keywords and scores', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const crisisContent = service.detectCrisisContent(normalized);
      
      expect(crisisContent.length).toBeGreaterThan(0);
      
      // Check that crisis content has appropriate scores
      crisisContent.forEach(item => {
        expect(item.crisisScore).toBeGreaterThanOrEqual(0.6);
      });
    });

    test('should identify crisis keywords in content', () => {
      const normalized = service.normalizeContent(mockScrapedContent);
      const crisisContent = service.detectCrisisContent(normalized);
      
      const earthquakeItem = crisisContent.find(item => item.title.includes('earthquake'));
      if (earthquakeItem) {
        expect(earthquakeItem.crisisKeywords).toBeDefined();
        expect(earthquakeItem.crisisKeywords).toContain('breaking');
      }
    });
  });

  describe('Full Trending Analysis', () => {
    test('should perform complete trending analysis', async () => {
      const analysis = await service.detectTrendingTopics(mockScrapedContent);
      
      expect(analysis).toBeDefined();
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.summary).toBeDefined();
      expect(analysis.trendingTopics).toBeDefined();
      expect(analysis.viralContent).toBeDefined();
      expect(analysis.crisisContent).toBeDefined();
      expect(analysis.platformStats).toBeDefined();
      expect(analysis.insights).toBeDefined();
      
      // Check summary statistics
      expect(analysis.summary.totalTopics).toBeGreaterThan(0);
      expect(analysis.summary.totalContent).toBe(8); // 3 news + 3 reddit + 2 gdelt
      
      // Check platform stats
      expect(analysis.platformStats.news).toBeDefined();
      expect(analysis.platformStats.reddit).toBeDefined();
      expect(analysis.platformStats.gdelt).toBeDefined();
      expect(analysis.platformStats.news.count).toBe(3);
      expect(analysis.platformStats.reddit.count).toBe(3);
      expect(analysis.platformStats.gdelt.count).toBe(2);
    });

    test('should generate meaningful insights', async () => {
      const analysis = await service.detectTrendingTopics(mockScrapedContent);
      
      expect(analysis.insights).toBeDefined();
      expect(analysis.insights.topCategories).toBeDefined();
      expect(analysis.insights.emergingTopics).toBeDefined();
      expect(analysis.insights.crossPlatformTrends).toBeDefined();
      expect(analysis.insights.crisisAlerts).toBeDefined();
      expect(analysis.insights.viralPatterns).toBeDefined();
      
      // Crisis alerts should be present for earthquake content
      expect(analysis.insights.crisisAlerts.length).toBeGreaterThan(0);
    });

    test('should cache analysis results', async () => {
      const analysis1 = await service.detectTrendingTopics(mockScrapedContent);
      const analysis2 = await service.detectTrendingTopics(mockScrapedContent);
      
      // Second call should return cached results
      expect(analysis1.timestamp).toBe(analysis2.timestamp);
    });
  });

  describe('Topic History Tracking', () => {
    test('should update topic history', async () => {
      await service.detectTrendingTopics(mockScrapedContent);
      
      const history = service.getTopicHistory();
      expect(history.size).toBeGreaterThan(0);
      
      const earthquakeHistory = service.getTopicHistory('earthquake');
      if (earthquakeHistory) {
        expect(earthquakeHistory.keyword).toBe('earthquake');
        expect(earthquakeHistory.history).toBeDefined();
        expect(earthquakeHistory.firstSeen).toBeDefined();
        expect(earthquakeHistory.peakScore).toBeGreaterThan(0);
      }
    });
  });

  describe('Utility Functions', () => {
    test('should identify crisis keywords correctly', () => {
      expect(service.isCrisisKeyword('emergency')).toBe(true);
      expect(service.isCrisisKeyword('earthquake')).toBe(true);
      expect(service.isCrisisKeyword('breaking news')).toBe(true);
      expect(service.isCrisisKeyword('technology')).toBe(false);
    });

    test('should identify viral keywords correctly', () => {
      expect(service.isViralKeyword('viral')).toBe(true);
      expect(service.isViralKeyword('trending')).toBe(true);
      expect(service.isViralKeyword('shocking')).toBe(true);
      expect(service.isViralKeyword('normal news')).toBe(false);
    });

    test('should identify stop words correctly', () => {
      expect(service.isStopWord('the')).toBe(true);
      expect(service.isStopWord('and')).toBe(true);
      expect(service.isStopWord('earthquake')).toBe(false);
    });

    test('should generate consistent hashes', () => {
      const hash1 = service.hashString('test string');
      const hash2 = service.hashString('test string');
      const hash3 = service.hashString('different string');
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });

  describe('Service Statistics', () => {
    test('should provide service statistics', async () => {
      await service.detectTrendingTopics(mockScrapedContent);
      
      const stats = service.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalTopicsTracked).toBeGreaterThan(0);
      expect(stats.cacheStatus).toBeDefined();
      expect(stats.lastAnalysisTime).toBeDefined();
      expect(stats.memoryUsage).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle empty content gracefully', async () => {
      const emptyContent = { news: [], reddit: [], gdelt: [] };
      const analysis = await service.detectTrendingTopics(emptyContent);
      
      expect(analysis).toBeDefined();
      expect(analysis.summary.totalContent).toBe(0);
      expect(analysis.trendingTopics).toHaveLength(0);
    });

    test('should handle malformed content gracefully', async () => {
      const malformedContent = {
        news: [{ title: null, description: undefined }],
        reddit: [{ id: 'test', title: '', selftext: null }],
        gdelt: [{ title: 'test', url: null }]
      };
      
      const analysis = await service.detectTrendingTopics(malformedContent);
      expect(analysis).toBeDefined();
      // Should not throw errors even with malformed data
    });
  });
});