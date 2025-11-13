/**
 * Content Scraping Scheduler Service
 * Orchestrates real-time content monitoring across multiple data sources
 * Runs every 5-10 minutes to detect trending misinformation and crisis content
 */

const NewsApiService = require('./newsApiService');
const RedditApiService = require('./redditApiService');
const GdeltApiService = require('./gdeltApiService');
const TrendingTopicDetectionService = require('./trendingTopicDetectionService');
const KeywordFilterService = require('./keywordFilterService');
const ContentDeduplicationService = require('./contentDeduplicationService');
const { apiKeyManager } = require('../config/apiKeys');

class ContentScrapingScheduler {
  constructor() {
    // Initialize API services
    this.newsApiService = new NewsApiService();
    this.redditApiService = new RedditApiService();
    this.gdeltApiService = new GdeltApiService();
    this.trendingDetectionService = new TrendingTopicDetectionService();
    this.keywordFilterService = new KeywordFilterService();
    this.deduplicationService = new ContentDeduplicationService();
    
    // Scheduler configuration
    this.isRunning = false;
    this.intervalId = null;
    this.schedulerInterval = parseInt(process.env.SCRAPER_INTERVAL_MINUTES) || 5; // Default 5 minutes
    this.lastRunTime = null;
    this.runCount = 0;
    this.errors = [];
    this.maxErrors = 10; // Keep last 10 errors
    
    // Content aggregation
    this.latestContent = {
      news: [],
      reddit: [],
      gdelt: [],
      lastUpdated: null,
      totalItems: 0
    };
    
    // Crisis detection thresholds
    this.crisisThreshold = 0.7; // Crisis score threshold for alerts
    this.trendingThreshold = 0.6; // Trending score threshold
    
    // Rate limiting and error handling
    this.maxRetries = 3;
    this.retryDelay = 30000; // 30 seconds
    
    console.log(`📅 Content Scraping Scheduler initialized - Interval: ${this.schedulerInterval} minutes`);
  }

  /**
   * Start the content scraping scheduler
   * @param {number} intervalMinutes - Optional interval override in minutes
   */
  start(intervalMinutes = null) {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    const interval = intervalMinutes || this.schedulerInterval;
    const intervalMs = interval * 60 * 1000; // Convert to milliseconds

    console.log(`🚀 Starting Content Scraping Scheduler - Running every ${interval} minutes`);
    
    // Run immediately on start
    this.runScrapingCycle().catch(error => {
      console.error('❌ Initial scraping cycle failed:', error);
    });

    // Set up recurring schedule
    this.intervalId = setInterval(async () => {
      try {
        await this.runScrapingCycle();
      } catch (error) {
        console.error('❌ Scheduled scraping cycle failed:', error);
        this.recordError(error);
      }
    }, intervalMs);

    this.isRunning = true;
    console.log(`✅ Content Scraping Scheduler started successfully`);
  }

  /**
   * Stop the content scraping scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Content Scraping Scheduler stopped');
  }

  /**
   * Run a complete scraping cycle across all data sources
   */
  async runScrapingCycle() {
    const startTime = Date.now();
    this.runCount++;
    
    console.log(`\n🔄 Starting scraping cycle #${this.runCount} at ${new Date().toISOString()}`);

    try {
      // Parallel scraping from all sources
      const scrapingPromises = [
        this.scrapeNewsApi(),
        this.scrapeRedditApi(), 
        this.scrapeGdeltApi()
      ];

      const results = await Promise.allSettled(scrapingPromises);
      
      // Process results
      const newsResult = results[0];
      const redditResult = results[1];
      const gdeltResult = results[2];

      // Update latest content
      this.updateLatestContent(newsResult, redditResult, gdeltResult);

      // Analyze and detect trending/crisis content using advanced algorithms
      const basicAnalysis = await this.analyzeScrapedContent();
      const trendingAnalysis = await this.trendingDetectionService.detectTrendingTopics(this.latestContent);
      
      // Combine analyses
      const analysis = {
        ...basicAnalysis,
        trending: trendingAnalysis
      };

      // Log cycle completion
      const duration = Date.now() - startTime;
      this.lastRunTime = new Date().toISOString();

      console.log(`✅ Scraping cycle #${this.runCount} completed in ${duration}ms`);
      console.log(`📊 Content summary: ${analysis.totalItems} items, ${analysis.crisisItems} crisis alerts, ${analysis.trendingItems} trending`);
      console.log(`🔥 Trending analysis: ${analysis.trending?.summary?.trendingCount || 0} trending topics, ${analysis.trending?.summary?.viralCount || 0} viral topics`);

      return {
        success: true,
        runCount: this.runCount,
        duration,
        analysis,
        timestamp: this.lastRunTime
      };

    } catch (error) {
      console.error(`❌ Scraping cycle #${this.runCount} failed:`, error);
      this.recordError(error);
      throw error;
    }
  }

