/**
 * Content Scraping Controller
 * Manages the content scraping scheduler and provides API endpoints
 * for monitoring and controlling the scraping process
 */

const ContentScrapingScheduler = require('../services/contentScrapingScheduler');

// Global scheduler instance
let schedulerInstance = null;

/**
 * Get or create scheduler instance
 */
function getSchedulerInstance() {
  if (!schedulerInstance) {
    schedulerInstance = new ContentScrapingScheduler();
  }
  return schedulerInstance;
}

/**
 * Start the content scraping scheduler
 */
const startScheduler = async (req, res) => {
  try {
    const { intervalMinutes } = req.body;
    const scheduler = getSchedulerInstance();

    if (scheduler.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Scheduler is already running',
        status: scheduler.getStatus()
      });
    }

    scheduler.start(intervalMinutes);

    res.json({
      success: true,
      message: 'Content scraping scheduler started successfully',
      status: scheduler.getStatus()
    });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start scheduler',
      error: error.message
    });
  }
};

/**
 * Stop the content scraping scheduler
 */
const stopScheduler = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();

    if (!scheduler.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Scheduler is not running',
        status: scheduler.getStatus()
      });
    }

    scheduler.stop();

    res.json({
      success: true,
      message: 'Content scraping scheduler stopped successfully',
      status: scheduler.getStatus()
    });
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop scheduler',
      error: error.message
    });
  }
};

/**
 * Get scheduler status and statistics
 */
const getSchedulerStatus = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const status = scheduler.getStatus();

    res.json({
      success: true,
      status,
      latestContent: scheduler.getLatestContent()
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status',
      error: error.message
    });
  }
};

/**
 * Force run a scraping cycle
 */
const forceRunCycle = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    
    console.log('🔧 Manual scraping cycle triggered via API');
    const result = await scheduler.forceRun();

    res.json({
      success: true,
      message: 'Scraping cycle completed successfully',
      result,
      status: scheduler.getStatus()
    });
  } catch (error) {
    console.error('Error running scraping cycle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run scraping cycle',
      error: error.message
    });
  }
};

/**
 * Get latest scraped content
 */
const getLatestContent = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const content = scheduler.getLatestContent();

    res.json({
      success: true,
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting latest content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get latest content',
      error: error.message
    });
  }
};

/**
 * Update scheduler configuration
 */
const updateSchedulerConfig = async (req, res) => {
  try {
    const { intervalMinutes } = req.body;
    const scheduler = getSchedulerInstance();

    if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 60) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interval. Must be between 1 and 60 minutes.'
      });
    }

    scheduler.updateInterval(intervalMinutes);

    res.json({
      success: true,
      message: `Scheduler interval updated to ${intervalMinutes} minutes`,
      status: scheduler.getStatus()
    });
  } catch (error) {
    console.error('Error updating scheduler config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduler configuration',
      error: error.message
    });
  }
};

/**
 * Get scheduler errors
 */
const getSchedulerErrors = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const errors = scheduler.getErrors();

    res.json({
      success: true,
      errors,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error getting scheduler errors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler errors',
      error: error.message
    });
  }
};

/**
 * Clear scheduler errors
 */
const clearSchedulerErrors = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    scheduler.clearErrors();

    res.json({
      success: true,
      message: 'Scheduler errors cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing scheduler errors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear scheduler errors',
      error: error.message
    });
  }
};

/**
 * Get content analysis and trending topics
 */
const getContentAnalysis = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const content = scheduler.getLatestContent();
    
    // Perform analysis on latest content
    const analysis = await scheduler.analyzeScrapedContent();

    res.json({
      success: true,
      analysis,
      contentSummary: {
        totalItems: content.totalItems,
        lastUpdated: content.lastUpdated,
        sourceBreakdown: {
          news: content.news.length,
          reddit: content.reddit.length,
          gdelt: content.gdelt.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting content analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content analysis',
      error: error.message
    });
  }
};

/**
 * Get trending topics analysis
 */
const getTrendingTopics = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const trendingAnalysis = scheduler.getTrendingAnalysis();

    res.json({
      success: true,
      trendingTopics: trendingAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting trending topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending topics',
      error: error.message
    });
  }
};

/**
 * Get topic history for a specific keyword
 */
const getTopicHistory = async (req, res) => {
  try {
    const { keyword } = req.params;
    const scheduler = getSchedulerInstance();
    const history = scheduler.getTopicHistory(keyword);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: `No history found for topic: ${keyword}`
      });
    }

    res.json({
      success: true,
      keyword,
      history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting topic history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topic history',
      error: error.message
    });
  }
};

