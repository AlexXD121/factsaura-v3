/**
 * Content Deduplication Service
 * Identifies and removes duplicate content across multiple data sources
 * Uses multiple algorithms: exact matching, fuzzy matching, semantic similarity
 */

const crypto = require('crypto');

class ContentDeduplicationService {
  constructor() {
    // Deduplication configuration
    this.config = {
      // Similarity thresholds
      exactMatchThreshold: 1.0,        // 100% exact match
      fuzzyMatchThreshold: 0.75,       // 75% fuzzy similarity (more lenient)
      semanticSimilarityThreshold: 0.8, // 80% semantic similarity
      titleSimilarityThreshold: 0.8,   // 80% title similarity (more lenient)
      
      // Content processing
      minContentLength: 50,            // Minimum content length to process
      maxContentLength: 10000,         // Maximum content length to process
      
      // Deduplication strategies
      enableExactMatching: true,
      enableFuzzyMatching: true,
      enableSemanticMatching: false,   // Requires AI/ML models
      enableTitleMatching: true,
      enableUrlMatching: true,
      
      // Performance settings
      batchSize: 100,                  // Process items in batches
      cacheSize: 1000,                 // Cache recent hashes
      
      // Source priority (higher = keep this source over others)
      sourcePriority: {
        'news': 3,      // NewsAPI - highest priority (most reliable)
        'gdelt': 2,     // GDELT - medium priority
        'reddit': 1     // Reddit - lowest priority (user-generated)
      }
    };
    
    // Deduplication cache and statistics
    this.contentHashes = new Map(); // Hash -> content mapping
    this.urlHashes = new Map();     // URL -> content mapping
    this.titleHashes = new Map();   // Title hash -> content mapping
    this.duplicateGroups = new Map(); // Group ID -> duplicate items
    
    // Statistics
    this.stats = {
      totalProcessed: 0,
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      titleMatches: 0,
      urlMatches: 0,
      processingTime: 0,
      lastProcessed: null
    };
    
    console.log('🔄 Content Deduplication Service initialized');
  }

  /**
   * Main deduplication method - removes duplicates from content array
   * @param {Array} contentItems - Array of content items from multiple sources
   * @param {Object} options - Deduplication options
   * @returns {Object} Deduplicated content and statistics
   */
  deduplicateContent(contentItems, options = {}) {
    const startTime = Date.now();
    
    if (!contentItems || contentItems.length === 0) {
      return {
        items: [],
        duplicates: [],
        stats: { processed: 0, duplicatesFound: 0, duplicatesRemoved: 0 }
      };
    }

    console.log(`🔄 Starting deduplication of ${contentItems.length} items...`);

    // Merge options with default config
    const config = { ...this.config, ...options };
    
    // Normalize and prepare content items
    const normalizedItems = this.normalizeContentItems(contentItems);
    
    // Find duplicates using multiple strategies
    const duplicateGroups = this.findDuplicates(normalizedItems, config);
    
    // Remove duplicates and keep best items
    const deduplicatedItems = this.removeDuplicates(normalizedItems, duplicateGroups, config);
    
    // Update statistics
    const processingTime = Date.now() - startTime;
    this.updateStats(contentItems.length, duplicateGroups, processingTime);
    
    const result = {
      items: deduplicatedItems,
      duplicates: Array.from(duplicateGroups.values()),
      stats: {
        processed: contentItems.length,
        duplicatesFound: duplicateGroups.size,
        duplicatesRemoved: contentItems.length - deduplicatedItems.length,
        processingTimeMs: processingTime
      }
    };

    console.log(`✅ Deduplication completed: ${contentItems.length} → ${deduplicatedItems.length} items (removed ${result.stats.duplicatesRemoved} duplicates)`);
    
    return result;
  }

  /**
   * Normalize content items to standard format for comparison
   * @param {Array} items - Raw content items
   * @returns {Array} Normalized items
   */
  normalizeContentItems(items) {
    return items.map((item, index) => {
      // Extract common fields across different source types
      const normalized = {
        id: item.id || `item_${index}`,
        originalIndex: index,
        source: item.sourceType || item.source || 'unknown',
        sourceType: item.sourceType || item.source || 'unknown',
        
        // Content fields
        title: this.normalizeText(item.title || item.name || ''),
        content: this.normalizeText(item.content || item.description || item.selftext || ''),
        url: this.normalizeUrl(item.url || item.permalink || ''),
        
        // Metadata
        publishedAt: item.publishedAt || item.created_utc || item.dateadded || new Date().toISOString(),
        author: item.author || item.source?.name || '',
        
        // Scores and engagement
        score: item.score || item.ups || 0,
        comments: item.numComments || item.num_comments || 0,
        
        // Crisis and keyword scores
        crisisScore: item.crisisScore || item.keywordScores?.crisis || 0,
        misinformationScore: item.keywordScores?.misinformation || 0,
        
        // Original item for reference
        originalItem: item
      };
      
      // Generate content hashes for comparison
      normalized.titleHash = this.generateHash(normalized.title);
      normalized.contentHash = this.generateHash(normalized.content);
      normalized.urlHash = this.generateHash(normalized.url);
      normalized.combinedHash = this.generateHash(normalized.title + normalized.content);
      
      return normalized;
    });
  }