  /**
   * Scrape content from NewsAPI
   */
  async scrapeNewsApi() {
    try {
      console.log('📰 Scraping NewsAPI...');
      
      if (!apiKeyManager.isServiceAvailable('newsApi')) {
        console.log('⚠️ NewsAPI not available - skipping');
        return { status: 'skipped', reason: 'service_not_available' };
      }

      // Get trending news and crisis content
      const [trendingNews, crisisNews] = await Promise.allSettled([
        this.newsApiService.getTrendingNews({ pageSize: 20 }),
        this.newsApiService.monitorCrisisContent()
      ]);

      const newsData = {
        trending: trendingNews.status === 'fulfilled' ? trendingNews.value : null,
        crisis: crisisNews.status === 'fulfilled' ? crisisNews.value : null
      };

      console.log(`📰 NewsAPI: ${newsData.trending?.articles?.length || 0} trending, ${newsData.crisis?.articles?.length || 0} crisis`);
      
      return { status: 'fulfilled', value: newsData };
    } catch (error) {
      console.error('❌ NewsAPI scraping failed:', error);
      return { status: 'rejected', reason: error.message };
    }
  }

  /**
   * Scrape content from Reddit API
   */
  async scrapeRedditApi() {
    try {
      console.log('🔴 Scraping Reddit...');
      
      if (!apiKeyManager.isServiceAvailable('reddit')) {
        console.log('⚠️ Reddit API not available - skipping');
        return { status: 'skipped', reason: 'service_not_available' };
      }

      // Get trending posts and crisis content
      const [trendingPosts, crisisPosts] = await Promise.allSettled([
        this.redditApiService.getTrendingPosts({ limit: 25 }),
        this.redditApiService.monitorCrisisContent()
      ]);

      const redditData = {
        trending: trendingPosts.status === 'fulfilled' ? trendingPosts.value : null,
        crisis: crisisPosts.status === 'fulfilled' ? crisisPosts.value : null
      };

      console.log(`🔴 Reddit: ${redditData.trending?.posts?.length || 0} trending, ${redditData.crisis?.posts?.length || 0} crisis`);
      
      return { status: 'fulfilled', value: redditData };
    } catch (error) {
      console.error('❌ Reddit scraping failed:', error);
      return { status: 'rejected', reason: error.message };
    }
  }

  /**
   * Scrape content from GDELT API
   */
  async scrapeGdeltApi() {
    try {
      console.log('🌍 Scraping GDELT...');

      // Get global events and crisis monitoring
      const [globalEvents, crisisEvents] = await Promise.allSettled([
        this.gdeltApiService.getGlobalEvents({ maxrecords: 100 }),
        this.gdeltApiService.monitorCrisisEvents()
      ]);

      const gdeltData = {
        global: globalEvents.status === 'fulfilled' ? globalEvents.value : null,
        crisis: crisisEvents.status === 'fulfilled' ? crisisEvents.value : null
      };

      console.log(`🌍 GDELT: ${gdeltData.global?.events?.length || 0} global, ${gdeltData.crisis?.events?.length || 0} crisis`);
      
      return { status: 'fulfilled', value: gdeltData };
    } catch (error) {
      console.error('❌ GDELT scraping failed:', error);
      return { status: 'rejected', reason: error.message };
    }
  }