/**
 * Get all topic histories
 */
const getAllTopicHistories = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const allHistories = scheduler.getTopicHistory();

    // Convert Map to Object for JSON serialization
    const historiesObject = {};
    for (const [keyword, history] of allHistories.entries()) {
      historiesObject[keyword] = history;
    }

    res.json({
      success: true,
      topicCount: allHistories.size,
      histories: historiesObject,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting all topic histories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topic histories',
      error: error.message
    });
  }
};

/**
 * Get trending detection statistics
 */
const getTrendingStats = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const stats = scheduler.getTrendingStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting trending stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending statistics',
      error: error.message
    });
  }
};

/**
 * Force trending analysis on current content
 */
const forceTrendingAnalysis = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const content = scheduler.getLatestContent();
    
    if (content.totalItems === 0) {
      return res.status(400).json({
        success: false,
        message: 'No content available for trending analysis. Run a scraping cycle first.'
      });
    }

    console.log('🔧 Manual trending analysis triggered via API');
    const trendingAnalysis = await scheduler.trendingDetectionService.detectTrendingTopics(content);

    res.json({
      success: true,
      message: 'Trending analysis completed successfully',
      analysis: trendingAnalysis,
      contentAnalyzed: content.totalItems
    });
  } catch (error) {
    console.error('Error running trending analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run trending analysis',
      error: error.message
    });
  }
};

/**
 * Get keyword filtering statistics
 */
const getKeywordFilterStats = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const stats = scheduler.getKeywordFilterStats();

    res.json({
      success: true,
      keywordFilterStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting keyword filter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get keyword filter statistics',
      error: error.message
    });
  }
};

/**
 * Add keywords to a category
 */
const addKeywords = async (req, res) => {
  try {
    const { category, keywords } = req.body;
    
    if (!category || !keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: 'Category and keywords array are required'
      });
    }

    const scheduler = getSchedulerInstance();
    scheduler.addKeywords(category, keywords);

    res.json({
      success: true,
      message: `Added ${keywords.length} keywords to category '${category}'`,
      category,
      addedKeywords: keywords
    });
  } catch (error) {
    console.error('Error adding keywords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add keywords',
      error: error.message
    });
  }
};

/**
 * Remove keywords from a category
 */
const removeKeywords = async (req, res) => {
  try {
    const { category, keywords } = req.body;
    
    if (!category || !keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: 'Category and keywords array are required'
      });
    }

    const scheduler = getSchedulerInstance();
    scheduler.removeKeywords(category, keywords);

    res.json({
      success: true,
      message: `Removed ${keywords.length} keywords from category '${category}'`,
      category,
      removedKeywords: keywords
    });
  } catch (error) {
    console.error('Error removing keywords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove keywords',
      error: error.message
    });
  }
};

/**
 * Get keywords for a category
 */
const getKeywords = async (req, res) => {
  try {
    const { category } = req.params;
    const scheduler = getSchedulerInstance();
    const keywords = scheduler.getKeywords(category);

    if (!keywords) {
      return res.status(404).json({
        success: false,
        message: `Category '${category}' not found`
      });
    }

    res.json({
      success: true,
      category,
      keywords,
      keywordCount: keywords.length
    });
  } catch (error) {
    console.error('Error getting keywords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get keywords',
      error: error.message
    });
  }
};

/**
 * Get all keyword categories
 */
const getKeywordCategories = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const categories = scheduler.getKeywordCategories();

    res.json({
      success: true,
      categories,
      categoryCount: categories.length
    });
  } catch (error) {
    console.error('Error getting keyword categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get keyword categories',
      error: error.message
    });
  }
};

/**
 * Get crisis content based on keyword filtering
 */
const getCrisisContent = async (req, res) => {
  try {
    const { minScore = 0.3 } = req.query;
    const scheduler = getSchedulerInstance();
    const crisisContent = scheduler.getCrisisContent(parseFloat(minScore));

    res.json({
      success: true,
      crisisContent,
      minScore: parseFloat(minScore),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting crisis content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crisis content',
      error: error.message
    });
  }
};

/**
 * Get misinformation content based on keyword filtering
 */
const getMisinformationContent = async (req, res) => {
  try {
    const { minScore = 0.4 } = req.query;
    const scheduler = getSchedulerInstance();
    const misinfoContent = scheduler.getMisinformationContent(parseFloat(minScore));

    res.json({
      success: true,
      misinformationContent: misinfoContent,
      minScore: parseFloat(minScore),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting misinformation content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get misinformation content',
      error: error.message
    });
  }
};

