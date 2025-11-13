/**
 * Keyword-Based Content Filtering Service
 * Provides centralized keyword filtering for content scraping across all data sources
 * Supports crisis detection, misinformation patterns, and custom filtering rules
 */

class KeywordFilterService {
  constructor() {
    // Filtering configuration
    this.config = {
      caseSensitive: false,
      partialMatch: true,
      minKeywordLength: 3,
      maxKeywordsPerCategory: 100,
      scoreThresholds: {
        crisis: 0.3,
        misinformation: 0.4,
        viral: 0.2,
        spam: 0.6
      }
    };
    
    // Statistics tracking
    this.stats = {
      totalFiltered: 0,
      categoryMatches: {},
      lastReset: Date.now()
    };
    
    // Initialize keyword categories from environment variables and defaults
    this.initializeKeywordCategories();
    
    console.log('🔍 Keyword Filter Service initialized');
    console.log(`📊 Loaded keywords: Crisis(${this.keywords.crisis.length}), Misinformation(${this.keywords.misinformation.length}), Viral(${this.keywords.viral.length}), Spam(${this.keywords.spam.length})`);
  }

  /**
   * Initialize keyword categories from environment and defaults
   */
  initializeKeywordCategories() {
    this.keywords = {
      // Crisis and emergency keywords
      crisis: this.parseKeywords(process.env.CRISIS_KEYWORDS, [
        'breaking', 'urgent', 'emergency', 'alert', 'warning', 'crisis',
        'disaster', 'flood', 'earthquake', 'fire', 'explosion', 'attack',
        'evacuation', 'lockdown', 'outbreak', 'pandemic', 'epidemic',
        'terrorist', 'shooting', 'bomb', 'threat', 'danger', 'rescue',
        'casualty', 'victim', 'injured', 'death', 'killed', 'missing',
        'storm', 'hurricane', 'tornado', 'tsunami', 'landslide',
        'accident', 'crash', 'collision', 'derailment', 'sinking'
      ]),
      
      // Misinformation and fake news indicators
      misinformation: this.parseKeywords(process.env.MISINFORMATION_KEYWORDS, [
        'fake news', 'hoax', 'conspiracy', 'cover-up', 'hidden truth',
        'they don\'t want you to know', 'mainstream media lies', 'wake up',
        'sheeple', 'deep state', 'illuminati', 'new world order',
        'big pharma', 'government conspiracy', 'false flag',
        'unverified', 'unconfirmed', 'alleged', 'rumored', 'claimed',
        'miracle cure', 'secret remedy', 'doctors hate this',
        'suppressed information', 'banned', 'censored', 'deleted'
      ]),
      
      // Viral and sensational content indicators
      viral: this.parseKeywords(process.env.VIRAL_KEYWORDS, [
        'shocking', 'unbelievable', 'incredible', 'amazing', 'stunning',
        'mind-blowing', 'jaw-dropping', 'viral', 'trending', 'explosive',
        'bombshell', 'exclusive', 'leaked', 'exposed', 'revealed',
        'you won\'t believe', 'this will shock you', 'gone viral',
        'breaking the internet', 'everyone is talking about',
        'must see', 'watch this', 'share if you agree'
      ]),
      
      // Spam and low-quality content indicators
      spam: this.parseKeywords(process.env.SPAM_KEYWORDS, [
        'click here', 'buy now', 'limited time', 'act fast', 'don\'t miss',
        'free money', 'get rich quick', 'work from home', 'easy money',
        'guaranteed', '100% effective', 'no risk', 'instant results',
        'lose weight fast', 'anti-aging', 'fountain of youth',
        'singles in your area', 'hot singles', 'meet tonight',
        'enlarge', 'enhancement', 'pills', 'supplement'
      ]),
      
      // Location-specific keywords (can be customized per deployment)
      location: this.parseKeywords(process.env.LOCATION_KEYWORDS, [
        'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
        'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
        'india', 'indian', 'bharath', 'hindustan', 'desi'
      ]),
      
      // Health misinformation (especially important during health crises)
      health: this.parseKeywords(process.env.HEALTH_KEYWORDS, [
        'covid', 'coronavirus', 'vaccine', 'vaccination', 'immunity',
        'cure', 'treatment', 'medicine', 'drug', 'therapy',
        'symptoms', 'diagnosis', 'disease', 'infection', 'contagious',
        'quarantine', 'isolation', 'mask', 'sanitizer', 'social distancing'
      ])
    };
    
    // Initialize statistics for each category
    Object.keys(this.keywords).forEach(category => {
      this.stats.categoryMatches[category] = 0;
    });
  }

  /**
   * Parse keywords from environment variable or use defaults
   * @param {string} envValue - Environment variable value
   * @param {Array} defaults - Default keywords array
   * @returns {Array} Parsed and cleaned keywords
   */
  parseKeywords(envValue, defaults) {
    if (!envValue || envValue.trim() === '') {
      return defaults;
    }
    
    const parsed = envValue.split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length >= this.config.minKeywordLength);
    
    // Merge with defaults and remove duplicates
    const combined = [...new Set([...defaults, ...parsed])];
    