  /**
   * Update latest content cache with new scraping results
   */
  updateLatestContent(newsResult, redditResult, gdeltResult) {
    // Reset content arrays
    this.latestContent.news = [];
    this.latestContent.reddit = [];
    this.latestContent.gdelt = [];

    // Collect all content for deduplication
    const allRawContent = [];

    // Process NewsAPI results with keyword filtering
    if (newsResult.status === 'fulfilled' && newsResult.value) {
      const newsData = newsResult.value;
      if (newsData.trending?.articles) {
        const filteredNews = this.applyKeywordFiltering(newsData.trending.articles, 'news');
        allRawContent.push(...filteredNews);
      }
      if (newsData.crisis?.articles) {
        const filteredCrisis = this.applyKeywordFiltering(newsData.crisis.articles, 'news');
        allRawContent.push(...filteredCrisis);
      }
    }

    // Process Reddit results with keyword filtering
    if (redditResult.status === 'fulfilled' && redditResult.value) {
      const redditData = redditResult.value;
      if (redditData.trending?.posts) {
        const filteredTrending = this.applyKeywordFiltering(redditData.trending.posts, 'reddit');
        allRawContent.push(...filteredTrending);
      }
      if (redditData.crisis?.posts) {
        const filteredCrisis = this.applyKeywordFiltering(redditData.crisis.posts, 'reddit');
        allRawContent.push(...filteredCrisis);
      }
    }

    // Process GDELT results with keyword filtering
    if (gdeltResult.status === 'fulfilled' && gdeltResult.value) {
      const gdeltData = gdeltResult.value;
      if (gdeltData.global?.events) {
        const filteredGlobal = this.applyKeywordFiltering(gdeltData.global.events, 'gdelt');
        allRawContent.push(...filteredGlobal);
      }
      if (gdeltData.crisis?.events) {
        const filteredCrisis = this.applyKeywordFiltering(gdeltData.crisis.events, 'gdelt');
        allRawContent.push(...filteredCrisis);
      }
    }

    // Apply deduplication across all sources
    const deduplicationResult = this.deduplicationService.deduplicateContent(allRawContent);
    const deduplicatedContent = deduplicationResult.items;

    // Separate deduplicated content back into source arrays
    deduplicatedContent.forEach(item => {
      const sourceType = item.sourceType || item.source;
      switch (sourceType) {
        case 'news':
          this.latestContent.news.push(item.originalItem || item);
          break;
        case 'reddit':
          this.latestContent.reddit.push(item.originalItem || item);
          break;
        case 'gdelt':
          this.latestContent.gdelt.push(item.originalItem || item);
          break;
        default:
          // If source is unknown, add to news as fallback
          this.latestContent.news.push(item.originalItem || item);
      }
    });

    // Update metadata
    this.latestContent.lastUpdated = new Date().toISOString();
    this.latestContent.totalItems = 
      this.latestContent.news.length + 
      this.latestContent.reddit.length + 
      this.latestContent.gdelt.length;

    // Store deduplication statistics
    this.latestContent.deduplicationStats = deduplicationResult.stats;

    console.log(`📊 Content cache updated: ${allRawContent.length} → ${this.latestContent.totalItems} items (removed ${deduplicationResult.stats.duplicatesRemoved} duplicates)`);
    console.log(`🔄 Deduplication: ${deduplicationResult.stats.duplicatesFound} groups found, ${deduplicationResult.stats.processingTimeMs}ms processing time`);
  }

  /**
   * Apply keyword-based filtering to content
   * @param {Array} content - Content items to filter
   * @param {string} source - Source type (news, reddit, gdelt)
   * @returns {Array} Filtered content items
   */
  applyKeywordFiltering(content, source) {
    if (!content || content.length === 0) return [];

    try {
      // Remove spam content first
      const spamFiltered = this.keywordFilterService.removeSpamContent(content, 0.6);
      let filteredItems = Array.isArray(spamFiltered.items) ? spamFiltered.items : [spamFiltered.items];

      // Apply keyword analysis to add scores and metadata
      const analyzed = this.keywordFilterService.filterContent(filteredItems, {
        categories: ['crisis', 'misinformation', 'viral', 'health', 'location'],
        includeScores: true,
        includeMatches: true,
        minScore: 0 // Don't filter out, just add metadata
      });

      filteredItems = Array.isArray(analyzed.items) ? analyzed.items : [analyzed.items];

      // Prioritize crisis and misinformation content
      const prioritized = filteredItems.sort((a, b) => {
        const aScore = (a.keywordScores?.crisis || 0) + (a.keywordScores?.misinformation || 0);
        const bScore = (b.keywordScores?.crisis || 0) + (b.keywordScores?.misinformation || 0);
        return bScore - aScore;
      });

      // Add source metadata
      prioritized.forEach(item => {
        item.sourceType = source;
        item.filteredAt = new Date().toISOString();
      });

      console.log(`🔍 ${source.toUpperCase()}: Filtered ${content.length} → ${prioritized.length} items (removed ${content.length - prioritized.length} spam)`);
      
      return prioritized;
    } catch (error) {
      console.error(`❌ Keyword filtering failed for ${source}:`, error);
      // Return original content if filtering fails
      return content;
    }
  }

