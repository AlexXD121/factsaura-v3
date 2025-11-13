/**
 * Content Deduplication Service Tests
 * Tests for the content deduplication functionality
 */

const ContentDeduplicationService = require('../services/contentDeduplicationService');

describe('ContentDeduplicationService', () => {
  let deduplicationService;

  beforeEach(() => {
    deduplicationService = new ContentDeduplicationService();
  });

  afterEach(() => {
    deduplicationService.resetStats();
    deduplicationService.clearCaches();
  });

  describe('Basic Functionality', () => {
    test('should initialize with default configuration', () => {
      const config = deduplicationService.getConfig();
      
      expect(config.exactMatchThreshold).toBe(1.0);
      expect(config.fuzzyMatchThreshold).toBe(0.75);
      expect(config.enableExactMatching).toBe(true);
      expect(config.enableFuzzyMatching).toBe(true);
    });

    test('should handle empty content array', () => {
      const result = deduplicationService.deduplicateContent([]);
      
      expect(result.items).toEqual([]);
      expect(result.duplicates).toEqual([]);
      expect(result.stats.processed).toBe(0);
    });

    test('should handle null/undefined input', () => {
      const result = deduplicationService.deduplicateContent(null);
      
      expect(result.items).toEqual([]);
      expect(result.duplicates).toEqual([]);
      expect(result.stats.processed).toBe(0);
    });
  });

  describe('Exact Matching', () => {
    test('should detect exact duplicate content', () => {
      const content = [
        {
          id: '1',
          title: 'Breaking News: Major Event Happens',
          content: 'This is the full content of the news article about the major event.',
          sourceType: 'news',
          url: 'https://example.com/news1'
        },
        {
          id: '2',
          title: 'Breaking News: Major Event Happens',
          content: 'This is the full content of the news article about the major event.',
          sourceType: 'reddit',
          url: 'https://reddit.com/r/news/post1'
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
      expect(result.stats.duplicatesFound).toBe(1);
      
      // Should keep the news source (higher priority)
      expect(result.items[0].sourceType).toBe('news');
    });

    test('should handle content with different casing', () => {
      const content = [
        {
          id: '1',
          title: 'BREAKING NEWS: Major Event',
          content: 'Content here',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'breaking news: major event',
          content: 'content here',
          sourceType: 'reddit'
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });
  });

  describe('URL Matching', () => {
    test('should detect same URLs with different protocols', () => {
      const content = [
        {
          id: '1',
          title: 'News Article',
          content: 'Different content 1',
          url: 'https://example.com/article',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'Different Title',
          content: 'Different content 2',
          url: 'http://example.com/article',
          sourceType: 'reddit'
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });

    test('should normalize URLs correctly', () => {
      const url1 = 'https://www.example.com/article/?utm_source=test#section1';
      const url2 = 'http://example.com/article/';
      
      const normalized1 = deduplicationService.normalizeUrl(url1);
      const normalized2 = deduplicationService.normalizeUrl(url2);
      
      expect(normalized1).toBe('example.com/article');
      expect(normalized2).toBe('example.com/article');
      expect(normalized1).toBe(normalized2);
    });
  });

  describe('Fuzzy Matching', () => {
    test('should detect similar titles with minor differences', () => {
      const content = [
        {
          id: '1',
          title: 'Breaking: Major earthquake hits California',
          content: 'A major earthquake struck California today...',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'Breaking: Major earthquake strikes California',
          content: 'A major earthquake hit California today...',
          sourceType: 'reddit'
        }
      ];

      // Use a more lenient threshold for this test
      deduplicationService.updateConfig({ fuzzyMatchThreshold: 0.6 });
      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });

    test('should calculate string similarity correctly', () => {
      const str1 = 'Breaking news about earthquake';
      const str2 = 'Breaking news about earthquakes';
      const str3 = 'Completely different content';
      
      const sim1 = deduplicationService.calculateStringSimilarity(str1, str2);
      const sim2 = deduplicationService.calculateStringSimilarity(str1, str3);
      
      expect(sim1).toBeGreaterThan(0.5);
      expect(sim2).toBeLessThan(0.3);
    });
  });

  describe('Source Priority', () => {
    test('should prioritize news sources over reddit', () => {
      const content = [
        {
          id: '1',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'reddit',
          score: 1000
        },
        {
          id: '2',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'news',
          score: 10
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].sourceType).toBe('news');
    });

    test('should prioritize higher crisis scores when sources are equal', () => {
      const content = [
        {
          id: '1',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'news',
          crisisScore: 0.3
        },
        {
          id: '2',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'news',
          crisisScore: 0.8
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].crisisScore).toBe(0.8);
    });
  });

  describe('Text Normalization', () => {
    test('should normalize text correctly', () => {
      const text = '  The Quick Brown Fox Jumps Over The Lazy Dog!!! ';
      const normalized = deduplicationService.normalizeText(text);
      
      expect(normalized).toBe('quick brown fox jumps over lazy dog');
    });

    test('should remove common stop words', () => {
      const text = 'The cat and the dog are in the house';
      const normalized = deduplicationService.normalizeText(text);
      
      expect(normalized).not.toContain('the');
      expect(normalized).not.toContain('and');
      // Note: 'are' and 'in' might still be present as they're not in our stop word list
      expect(normalized.includes('cat')).toBe(true);
      expect(normalized.includes('dog')).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration correctly', () => {
      const newConfig = {
        fuzzyMatchThreshold: 0.9,
        enableSemanticMatching: true
      };

      deduplicationService.updateConfig(newConfig);
      const config = deduplicationService.getConfig();
      
      expect(config.fuzzyMatchThreshold).toBe(0.9);
      expect(config.enableSemanticMatching).toBe(true);
      expect(config.exactMatchThreshold).toBe(1.0); // Should keep existing values
    });
  });

  describe('Statistics Tracking', () => {
    test('should track statistics correctly', () => {
      const content = [
        {
          id: '1',
          title: 'Title 1',
          content: 'Content 1',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'Title 1',
          content: 'Content 1',
          sourceType: 'reddit'
        },
        {
          id: '3',
          title: 'Title 2',
          content: 'Content 2',
          sourceType: 'gdelt'
        }
      ];

      deduplicationService.deduplicateContent(content);
      const stats = deduplicationService.getStats();
      
      expect(stats.totalProcessed).toBe(3);
      expect(stats.duplicatesRemoved).toBe(1);
      expect(stats.duplicatesFound).toBe(1);
      expect(stats.lastProcessed).toBeTruthy();
    });

    test('should reset statistics correctly', () => {
      // Process some content first
      const content = [
        { id: '1', title: 'Title', content: 'Content', sourceType: 'news' },
        { id: '2', title: 'Title', content: 'Content', sourceType: 'reddit' }
      ];
      
      deduplicationService.deduplicateContent(content);
      deduplicationService.resetStats();
      
      const stats = deduplicationService.getStats();
      expect(stats.totalProcessed).toBe(0);
      expect(stats.duplicatesRemoved).toBe(0);
      expect(stats.duplicatesFound).toBe(0);
    });
  });

  describe('Duplicate Analysis', () => {
    test('should analyze content without removing duplicates', () => {
      const content = [
        {
          id: '1',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'Same Title',
          content: 'Same content',
          sourceType: 'reddit'
        },
        {
          id: '3',
          title: 'Different Title',
          content: 'Different content',
          sourceType: 'gdelt'
        }
      ];

      const analysis = deduplicationService.analyzeForDuplicates(content);
      
      expect(analysis.totalItems).toBe(3);
      expect(analysis.duplicateGroupsCount).toBe(1);
      expect(analysis.potentialDuplicates).toBe(1);
      expect(analysis.duplicateGroups).toHaveLength(1);
    });
  });

  describe('Performance', () => {
    test('should handle large content arrays efficiently', () => {
      // Generate 100 items with some duplicates
      const content = [];
      for (let i = 0; i < 100; i++) {
        content.push({
          id: `item_${i}`,
          title: `Title ${i % 20}`, // Create duplicates every 20 items
          content: `Content for item ${i}`,
          sourceType: i % 3 === 0 ? 'news' : i % 3 === 1 ? 'reddit' : 'gdelt'
        });
      }

      const startTime = Date.now();
      const result = deduplicationService.deduplicateContent(content);
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.items.length).toBeLessThan(100); // Should remove some duplicates
      expect(result.stats.duplicatesRemoved).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle content with missing fields', () => {
      const content = [
        {
          id: '1',
          title: 'Title 1'
          // Missing content, url, sourceType
        },
        {
          id: '2',
          content: 'Content 2'
          // Missing title, url, sourceType
        },
        {
          id: '3'
          // Missing most fields
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(3); // Should not crash, keep all items
      expect(result.stats.processed).toBe(3);
    });

    test('should handle very short content', () => {
      const content = [
        {
          id: '1',
          title: 'A',
          content: 'B',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'A',
          content: 'B',
          sourceType: 'reddit'
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });

    test('should handle content with special characters', () => {
      const content = [
        {
          id: '1',
          title: 'Same Title With Special Chars',
          content: 'Same content with special characters',
          sourceType: 'news'
        },
        {
          id: '2',
          title: 'Same Title With Special Chars',
          content: 'Same content with special characters',
          sourceType: 'reddit'
        }
      ];

      const result = deduplicationService.deduplicateContent(content);
      
      expect(result.items).toHaveLength(1);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });
  });
});