    // Limit to max keywords per category
    return combined.slice(0, this.config.maxKeywordsPerCategory);
  }

  /**
   * Filter content based on keyword matching
   * @param {Object|Array} content - Content to filter (single item or array)
   * @param {Object} options - Filtering options
   * @returns {Object} Filtered content with scores and metadata
   */
  filterContent(content, options = {}) {
    const {
      categories = ['crisis', 'misinformation', 'viral', 'spam'],
      includeScores = true,
      includeMatches = true,
      minScore = 0,
      excludeCategories = []
    } = options;

    // Handle single item vs array
    const isArray = Array.isArray(content);
    const items = isArray ? content : [content];
    
    const filteredItems = items.map(item => {
      const result = this.analyzeItem(item, categories, excludeCategories);
      
      // Add filtering metadata
      if (includeScores) {
        item.keywordScores = result.scores;
        item.overallKeywordScore = result.overallScore;
      }
      
      if (includeMatches) {
        item.keywordMatches = result.matches;
        item.matchedCategories = result.matchedCategories;
      }
      
      // Add filtering flags
      item.isFiltered = result.overallScore >= minScore;
      item.filterReason = result.primaryCategory;
      
      return item;
    });

    // Filter out items below minimum score if specified
    const finalItems = minScore > 0 
      ? filteredItems.filter(item => item.overallKeywordScore >= minScore)
      : filteredItems;

    // Update statistics
    this.updateStats(finalItems);

    return {
      items: isArray ? finalItems : finalItems[0],
      totalProcessed: items.length,
      totalFiltered: finalItems.length,
      filteringApplied: minScore > 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze a single content item for keyword matches
   * @param {Object} item - Content item to analyze
   * @param {Array} categories - Categories to check
   * @param {Array} excludeCategories - Categories to exclude
   * @returns {Object} Analysis results
   */
  analyzeItem(item, categories, excludeCategories) {
    // Extract text content from item
    const text = this.extractTextContent(item);
    
    const scores = {};
    const matches = {};
    const matchedCategories = [];
    
    // Analyze each category
    categories.forEach(category => {
      if (excludeCategories.includes(category)) return;
      
      const categoryResult = this.analyzeCategory(text, category);
      scores[category] = categoryResult.score;
      matches[category] = categoryResult.matches;
      
      if (categoryResult.score > this.config.scoreThresholds[category]) {
        matchedCategories.push(category);
      }
    });
    
    // Calculate overall score (weighted average)
    const weights = { crisis: 0.4, misinformation: 0.3, viral: 0.2, spam: 0.1 };
    const overallScore = Object.entries(scores).reduce((total, [category, score]) => {
      return total + (score * (weights[category] || 0.1));
    }, 0);
    
    // Determine primary category (highest scoring)
    const primaryCategory = Object.entries(scores).reduce((max, [category, score]) => {
      return score > max.score ? { category, score } : max;
    }, { category: 'none', score: 0 }).category;

    return {
      scores,
      matches,
      matchedCategories,
      overallScore,
      primaryCategory
    };
  }

  /**
   * Extract text content from various item formats
   * @param {Object} item - Content item
   * @returns {string} Extracted text
   */
  extractTextContent(item) {
    let text = '';
    
    // Common text fields to check
    const textFields = ['title', 'content', 'description', 'text', 'body', 'summary'];
    
    textFields.forEach(field => {
      if (item[field] && typeof item[field] === 'string') {
        text += ' ' + item[field];
      }
    });
    
    // Handle nested content
    if (item.article && typeof item.article === 'object') {
      text += ' ' + this.extractTextContent(item.article);
    }
    
    return text.trim();
  }

  /**
   * Analyze text against a specific keyword category
   * @param {string} text - Text to analyze
   * @param {string} category - Keyword category
   * @returns {Object} Category analysis results
   */
  analyzeCategory(text, category) {
    const categoryKeywords = this.keywords[category] || [];
    const matches = [];
    let totalMatches = 0;
    
    // Normalize text for comparison
    const textToAnalyze = this.config.caseSensitive ? text : text.toLowerCase();
    
    categoryKeywords.forEach(keyword => {
      const keywordToCheck = this.config.caseSensitive ? keyword : keyword.toLowerCase();
      
      if (this.config.partialMatch) {
        if (textToAnalyze.includes(keywordToCheck)) {
          matches.push(keyword);
          // Count multiple occurrences
          const regex = new RegExp(this.escapeRegex(keywordToCheck), this.config.caseSensitive ? 'g' : 'gi');
          const occurrences = (textToAnalyze.match(regex) || []).length;
          totalMatches += occurrences;
        }
      } else {
        // Exact word matching
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(keywordToCheck)}\\b`, this.config.caseSensitive ? 'g' : 'gi');
        const wordMatches = textToAnalyze.match(wordBoundaryRegex);
        if (wordMatches) {
          matches.push(keyword);
          totalMatches += wordMatches.length;
        }
      }
    });
    
    // Calculate score (0-1 based on matches and keyword density)
    const uniqueMatches = matches.length;
    const keywordDensity = totalMatches / Math.max(textToAnalyze.split(' ').length, 1);
    const coverageRatio = uniqueMatches / Math.max(categoryKeywords.length, 1);
    
    // Weighted score combining coverage and density
    const score = Math.min(1, (coverageRatio * 0.7) + (keywordDensity * 0.3));
    
    return {
      score,
      matches,
      uniqueMatches,
      totalMatches,
      keywordDensity,
      coverageRatio
    };
  }

  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get crisis-related content specifically
   * @param {Object|Array} content - Content to filter
   * @param {number} minCrisisScore - Minimum crisis score threshold
   * @returns {Object} Crisis content results
   */
  getCrisisContent(content, minCrisisScore = 0.3) {
    return this.filterContent(content, {
      categories: ['crisis', 'health'],
      minScore: minCrisisScore,
      includeScores: true,
      includeMatches: true
    });
  }

  /**
   * Get potential misinformation content
   * @param {Object|Array} content - Content to filter
   * @param {number} minMisinfoScore - Minimum misinformation score threshold
   * @returns {Object} Misinformation content results
   */
  getMisinformationContent(content, minMisinfoScore = 0.4) {
    return this.filterContent(content, {
      categories: ['misinformation', 'viral'],
      minScore: minMisinfoScore,
      includeScores: true,
      includeMatches: true
    });
  }

  /**
   * Filter out spam and low-quality content
   * @param {Object|Array} content - Content to filter
   * @param {number} maxSpamScore - Maximum allowed spam score
   * @returns {Object} Filtered content (spam removed)
   */
  removeSpamContent(content, maxSpamScore = 0.6) {
    const result = this.filterContent(content, {
      categories: ['spam'],
      includeScores: true,
      minScore: 0
    });
    
    // Filter out items with high spam scores
    const isArray = Array.isArray(content);
    const items = isArray ? result.items : [result.items];
    
    const cleanItems = items.filter(item => 
      (item.keywordScores?.spam || 0) < maxSpamScore
    );
    
    return {
      items: isArray ? cleanItems : cleanItems[0],
      totalProcessed: result.totalProcessed,
      totalFiltered: cleanItems.length,
      spamRemoved: items.length - cleanItems.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add custom keywords to a category
   * @param {string} category - Category name
   * @param {Array} newKeywords - Keywords to add
   */
  addKeywords(category, newKeywords) {
    if (!this.keywords[category]) {
      this.keywords[category] = [];
      this.stats.categoryMatches[category] = 0;
    }
    
    const cleanKeywords = newKeywords
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length >= this.config.minKeywordLength);
    
    // Add unique keywords only
    cleanKeywords.forEach(keyword => {
      if (!this.keywords[category].includes(keyword)) {
        this.keywords[category].push(keyword);
      }
    });
    
    // Limit to max keywords
    if (this.keywords[category].length > this.config.maxKeywordsPerCategory) {
      this.keywords[category] = this.keywords[category].slice(0, this.config.maxKeywordsPerCategory);
    }
    
    console.log(`✅ Added ${cleanKeywords.length} keywords to category '${category}'`);
  }

  /**
   * Remove keywords from a category
   * @param {string} category - Category name
   * @param {Array} keywordsToRemove - Keywords to remove
   */
  removeKeywords(category, keywordsToRemove) {
    if (!this.keywords[category]) return;
    
    const cleanKeywords = keywordsToRemove.map(keyword => keyword.trim().toLowerCase());
    
    this.keywords[category] = this.keywords[category].filter(keyword => 
      !cleanKeywords.includes(keyword)
    );
    
    console.log(`🗑️ Removed ${cleanKeywords.length} keywords from category '${category}'`);
  }

  /**
   * Update filtering statistics
   * @param {Array} filteredItems - Items that passed filtering
   */
  updateStats(filteredItems) {
    this.stats.totalFiltered += filteredItems.length;
    
    filteredItems.forEach(item => {
      if (item.matchedCategories) {
        item.matchedCategories.forEach(category => {
          this.stats.categoryMatches[category]++;
        });
      }
    });
  }

  /**
   * Get filtering statistics
   * @returns {Object} Current statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.lastReset;
    
    return {
      totalFiltered: this.stats.totalFiltered,
      categoryMatches: { ...this.stats.categoryMatches },
      keywordCounts: Object.fromEntries(
        Object.entries(this.keywords).map(([category, keywords]) => [category, keywords.length])
      ),
      config: { ...this.config },
      uptime: Math.round(uptime / 1000), // seconds
      lastReset: new Date(this.stats.lastReset).toISOString()
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats.totalFiltered = 0;
    Object.keys(this.stats.categoryMatches).forEach(category => {
      this.stats.categoryMatches[category] = 0;
    });
    this.stats.lastReset = Date.now();
    
    console.log('📊 Keyword filter statistics reset');
  }

  /**
   * Get all keywords for a category
   * @param {string} category - Category name
   * @returns {Array} Keywords in category
   */
  getKeywords(category) {
    return this.keywords[category] || [];
  }

  /**
   * Get all available categories
   * @returns {Array} Category names
   */
  getCategories() {
    return Object.keys(this.keywords);
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Keyword filter configuration updated');
  }
}

module.exports = KeywordFilterService;