  /**
   * Analyze scraped content for trending topics and crisis alerts
   */
  async analyzeScrapedContent() {
    const analysis = {
      totalItems: this.latestContent.totalItems,
      crisisItems: 0,
      trendingItems: 0,
      topCrisisAlerts: [],
      topTrendingTopics: [],
      sourceBreakdown: {
        news: this.latestContent.news.length,
        reddit: this.latestContent.reddit.length,
        gdelt: this.latestContent.gdelt.length
      }
    };

    // Analyze crisis content
    const allContent = [
      ...this.latestContent.news.map(item => ({ ...item, source: 'news' })),
      ...this.latestContent.reddit.map(item => ({ ...item, source: 'reddit' })),
      ...this.latestContent.gdelt.map(item => ({ ...item, source: 'gdelt' }))
    ];

    // Filter and sort by crisis score
    const crisisContent = allContent
      .filter(item => (item.crisisScore || 0) >= this.crisisThreshold)
      .sort((a, b) => (b.crisisScore || 0) - (a.crisisScore || 0));

    // Filter and sort by trending indicators
    const trendingContent = allContent
      .filter(item => this.isTrendingContent(item))
      .sort((a, b) => this.getTrendingScore(b) - this.getTrendingScore(a));

    analysis.crisisItems = crisisContent.length;
    analysis.trendingItems = trendingContent.length;
    analysis.topCrisisAlerts = crisisContent.slice(0, 5);
    analysis.topTrendingTopics = trendingContent.slice(0, 5);

    return analysis;
  }

  /**
   * Check if content is trending based on various metrics
   */
  isTrendingContent(item) {
    // NewsAPI trending indicators
    if (item.source === 'news') {
      return item.crisisScore >= this.trendingThreshold;
    }

    // Reddit trending indicators
    if (item.source === 'reddit') {
      return item.score > 500 || item.numComments > 100 || item.crisisScore >= this.trendingThreshold;
    }

    // GDELT trending indicators
    if (item.source === 'gdelt') {
      return item.crisisScore >= this.trendingThreshold || Math.abs(item.tone?.score || 0) > 3;
    }

    return false;
  }

  /**
   * Calculate trending score for content
   */
  getTrendingScore(item) {
    let score = item.crisisScore || 0;

    if (item.source === 'reddit') {
      score += Math.min(item.score / 1000, 0.5); // Reddit score bonus
      score += Math.min(item.numComments / 200, 0.3); // Comments bonus
    }

    if (item.source === 'gdelt') {
      score += Math.min(Math.abs(item.tone?.score || 0) / 10, 0.2); // Tone intensity bonus
    }

    return score;
  }

  /**
   * Get the latest scraped content
   */
  getLatestContent() {
    return {
      ...this.latestContent,
      schedulerStatus: this.getStatus()
    };
  }