  /**
   * Find duplicate groups using multiple matching strategies
   * @param {Array} items - Normalized content items
   * @param {Object} config - Configuration options
   * @returns {Map} Duplicate groups (groupId -> items array)
   */
  findDuplicates(items, config) {
    const duplicateGroups = new Map();
    const processedHashes = new Set();
    let groupId = 0;

    // Strategy 1: Exact content matching
    if (config.enableExactMatching) {
      this.findExactMatches(items, duplicateGroups, processedHashes, groupId);
      groupId = duplicateGroups.size;
    }

    // Strategy 2: URL matching
    if (config.enableUrlMatching) {
      this.findUrlMatches(items, duplicateGroups, processedHashes, groupId);
      groupId = duplicateGroups.size;
    }

    // Strategy 3: Title similarity matching
    if (config.enableTitleMatching) {
      this.findTitleMatches(items, duplicateGroups, processedHashes, groupId, config.titleSimilarityThreshold);
      groupId = duplicateGroups.size;
    }

    // Strategy 4: Fuzzy content matching
    if (config.enableFuzzyMatching) {
      this.findFuzzyMatches(items, duplicateGroups, processedHashes, groupId, config.fuzzyMatchThreshold);
    }

    return duplicateGroups;
  }

  /**
   * Find exact content matches
   */
  findExactMatches(items, duplicateGroups, processedHashes, startGroupId) {
    const hashGroups = new Map();
    
    items.forEach(item => {
      if (processedHashes.has(item.id)) return;
      
      const hash = item.combinedHash;
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      hashGroups.get(hash).push(item);
    });

    // Create duplicate groups for items with same hash
    let groupId = startGroupId;
    hashGroups.forEach(group => {
      if (group.length > 1) {
        duplicateGroups.set(`exact_${groupId++}`, group);
        group.forEach(item => processedHashes.add(item.id));
        this.stats.exactMatches += group.length - 1;
      }
    });
  }

  /**
   * Find URL matches (same article from different sources)
   */
  findUrlMatches(items, duplicateGroups, processedHashes, startGroupId) {
    const urlGroups = new Map();
    
    items.forEach(item => {
      if (processedHashes.has(item.id) || !item.url) return;
      
      const normalizedUrl = this.normalizeUrl(item.url);
      if (normalizedUrl.length < 10) return; // Skip very short URLs
      
      if (!urlGroups.has(normalizedUrl)) {
        urlGroups.set(normalizedUrl, []);
      }
      urlGroups.get(normalizedUrl).push(item);
    });

    // Create duplicate groups for items with same URL
    let groupId = startGroupId;
    urlGroups.forEach(group => {
      if (group.length > 1) {
        duplicateGroups.set(`url_${groupId++}`, group);
        group.forEach(item => processedHashes.add(item.id));
        this.stats.urlMatches += group.length - 1;
      }
    });
  }

  /**
   * Find title similarity matches
   */
  findTitleMatches(items, duplicateGroups, processedHashes, startGroupId, threshold) {
    let groupId = startGroupId;
    
    for (let i = 0; i < items.length; i++) {
      if (processedHashes.has(items[i].id)) continue;
      
      const group = [items[i]];
      
      for (let j = i + 1; j < items.length; j++) {
        if (processedHashes.has(items[j].id)) continue;
        
        const similarity = this.calculateStringSimilarity(items[i].title, items[j].title);
        if (similarity >= threshold) {
          group.push(items[j]);
        }
      }
      
      if (group.length > 1) {
        duplicateGroups.set(`title_${groupId++}`, group);
        group.forEach(item => processedHashes.add(item.id));
        this.stats.titleMatches += group.length - 1;
      }
    }
  }

  /**
   * Find fuzzy content matches using Levenshtein distance
   */
  findFuzzyMatches(items, duplicateGroups, processedHashes, startGroupId, threshold) {
    let groupId = startGroupId;
    
    for (let i = 0; i < items.length; i++) {
      if (processedHashes.has(items[i].id)) continue;
      
      const group = [items[i]];
      
      for (let j = i + 1; j < items.length; j++) {
        if (processedHashes.has(items[j].id)) continue;
        
        // Compare both title and content
        const titleSim = this.calculateStringSimilarity(items[i].title, items[j].title);
        const contentSim = this.calculateStringSimilarity(items[i].content, items[j].content);
        
        // Use weighted average (title is more important)
        const overallSim = (titleSim * 0.7) + (contentSim * 0.3);
        
        if (overallSim >= threshold) {
          group.push(items[j]);
        }
      }
      
      if (group.length > 1) {
        duplicateGroups.set(`fuzzy_${groupId++}`, group);
        group.forEach(item => processedHashes.add(item.id));
        this.stats.fuzzyMatches += group.length - 1;
      }
    }
  }

