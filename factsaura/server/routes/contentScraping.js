/**
 * Content Scraping Routes
 * API endpoints for managing the content scraping scheduler
 */

const express = require('express');
const router = express.Router();
const {
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
  clearDeduplicationCaches
} = require('../controllers/contentScrapingController');

/**
 * @route POST /api/content-scraping/start
 * @desc Start the content scraping scheduler
 * @body { intervalMinutes?: number }
 */
router.post('/start', startScheduler);

/**
 * @route POST /api/content-scraping/stop
 * @desc Stop the content scraping scheduler
 */
router.post('/stop', stopScheduler);

/**
 * @route GET /api/content-scraping/status
 * @desc Get scheduler status and statistics
 */
router.get('/status', getSchedulerStatus);

/**
 * @route POST /api/content-scraping/run
 * @desc Force run a scraping cycle immediately
 */
router.post('/run', forceRunCycle);

/**
 * @route GET /api/content-scraping/content
 * @desc Get latest scraped content from all sources
 */
router.get('/content', getLatestContent);

/**
 * @route PUT /api/content-scraping/config
 * @desc Update scheduler configuration
 * @body { intervalMinutes: number }
 */
router.put('/config', updateSchedulerConfig);

/**
 * @route GET /api/content-scraping/errors
 * @desc Get scheduler error history
 */
router.get('/errors', getSchedulerErrors);

/**
 * @route DELETE /api/content-scraping/errors
 * @desc Clear scheduler error history
 */
router.delete('/errors', clearSchedulerErrors);

/**
 * @route GET /api/content-scraping/analysis
 * @desc Get content analysis and trending topics
 */
router.get('/analysis', getContentAnalysis);

/**
 * @route GET /api/content-scraping/trending
 * @desc Get current trending topics analysis
 */
router.get('/trending', getTrendingTopics);

/**
 * @route GET /api/content-scraping/trending/history
 * @desc Get all topic histories
 */
router.get('/trending/history', getAllTopicHistories);

/**
 * @route GET /api/content-scraping/trending/history/:keyword
 * @desc Get topic history for a specific keyword
 */
router.get('/trending/history/:keyword', getTopicHistory);

/**
 * @route GET /api/content-scraping/trending/stats
 * @desc Get trending detection statistics
 */
router.get('/trending/stats', getTrendingStats);

/**
 * @route POST /api/content-scraping/trending/analyze
 * @desc Force trending analysis on current content
 */
router.post('/trending/analyze', forceTrendingAnalysis);

// Keyword Filtering Routes

/**
 * @route GET /api/content-scraping/keywords/stats
 * @desc Get keyword filtering statistics
 */
router.get('/keywords/stats', getKeywordFilterStats);

/**
 * @route POST /api/content-scraping/keywords/add
 * @desc Add keywords to a category
 * @body { category: string, keywords: string[] }
 */
router.post('/keywords/add', addKeywords);

/**
 * @route POST /api/content-scraping/keywords/remove
 * @desc Remove keywords from a category
 * @body { category: string, keywords: string[] }
 */
router.post('/keywords/remove', removeKeywords);

/**
 * @route GET /api/content-scraping/keywords/categories
 * @desc Get all keyword categories
 */
router.get('/keywords/categories', getKeywordCategories);

/**
 * @route GET /api/content-scraping/keywords/:category
 * @desc Get keywords for a specific category
 */
router.get('/keywords/:category', getKeywords);

/**
 * @route PUT /api/content-scraping/keywords/config
 * @desc Update keyword filtering configuration
 * @body { caseSensitive?: boolean, partialMatch?: boolean, scoreThresholds?: object }
 */
router.put('/keywords/config', updateKeywordFilterConfig);

/**
 * @route DELETE /api/content-scraping/keywords/stats
 * @desc Reset keyword filtering statistics
 */
router.delete('/keywords/stats', resetKeywordFilterStats);

/**
 * @route GET /api/content-scraping/crisis
 * @desc Get crisis content based on keyword filtering
 * @query { minScore?: number }
 */
router.get('/crisis', getCrisisContent);

/**
 * @route GET /api/content-scraping/misinformation
 * @desc Get misinformation content based on keyword filtering
 * @query { minScore?: number }
 */
router.get('/misinformation', getMisinformationContent);

// Content Deduplication Routes

/**
 * @route GET /api/content-scraping/deduplication/stats
 * @desc Get content deduplication statistics
 */
router.get('/deduplication/stats', getDeduplicationStats);

/**
 * @route DELETE /api/content-scraping/deduplication/stats
 * @desc Reset deduplication statistics
 */
router.delete('/deduplication/stats', resetDeduplicationStats);

/**
 * @route GET /api/content-scraping/deduplication/config
 * @desc Get deduplication configuration
 */
router.get('/deduplication/config', getDeduplicationConfig);

/**
 * @route PUT /api/content-scraping/deduplication/config
 * @desc Update deduplication configuration
 * @body { exactMatchThreshold?: number, fuzzyMatchThreshold?: number, etc. }
 */
router.put('/deduplication/config', updateDeduplicationConfig);

/**
 * @route GET /api/content-scraping/deduplication/analyze
 * @desc Analyze current content for duplicates without removing them
 */
router.get('/deduplication/analyze', analyzeContentForDuplicates);

/**
 * @route POST /api/content-scraping/deduplication/deduplicate
 * @desc Manually deduplicate provided content
 * @body { content: array, options?: object }
 */
router.post('/deduplication/deduplicate', deduplicateContent);

/**
 * @route DELETE /api/content-scraping/deduplication/cache
 * @desc Clear deduplication caches
 */
router.delete('/deduplication/cache', clearDeduplicationCaches);

module.exports = router;