/**
 * Update keyword filtering configuration
 */
const updateKeywordFilterConfig = async (req, res) => {
  try {
    const config = req.body;
    const scheduler = getSchedulerInstance();
    scheduler.updateKeywordFilterConfig(config);

    res.json({
      success: true,
      message: 'Keyword filter configuration updated',
      updatedConfig: config
    });
  } catch (error) {
    console.error('Error updating keyword filter config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update keyword filter configuration',
      error: error.message
    });
  }
};

/**
 * Reset keyword filtering statistics
 */
const resetKeywordFilterStats = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    scheduler.resetKeywordFilterStats();

    res.json({
      success: true,
      message: 'Keyword filter statistics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting keyword filter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset keyword filter statistics',
      error: error.message
    });
  }
};

/**
 * Get content deduplication statistics
 */
const getDeduplicationStats = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const stats = scheduler.getDeduplicationStats();

    res.json({
      success: true,
      deduplicationStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting deduplication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deduplication statistics',
      error: error.message
    });
  }
};

/**
 * Reset deduplication statistics
 */
const resetDeduplicationStats = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    scheduler.resetDeduplicationStats();

    res.json({
      success: true,
      message: 'Deduplication statistics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting deduplication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset deduplication statistics',
      error: error.message
    });
  }
};

/**
 * Update deduplication configuration
 */
const updateDeduplicationConfig = async (req, res) => {
  try {
    const config = req.body;
    const scheduler = getSchedulerInstance();
    scheduler.updateDeduplicationConfig(config);

    res.json({
      success: true,
      message: 'Deduplication configuration updated successfully',
      updatedConfig: config
    });
  } catch (error) {
    console.error('Error updating deduplication config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deduplication configuration',
      error: error.message
    });
  }
};

/**
 * Get deduplication configuration
 */
const getDeduplicationConfig = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const config = scheduler.getDeduplicationConfig();

    res.json({
      success: true,
      deduplicationConfig: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting deduplication config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deduplication configuration',
      error: error.message
    });
  }
};

/**
 * Analyze content for duplicates
 */
const analyzeContentForDuplicates = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const analysis = scheduler.analyzeContentForDuplicates();

    res.json({
      success: true,
      duplicateAnalysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing content for duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content for duplicates',
      error: error.message
    });
  }
};

/**
 * Manually deduplicate content
 */
const deduplicateContent = async (req, res) => {
  try {
    const { content, options = {} } = req.body;
    
    if (!content || !Array.isArray(content)) {
      return res.status(400).json({
        success: false,
        message: 'Content array is required'
      });
    }

    const scheduler = getSchedulerInstance();
    const result = scheduler.deduplicateSpecificContent(content, options);

    res.json({
      success: true,
      message: 'Content deduplication completed',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deduplicating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deduplicate content',
      error: error.message
    });
  }
};

/**
 * Clear deduplication caches
 */
const clearDeduplicationCaches = async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    scheduler.clearDeduplicationCaches();

    res.json({
      success: true,
      message: 'Deduplication caches cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing deduplication caches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear deduplication caches',
      error: error.message
    });
  }
};

/**
 * Initialize scheduler on server startup (if configured)
 */
const initializeScheduler = () => {
  try {
    const autoStart = process.env.AUTO_START_SCHEDULER === 'true';
    const intervalMinutes = parseInt(process.env.SCRAPER_INTERVAL_MINUTES) || 5;

    if (autoStart) {
      console.log('🚀 Auto-starting content scraping scheduler...');
      const scheduler = getSchedulerInstance();
      scheduler.start(intervalMinutes);
    } else {
      console.log('📅 Content scraping scheduler ready (not auto-started)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  forceRunCycle,
  getLatestContent,
  updateSchedulerConfig,
  getSchedulerErrors,
  clearSchedulerErrors,
  getContentAnalysis,
  getTrendingTopics,
  getTopicHistory,
  getAllTopicHistories,
  getTrendingStats,
  forceTrendingAnalysis,
  // Keyword filtering endpoints
  getKeywordFilterStats,
  addKeywords,
  removeKeywords,
  getKeywords,
  getKeywordCategories,
  getCrisisContent,
  getMisinformationContent,
  updateKeywordFilterConfig,
  resetKeywordFilterStats,
  // Deduplication endpoints
  getDeduplicationStats,
  resetDeduplicationStats,
  updateDeduplicationConfig,
  getDeduplicationConfig,
  analyzeContentForDuplicates,
  deduplicateContent,
  clearDeduplicationCaches,
  initializeScheduler,
  getSchedulerInstance // Export for testing
};