  /**
   * Get scheduler status and statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.schedulerInterval,
      runCount: this.runCount,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.isRunning && this.lastRunTime ? 
        new Date(new Date(this.lastRunTime).getTime() + (this.schedulerInterval * 60 * 1000)).toISOString() : 
        null,
      totalContentItems: this.latestContent.totalItems,
      lastUpdated: this.latestContent.lastUpdated,
      errorCount: this.errors.length,
      serviceStatus: {
        newsApi: apiKeyManager.isServiceAvailable('newsApi'),
        reddit: apiKeyManager.isServiceAvailable('reddit'),
        gdelt: true // GDELT is always available
      }
    };
  }

  /**
   * Record an error with timestamp
   */
  recordError(error) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      runCount: this.runCount
    };

    this.errors.push(errorRecord);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  /**
   * Get recent errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
    console.log('🧹 Error history cleared');
  }

  /**
   * Get trending topics analysis
   * @returns {Object} Latest trending analysis
   */
  getTrendingAnalysis() {
    return this.trendingDetectionService.getCurrentTrendingTopics();
  }

  /**
   * Get topic history for a specific keyword
   * @param {string} keyword - Optional keyword filter
   * @returns {Object} Topic history
   */
  getTopicHistory(keyword = null) {
    return this.trendingDetectionService.getTopicHistory(keyword);
  }

  /**
   * Get trending detection service statistics
   * @returns {Object} Service statistics
   */
  getTrendingStats() {
    return this.trendingDetectionService.getStats();
  }

  /**
   * Force run a scraping cycle (for testing/manual trigger)
   */
  async forceRun() {
    console.log('🔧 Force running scraping cycle...');
    return await this.runScrapingCycle();
  }

  /**
   * Update scheduler interval
   */
  updateInterval(minutes) {
    const oldInterval = this.schedulerInterval;
    this.schedulerInterval = minutes;

    if (this.isRunning) {
      console.log(`⚙️ Updating scheduler interval from ${oldInterval} to ${minutes} minutes`);
      this.stop();
      this.start();
    }

    console.log(`✅ Scheduler interval updated to ${minutes} minutes`);
  }

  /**
   * Get keyword filtering statistics
   * @returns {Object} Keyword filter statistics
   */
  getKeywordFilterStats() {
    return this.keywordFilterService.getStats();
  }

  /**
   * Add custom keywords to filtering
   * @param {string} category - Keyword category
   * @param {Array} keywords - Keywords to add
   */
  addKeywords(category, keywords) {
    this.keywordFilterService.addKeywords(category, keywords);
  }

  /**
   * Remove keywords from filtering
   * @param {string} category - Keyword category
   * @param {Array} keywords - Keywords to remove
   */
  removeKeywords(category, keywords) {
    this.keywordFilterService.removeKeywords(category, keywords);
  }

  /**
   * Get keywords for a category
   * @param {string} category - Keyword category
   * @returns {Array} Keywords in category
   */
  getKeywords(category) {
    return this.keywordFilterService.getKeywords(category);
  }

  /**
   * Get all keyword categories
   * @returns {Array} Available categories
   */
  getKeywordCategories() {
    return this.keywordFilterService.getCategories();
  }

  /**
   * Update keyword filtering configuration
   * @param {Object} config - New configuration
   */
  updateKeywordFilterConfig(config) {
    this.keywordFilterService.updateConfig(config);
  }

  /**
   * Reset keyword filtering statistics
   */
  resetKeywordFilterStats() {
    this.keywordFilterService.resetStats();
  }

  /**
   * Get content deduplication statistics
   * @returns {Object} Deduplication statistics
   */
  getDeduplicationStats() {
    return this.deduplicationService.getStats();
  }

  /**
   * Reset deduplication statistics
   */
  resetDeduplicationStats() {
    this.deduplicationService.resetStats();
  }

  /**
   * Update deduplication configuration
   * @param {Object} config - New deduplication configuration
   */
  updateDeduplicationConfig(config) {
    this.deduplicationService.updateConfig(config);
  }

  /**
   * Get deduplication configuration
   * @returns {Object} Current deduplication configuration
   */
  getDeduplicationConfig() {
    return this.deduplicationService.getConfig();
  }

  /**
   * Analyze content for duplicates without removing them
   * @param {Array} content - Optional content array (uses latest if not provided)
   * @returns {Object} Duplicate analysis
   */
  analyzeContentForDuplicates(content = null) {
    const contentToAnalyze = content || [
      ...this.latestContent.news,
      ...this.latestContent.reddit,
      ...this.latestContent.gdelt
    ];
    
    return this.deduplicationService.analyzeForDuplicates(contentToAnalyze);
  }

  /**
   * Manually deduplicate specific content
   * @param {Array} content - Content to deduplicate
   * @param {Object} options - Deduplication options
   * @returns {Object} Deduplication result
   */
  deduplicateSpecificContent(content, options = {}) {
    return this.deduplicationService.deduplicateContent(content, options);
  }

  /**
   * Clear deduplication caches
   */
  clearDeduplicationCaches() {
    this.deduplicationService.clearCaches();
  }

  /**
   * Get crisis content from latest scraped data
   * @param {number} minScore - Minimum crisis score threshold
   * @returns {Object} Crisis content
   */
  getCrisisContent(minScore = 0.3) {
    const allContent = [
      ...this.latestContent.news,
      ...this.latestContent.reddit,
      ...this.latestContent.gdelt
    ];
    
    return this.keywordFilterService.getCrisisContent(allContent, minScore);
  }

  /**
   * Get potential misinformation from latest scraped data
   * @param {number} minScore - Minimum misinformation score threshold
   * @returns {Object} Misinformation content
   */
  getMisinformationContent(minScore = 0.4) {
    const allContent = [
      ...this.latestContent.news,
      ...this.latestContent.reddit,
      ...this.latestContent.gdelt
    ];
    
    return this.keywordFilterService.getMisinformationContent(allContent, minScore);
  }
}

module.exports = ContentScrapingScheduler;