  /**
   * Remove duplicates and keep the best item from each group
   * @param {Array} items - All items
   * @param {Map} duplicateGroups - Groups of duplicate items
   * @param {Object} config - Configuration
   * @returns {Array} Deduplicated items
   */
  removeDuplicates(items, duplicateGroups, config) {
    const itemsToRemove = new Set();
    const keptItems = [];

    // Process each duplicate group
    duplicateGroups.forEach(group => {
      if (group.length <= 1) return;
      
      // Sort by priority and quality
      const sortedGroup = group.sort((a, b) => {
        // Priority 1: Source priority
        const sourcePriorityA = config.sourcePriority[a.source] || 0;
        const sourcePriorityB = config.sourcePriority[b.source] || 0;
        if (sourcePriorityA !== sourcePriorityB) {
          return sourcePriorityB - sourcePriorityA;
        }
        
        // Priority 2: Crisis score (higher is better)
        if (a.crisisScore !== b.crisisScore) {
          return b.crisisScore - a.crisisScore;
        }
        
        // Priority 3: Content length (longer is usually better)
        const contentLengthA = (a.title + a.content).length;
        const contentLengthB = (b.title + b.content).length;
        if (contentLengthA !== contentLengthB) {
          return contentLengthB - contentLengthA;
        }
        
        // Priority 4: Engagement score
        return b.score - a.score;
      });
      
      // Keep the best item, mark others for removal
      const bestItem = sortedGroup[0];
      keptItems.push(bestItem);
      
      for (let i = 1; i < sortedGroup.length; i++) {
        itemsToRemove.add(sortedGroup[i].id);
      }
    });

    // Return items that are not marked for removal
    return items.filter(item => !itemsToRemove.has(item.id));
  }

  /**
   * Calculate string similarity using Jaro-Winkler algorithm
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    // Simple Jaccard similarity for performance
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Normalize text for comparison
   * @param {string} text - Input text
   * @returns {string} Normalized text
   */
  normalizeText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')       // Replace punctuation with spaces
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, ' ') // Replace common words with spaces
      .replace(/\s+/g, ' ')           // Normalize whitespace again
      .trim();
  }

  /**
   * Normalize URL for comparison
   * @param {string} url - Input URL
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    if (!url) return '';
    
    try {
      // Remove protocol, www, and trailing slashes
      return url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\?.*$/, '')          // Remove query parameters
        .replace(/#.*$/, '')           // Remove fragments
        .replace(/\/+$/, '');          // Remove trailing slashes (after other processing)
    } catch (error) {
      return url.toLowerCase();
    }
  }

  /**
   * Generate hash for content
   * @param {string} content - Content to hash
   * @returns {string} Hash string
   */
  generateHash(content) {
    if (!content) return '';
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Update deduplication statistics
   */
  updateStats(totalProcessed, duplicateGroups, processingTime) {
    const duplicatesFound = Array.from(duplicateGroups.values())
      .reduce((sum, group) => sum + (group.length - 1), 0);
    
    this.stats.totalProcessed += totalProcessed;
    this.stats.duplicatesFound += duplicateGroups.size;
    this.stats.duplicatesRemoved += duplicatesFound;
    this.stats.processingTime += processingTime;
    this.stats.lastProcessed = new Date().toISOString();
  }

  /**
   * Get deduplication statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      averageProcessingTime: this.stats.totalProcessed > 0 ? 
        this.stats.processingTime / this.stats.totalProcessed : 0,
      deduplicationRate: this.stats.totalProcessed > 0 ? 
        this.stats.duplicatesRemoved / this.stats.totalProcessed : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalProcessed: 0,
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      titleMatches: 0,
      urlMatches: 0,
      processingTime: 0,
      lastProcessed: null
    };
    
    console.log('📊 Deduplication statistics reset');
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Deduplication configuration updated');
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Clear internal caches
   */
  clearCaches() {
    this.contentHashes.clear();
    this.urlHashes.clear();
    this.titleHashes.clear();
    this.duplicateGroups.clear();
    
    console.log('🧹 Deduplication caches cleared');
  }

  /**
   * Analyze content for potential duplicates without removing them
   * @param {Array} contentItems - Content items to analyze
   * @returns {Object} Analysis results
   */
  analyzeForDuplicates(contentItems) {
    const normalizedItems = this.normalizeContentItems(contentItems);
    const duplicateGroups = this.findDuplicates(normalizedItems, this.config);
    
    const duplicateGroupsArray = Array.from(duplicateGroups.entries()).map(([id, items]) => ({
      groupId: id,
      itemCount: items.length,
      sources: [...new Set(items.map(item => item.source))],
      titles: items.map(item => item.title).slice(0, 3) // Show first 3 titles
    }));

    return {
      totalItems: contentItems.length,
      duplicateGroupsCount: duplicateGroups.size,
      potentialDuplicates: Array.from(duplicateGroups.values())
        .reduce((sum, group) => sum + (group.length - 1), 0),
      duplicatesByType: {
        exact: this.stats.exactMatches,
        fuzzy: this.stats.fuzzyMatches,
        title: this.stats.titleMatches,
        url: this.stats.urlMatches
      },
      duplicateGroups: duplicateGroupsArray
    };
  }
}

module.exports = ContentDeduplicationService;