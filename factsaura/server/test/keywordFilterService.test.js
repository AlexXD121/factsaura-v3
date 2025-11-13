/**
 * Unit Tests for KeywordFilterService
 * Tests keyword-based content filtering functionality
 */

const KeywordFilterService = require('../services/keywordFilterService');

describe('KeywordFilterService', () => {
  let filterService;
  
  beforeEach(() => {
    filterService = new KeywordFilterService();
  });

  describe('Initialization', () => {
    test('should initialize with default keywords', () => {
      expect(filterService.keywords.crisis).toBeDefined();
      expect(filterService.keywords.misinformation).toBeDefined();
      expect(filterService.keywords.viral).toBeDefined();
      expect(filterService.keywords.spam).toBeDefined();
      expect(filterService.keywords.crisis.length).toBeGreaterThan(0);
    });

    test('should initialize with default configuration', () => {
      expect(filterService.config.caseSensitive).toBe(false);
      expect(filterService.config.partialMatch).toBe(true);
      expect(filterService.config.scoreThresholds).toBeDefined();
    });

    test('should initialize statistics', () => {
      const stats = filterService.getStats();
      expect(stats.totalFiltered).toBe(0);
      expect(stats.categoryMatches).toBeDefined();
    });
  });

  describe('Content Filtering', () => {
    const testContent = [
      {
        title: "Breaking: Emergency evacuation in progress",
        content: "Major disaster requires immediate evacuation of residents",
        source: "news"
      },
      {
        title: "Conspiracy theory about vaccines",
        content: "Government hiding truth about vaccine side effects, wake up sheeple",
        source: "social"
      },
      {
        title: "You won't believe this shocking news",
        content: "This viral video has gone viral and broken the internet",
        source: "blog"
      }
    ];

    test('should filter content and add scores', () => {
      const result = filterService.filterContent(testContent, {
        includeScores: true,
        includeMatches: true
      });

      expect(result.totalProcessed).toBe(3);
      expect(result.items).toHaveLength(3);
      
      result.items.forEach(item => {
        expect(item.keywordScores).toBeDefined();
        expect(item.overallKeywordScore).toBeDefined();
        expect(item.keywordMatches).toBeDefined();
      });
    });

    test('should detect crisis content', () => {
      const result = filterService.getCrisisContent(testContent, 0.01); // Lower threshold
      
      expect(result.totalFiltered).toBeGreaterThan(0);
      const crisisItem = result.items.find(item => 
        item.title.includes('Emergency evacuation')
      );
      expect(crisisItem).toBeDefined();
      expect(crisisItem.keywordScores.crisis).toBeGreaterThan(0);
    });

    test('should detect misinformation content', () => {
      const result = filterService.getMisinformationContent(testContent, 0.01); // Lower threshold
      
      expect(result.totalFiltered).toBeGreaterThan(0);
      const misinfoItem = result.items.find(item => 
        item.title.includes('Conspiracy theory')
      );
      expect(misinfoItem).toBeDefined();
      expect(misinfoItem.keywordScores.misinformation).toBeGreaterThan(0);
    });

    test('should remove spam content', () => {
      const spamContent = [{
        title: "Get rich quick - click here now!",
        content: "Make money fast, guaranteed results, limited time offer",
        source: "spam"
      }];

      const result = filterService.removeSpamContent(spamContent, 0.1); // Lower threshold to catch spam
      expect(result.spamRemoved).toBeGreaterThan(0);
    });
  });

  describe('Text Extraction', () => {
    test('should extract text from various item formats', () => {
      const item1 = { title: "Test Title", content: "Test Content" };
      const item2 = { title: "Test", description: "Description" };
      const item3 = { text: "Simple Text" };

      const text1 = filterService.extractTextContent(item1);
      const text2 = filterService.extractTextContent(item2);
      const text3 = filterService.extractTextContent(item3);

      expect(text1.toLowerCase()).toContain("test title");
      expect(text1.toLowerCase()).toContain("test content");
      expect(text2.toLowerCase()).toContain("description");
      expect(text3.toLowerCase()).toContain("simple text");
    });
  });

  describe('Category Analysis', () => {
    test('should analyze text against keyword categories', () => {
      const text = "breaking news emergency alert crisis situation";
      const result = filterService.analyzeCategory(text, 'crisis');

      expect(result.score).toBeGreaterThan(0);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.uniqueMatches).toBeGreaterThan(0);
    });

    test('should handle case sensitivity settings', () => {
      const text = "BREAKING NEWS EMERGENCY";
      
      // Case insensitive (default)
      const result1 = filterService.analyzeCategory(text, 'crisis');
      expect(result1.matches.length).toBeGreaterThan(0);

      // Case sensitive - should not match uppercase with lowercase keywords
      filterService.updateConfig({ caseSensitive: true });
      const result2 = filterService.analyzeCategory(text, 'crisis');
      expect(result2.matches.length).toBe(0); // Should not match because keywords are lowercase

      // Case sensitive - should match when case matches
      const result3 = filterService.analyzeCategory(text.toLowerCase(), 'crisis');
      expect(result3.matches.length).toBeGreaterThan(0);
    });
  });

  describe('Keyword Management', () => {
    test('should add keywords to categories', () => {
      const initialCount = filterService.getKeywords('crisis').length;
      filterService.addKeywords('crisis', ['tsunami', 'wildfire']);
      const newCount = filterService.getKeywords('crisis').length;

      expect(newCount).toBeGreaterThan(initialCount);
      expect(filterService.getKeywords('crisis')).toContain('tsunami');
      expect(filterService.getKeywords('crisis')).toContain('wildfire');
    });

    test('should remove keywords from categories', () => {
      filterService.addKeywords('crisis', ['test-keyword']);
      expect(filterService.getKeywords('crisis')).toContain('test-keyword');

      filterService.removeKeywords('crisis', ['test-keyword']);
      expect(filterService.getKeywords('crisis')).not.toContain('test-keyword');
    });

    test('should get all categories', () => {
      const categories = filterService.getCategories();
      expect(categories).toContain('crisis');
      expect(categories).toContain('misinformation');
      expect(categories).toContain('viral');
      expect(categories).toContain('spam');
    });

    test('should create new categories when adding keywords', () => {
      filterService.addKeywords('custom', ['custom-keyword']);
      expect(filterService.getCategories()).toContain('custom');
      expect(filterService.getKeywords('custom')).toContain('custom-keyword');
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        caseSensitive: true,
        partialMatch: false,
        scoreThresholds: { crisis: 0.5 }
      };

      filterService.updateConfig(newConfig);

      expect(filterService.config.caseSensitive).toBe(true);
      expect(filterService.config.partialMatch).toBe(false);
      expect(filterService.config.scoreThresholds.crisis).toBe(0.5);
    });
  });

  describe('Statistics', () => {
    test('should track filtering statistics', () => {
      const testContent = [{
        title: "Emergency alert breaking news",
        content: "Crisis situation requires immediate attention",
        source: "news"
      }];

      filterService.filterContent(testContent, { includeScores: true });
      const stats = filterService.getStats();

      expect(stats.totalFiltered).toBeGreaterThan(0);
      expect(stats.keywordCounts).toBeDefined();
    });

    test('should reset statistics', () => {
      // Generate some stats first
      const testContent = [{ title: "test", content: "emergency", source: "test" }];
      filterService.filterContent(testContent);

      filterService.resetStats();
      const stats = filterService.getStats();

      expect(stats.totalFiltered).toBe(0);
      Object.values(stats.categoryMatches).forEach(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty content', () => {
      const result = filterService.filterContent([]);
      expect(result.totalProcessed).toBe(0);
      expect(result.totalFiltered).toBe(0);
    });

    test('should handle single item (non-array)', () => {
      const item = { title: "Test", content: "emergency", source: "test" };
      const result = filterService.filterContent(item);
      
      expect(result.totalProcessed).toBe(1);
      expect(result.items).toBeDefined();
      expect(result.items.title).toBe("Test");
    });

    test('should handle items with missing text fields', () => {
      const item = { id: 1, timestamp: "2023-01-01" };
      const result = filterService.filterContent([item]);
      
      expect(result.totalProcessed).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    test('should handle unknown categories gracefully', () => {
      const result = filterService.analyzeCategory("test text", 'unknown-category');
      expect(result.score).toBe(0);
      expect(result.matches).toHaveLength(0);
    });
  });
});