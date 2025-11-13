/**
 * Trending Topic Detection Service
 * Advanced algorithms for detecting trending topics and viral misinformation
 * across multiple data sources (NewsAPI, Reddit, GDELT)
 */

class TrendingTopicDetectionService {
  constructor() {
    // Algorithm configuration
    this.config = {
      // Trending thresholds
      minMentionCount: 3, // Minimum mentions across sources
      trendingScoreThreshold: 0.6, // Minimum score to be considered trending
      viralThreshold: 0.8, // Score for viral content
      
      // Time windows for analysis
      shortTermWindow: 1 * 60 * 60 * 1000, // 1 hour
      mediumTermWindow: 6 * 60 * 60 * 1000, // 6 hours
      longTermWindow: 24 * 60 * 60 * 1000, // 24 hours
      
      // Scoring weights
      weights: {
        frequency: 0.3, // How often mentioned
        velocity: 0.25, // Rate of increase
        engagement: 0.2, // Social engagement metrics
        crossPlatform: 0.15, // Mentions across platforms
        recency: 0.1 // How recent the content is
      },
      
      // Crisis detection
      crisisKeywords: [
        'breaking', 'urgent', 'emergency', 'alert', 'warning', 'crisis',
        'disaster', 'flood', 'earthquake', 'fire', 'explosion', 'attack',
        'outbreak', 'pandemic', 'epidemic', 'vaccine', 'death', 'killed',
        'injured', 'missing', 'evacuation', 'lockdown', 'shutdown',
        'fake', 'hoax', 'misinformation', 'conspiracy', 'scam', 'fraud'
      ],
      
      // Viral indicators
      viralIndicators: [
        'viral', 'trending', 'everyone', 'share', 'retweet', 'spread',
        'shocking', 'unbelievable', 'must see', 'breaking news'
      ]
    };
    
    // Topic tracking storage
    this.topicHistory = new Map(); // topic -> historical data
    this.currentTopics = new Map(); // topic -> current analysis
    this.trendingTopics = []; // sorted list of trending topics
    
    // Analysis cache
    this.lastAnalysisTime = null;
    this.analysisCache = null;
    this.cacheValidityMs = 5 * 60 * 1000; // 5 minutes
    
    console.log('🔥 Trending Topic Detection Service initialized');
  }

  /**
   * Main method to detect trending topics from scraped content
   * @param {Object} scrapedContent - Content from all sources
   * @returns {Promise<Object>} Trending analysis results
   */
  async detectTrendingTopics(scrapedContent) {
    try {
      console.log('🔍 Starting trending topic detection analysis...');
      
      // Check cache validity
      if (this.isCacheValid()) {
        console.log('📋 Returning cached trending analysis');
        return this.analysisCache;
      }
      
      // Extract and normalize content from all sources
      const normalizedContent = this.normalizeContent(scrapedContent);
      
      // Extract topics and keywords
      const extractedTopics = this.extractTopics(normalizedContent);
      
      // Calculate trending scores
      const scoredTopics = this.calculateTrendingScores(extractedTopics);
      
      // Detect viral and crisis content
      const viralContent = this.detectViralContent(normalizedContent);
      const crisisContent = this.detectCrisisContent(normalizedContent);
      
      // Update topic history
      this.updateTopicHistory(scoredTopics);
      
      // Generate final analysis
      const analysis = this.generateTrendingAnalysis(
        scoredTopics, 
        viralContent, 
        crisisContent,
        normalizedContent
      );
      
      // Cache results
      this.cacheAnalysis(analysis);
      
      console.log(`✅ Trending analysis complete: ${analysis.trendingTopics.length} trending topics found`);
      return analysis;
      
    } catch (error) {
      console.error('❌ Trending topic detection failed:', error);
      throw error;
    }
  }

  /**
   * Normalize content from different sources into unified format
   * @param {Object} scrapedContent - Raw scraped content
   * @returns {Array} Normalized content items
   */
  normalizeContent(scrapedContent) {
    const normalized = [];
    const now = Date.now();
    
    // Process NewsAPI content
    if (scrapedContent.news && Array.isArray(scrapedContent.news)) {
      scrapedContent.news.forEach(article => {
        normalized.push({
          id: `news_${article.url ? this.hashString(article.url) : Math.random()}`,
          source: 'news',
          platform: 'newsapi',
          title: article.title || '',
          content: article.description || article.content || '',
          url: article.url || '',
          publishedAt: new Date(article.publishedAt || now).getTime(),
          author: article.author || '',
          sourceName: article.source?.name || '',
          engagement: {
            shares: 0, // NewsAPI doesn't provide engagement metrics
            comments: 0,
            reactions: 0
          },
          metadata: {
            crisisScore: article.crisisScore || 0,
            category: article.category || 'general'
          }
        });
      });
    }
    
    // Process Reddit content
    if (scrapedContent.reddit && Array.isArray(scrapedContent.reddit)) {
      scrapedContent.reddit.forEach(post => {
        normalized.push({
          id: `reddit_${post.id || Math.random()}`,
          source: 'reddit',
          platform: 'reddit',
          title: post.title || '',
          content: post.selftext || post.body || '',
          url: post.url || `https://reddit.com${post.permalink}`,
          publishedAt: new Date((post.created_utc || post.created || now / 1000) * 1000).getTime(),
          author: post.author || '',
          sourceName: post.subreddit || '',
          engagement: {
            shares: post.score || 0,
            comments: post.num_comments || post.numComments || 0,
            reactions: (post.ups || 0) + (post.downs || 0)
          },
          metadata: {
            crisisScore: post.crisisScore || 0,
            subreddit: post.subreddit || '',
            upvoteRatio: post.upvote_ratio || 0
          }
        });
      });
    }
    
    // Process GDELT content
    if (scrapedContent.gdelt && Array.isArray(scrapedContent.gdelt)) {
      scrapedContent.gdelt.forEach(event => {
        normalized.push({
          id: `gdelt_${event.url ? this.hashString(event.url) : Math.random()}`,
          source: 'gdelt',
          platform: 'gdelt',
          title: event.title || '',
          content: event.seendate || event.socialimage || '',
          url: event.url || '',
          publishedAt: new Date(event.seendate || now).getTime(),
          author: event.domain || '',
          sourceName: event.domain || '',
          engagement: {
            shares: event.socialfacebookshares || 0,
            comments: 0,
            reactions: event.socialscore || 0
          },
          metadata: {
            crisisScore: event.crisisScore || 0,
            tone: event.tone || {},
            themes: event.themes || [],
            locations: event.locations || []
          }
        });
      });
    }
    
    console.log(`📊 Normalized ${normalized.length} content items from all sources`);
    return normalized;
  }

  /**
   * Extract topics and keywords from normalized content
   * @param {Array} normalizedContent - Normalized content items
   * @returns {Map} Topics with their mentions and metadata
   */
  extractTopics(normalizedContent) {
    const topics = new Map();
    
    normalizedContent.forEach(item => {
      // Extract keywords from title and content
      const text = `${item.title} ${item.content}`.toLowerCase();
      const keywords = this.extractKeywords(text);
      
      keywords.forEach(keyword => {
        if (!topics.has(keyword)) {
          topics.set(keyword, {
            keyword,
            mentions: [],
            totalMentions: 0,
            platforms: new Set(),
            sources: new Set(),
            firstSeen: item.publishedAt,
            lastSeen: item.publishedAt,
            totalEngagement: 0,
            avgEngagement: 0,
            crisisScore: 0,
            isCrisisRelated: false,
            isViralIndicator: false
          });
        }
        
        const topic = topics.get(keyword);
        
        // Add mention
        topic.mentions.push({
          itemId: item.id,
          source: item.source,
          platform: item.platform,
          publishedAt: item.publishedAt,
          engagement: item.engagement,
          crisisScore: item.metadata.crisisScore || 0,
          url: item.url
        });
        
        // Update aggregated data
        topic.totalMentions++;
        topic.platforms.add(item.platform);
        topic.sources.add(item.sourceName);
        topic.firstSeen = Math.min(topic.firstSeen, item.publishedAt);
        topic.lastSeen = Math.max(topic.lastSeen, item.publishedAt);
        
        // Calculate engagement
        const itemEngagement = item.engagement.shares + item.engagement.comments + item.engagement.reactions;
        topic.totalEngagement += itemEngagement;
        topic.avgEngagement = topic.totalEngagement / topic.totalMentions;
        
        // Update crisis score
        topic.crisisScore = Math.max(topic.crisisScore, item.metadata.crisisScore || 0);
        
        // Check if crisis-related or viral
        topic.isCrisisRelated = topic.isCrisisRelated || this.isCrisisKeyword(keyword);
        topic.isViralIndicator = topic.isViralIndicator || this.isViralKeyword(keyword);
      });
    });
    
    console.log(`🏷️ Extracted ${topics.size} unique topics from content`);
    return topics;
  }

  /**
   * Extract keywords from text using multiple techniques
   * @param {string} text - Input text
   * @returns {Array} Extracted keywords
   */
  extractKeywords(text) {
    const keywords = new Set();
    
    // Clean and normalize text
    const cleanText = text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract single words (minimum 3 characters)
    const words = cleanText.split(' ')
      .filter(word => word.length >= 3)
      .filter(word => !this.isStopWord(word));
    
    words.forEach(word => keywords.add(word));
    
    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length >= 6) {
        keywords.add(phrase);
      }
    }
    
    // Extract 3-word phrases for important topics
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length >= 10 && (
        this.isCrisisKeyword(phrase) || 
        this.isViralKeyword(phrase) ||
        words[i] === 'breaking' || 
        words[i] === 'urgent'
      )) {
        keywords.add(phrase);
      }
    }
    
    return Array.from(keywords);
  }

  /**
   * Calculate trending scores for all topics
   * @param {Map} topics - Topics with mentions
   * @returns {Array} Topics sorted by trending score
   */
  calculateTrendingScores(topics) {
    const now = Date.now();
    const scoredTopics = [];
    
    topics.forEach((topic, keyword) => {
      // Skip topics with insufficient mentions
      if (topic.totalMentions < this.config.minMentionCount) {
        return;
      }
      
      // Calculate individual score components
      const frequencyScore = this.calculateFrequencyScore(topic);
      const velocityScore = this.calculateVelocityScore(topic, now);
      const engagementScore = this.calculateEngagementScore(topic);
      const crossPlatformScore = this.calculateCrossPlatformScore(topic);
      const recencyScore = this.calculateRecencyScore(topic, now);
      
      // Calculate weighted trending score
      const trendingScore = (
        frequencyScore * this.config.weights.frequency +
        velocityScore * this.config.weights.velocity +
        engagementScore * this.config.weights.engagement +
        crossPlatformScore * this.config.weights.crossPlatform +
        recencyScore * this.config.weights.recency
      );
      
      // Apply crisis and viral bonuses
      let finalScore = trendingScore;
      if (topic.isCrisisRelated) {
        finalScore *= 1.3; // 30% bonus for crisis content
      }
      if (topic.isViralIndicator) {
        finalScore *= 1.2; // 20% bonus for viral indicators
      }
      
      // Ensure score is between 0 and 1
      finalScore = Math.min(1, Math.max(0, finalScore));
      
      scoredTopics.push({
        ...topic,
        scores: {
          trending: finalScore,
          frequency: frequencyScore,
          velocity: velocityScore,
          engagement: engagementScore,
          crossPlatform: crossPlatformScore,
          recency: recencyScore
        },
        platforms: Array.from(topic.platforms),
        sources: Array.from(topic.sources),
        timespan: topic.lastSeen - topic.firstSeen,
        isViral: finalScore >= this.config.viralThreshold,
        isTrending: finalScore >= this.config.trendingScoreThreshold
      });
    });
    
    // Sort by trending score
    scoredTopics.sort((a, b) => b.scores.trending - a.scores.trending);
    
    console.log(`📈 Calculated trending scores for ${scoredTopics.length} topics`);
    return scoredTopics;
  }

  /**
   * Calculate frequency score based on mention count
   * @param {Object} topic - Topic data
   * @returns {number} Frequency score (0-1)
   */
  calculateFrequencyScore(topic) {
    // Logarithmic scaling for mention count
    const maxMentions = 100; // Assume 100 mentions is maximum
    const normalizedCount = Math.min(topic.totalMentions, maxMentions) / maxMentions;
    return Math.log10(1 + normalizedCount * 9) / Math.log10(10);
  }

  /**
   * Calculate velocity score based on mention rate over time
   * @param {Object} topic - Topic data
   * @param {number} now - Current timestamp
   * @returns {number} Velocity score (0-1)
   */
  calculateVelocityScore(topic, now) {
    const timespan = topic.lastSeen - topic.firstSeen;
    
    // If all mentions are very recent (within 1 hour), high velocity
    if (timespan < this.config.shortTermWindow) {
      return Math.min(1, topic.totalMentions / 10); // 10 mentions in 1 hour = max velocity
    }
    
    // Calculate mentions per hour
    const mentionsPerHour = (topic.totalMentions / (timespan / (60 * 60 * 1000)));
    return Math.min(1, mentionsPerHour / 5); // 5 mentions per hour = max velocity
  }

  /**
   * Calculate engagement score based on social metrics
   * @param {Object} topic - Topic data
   * @returns {number} Engagement score (0-1)
   */
  calculateEngagementScore(topic) {
    if (topic.avgEngagement === 0) return 0;
    
    // Logarithmic scaling for engagement
    const maxEngagement = 1000; // Assume 1000 avg engagement is maximum
    const normalizedEngagement = Math.min(topic.avgEngagement, maxEngagement) / maxEngagement;
    return Math.log10(1 + normalizedEngagement * 9) / Math.log10(10);
  }

  /**
   * Calculate cross-platform score based on platform diversity
   * @param {Object} topic - Topic data
   * @returns {number} Cross-platform score (0-1)
   */
  calculateCrossPlatformScore(topic) {
    const platformCount = topic.platforms.size;
    const maxPlatforms = 3; // news, reddit, gdelt
    return Math.min(1, platformCount / maxPlatforms);
  }

  /**
   * Calculate recency score based on how recent the content is
   * @param {Object} topic - Topic data
   * @param {number} now - Current timestamp
   * @returns {number} Recency score (0-1)
   */
  calculateRecencyScore(topic, now) {
    const timeSinceLastMention = now - topic.lastSeen;
    
    // Recent content gets higher score
    if (timeSinceLastMention < this.config.shortTermWindow) {
      return 1; // Within 1 hour = maximum recency
    } else if (timeSinceLastMention < this.config.mediumTermWindow) {
      return 0.7; // Within 6 hours = high recency
    } else if (timeSinceLastMention < this.config.longTermWindow) {
      return 0.4; // Within 24 hours = medium recency
    } else {
      return 0.1; // Older than 24 hours = low recency
    }
  }

  /**
   * Detect viral content based on engagement and spread patterns
   * @param {Array} normalizedContent - Normalized content items
   * @returns {Array} Viral content items
   */
  detectViralContent(normalizedContent) {
    const viralContent = [];
    
    normalizedContent.forEach(item => {
      let viralScore = 0;
      
      // High engagement indicates viral potential
      const totalEngagement = item.engagement.shares + item.engagement.comments + item.engagement.reactions;
      if (totalEngagement > 500) viralScore += 0.4;
      else if (totalEngagement > 100) viralScore += 0.2;
      
      // Viral keywords in title/content
      const text = `${item.title} ${item.content}`.toLowerCase();
      const viralKeywordCount = this.config.viralIndicators.filter(keyword => 
        text.includes(keyword)
      ).length;
      viralScore += Math.min(0.3, viralKeywordCount * 0.1);
      
      // Recent content with high engagement
      const age = Date.now() - item.publishedAt;
      if (age < this.config.shortTermWindow && totalEngagement > 50) {
        viralScore += 0.3;
      }
      
      // Crisis content can go viral quickly
      if (item.metadata.crisisScore > 0.7) {
        viralScore += 0.2;
      }
      
      if (viralScore >= this.config.viralThreshold) {
        viralContent.push({
          ...item,
          viralScore,
          viralIndicators: this.config.viralIndicators.filter(keyword => 
            text.includes(keyword)
          )
        });
      }
    });
    
    // Sort by viral score
    viralContent.sort((a, b) => b.viralScore - a.viralScore);
    
    console.log(`🚀 Detected ${viralContent.length} viral content items`);
    return viralContent;
  }

  /**
   * Detect crisis content based on keywords and patterns
   * @param {Array} normalizedContent - Normalized content items
   * @returns {Array} Crisis content items
   */
  detectCrisisContent(normalizedContent) {
    const crisisContent = [];
    
    normalizedContent.forEach(item => {
      let crisisScore = item.metadata.crisisScore || 0;
      
      // Crisis keywords in title/content
      const text = `${item.title} ${item.content}`.toLowerCase();
      const crisisKeywordCount = this.config.crisisKeywords.filter(keyword => 
        text.includes(keyword)
      ).length;
      
      // Boost crisis score based on keyword matches
      crisisScore += Math.min(0.5, crisisKeywordCount * 0.1);
      
      // Urgent language patterns
      if (text.includes('breaking') || text.includes('urgent') || text.includes('alert')) {
        crisisScore += 0.2;
      }
      
      // High engagement on crisis content
      const totalEngagement = item.engagement.shares + item.engagement.comments + item.engagement.reactions;
      if (totalEngagement > 100 && crisisKeywordCount > 0) {
        crisisScore += 0.1;
      }
      
      if (crisisScore >= 0.6) {
        crisisContent.push({
          ...item,
          crisisScore,
          crisisKeywords: this.config.crisisKeywords.filter(keyword => 
            text.includes(keyword)
          )
        });
      }
    });
    
    // Sort by crisis score
    crisisContent.sort((a, b) => b.crisisScore - a.crisisScore);
    
    console.log(`🚨 Detected ${crisisContent.length} crisis content items`);
    return crisisContent;
  }

  /**
   * Generate comprehensive trending analysis
   * @param {Array} scoredTopics - Topics with trending scores
   * @param {Array} viralContent - Viral content items
   * @param {Array} crisisContent - Crisis content items
   * @param {Array} normalizedContent - All normalized content
   * @returns {Object} Complete trending analysis
   */
  generateTrendingAnalysis(scoredTopics, viralContent, crisisContent, normalizedContent) {
    const now = Date.now();
    
    // Filter trending topics
    const trendingTopics = scoredTopics.filter(topic => topic.isTrending);
    const viralTopics = scoredTopics.filter(topic => topic.isViral);
    const crisisTopics = scoredTopics.filter(topic => topic.isCrisisRelated && topic.scores.trending > 0.5);
    
    // Calculate platform statistics
    const platformStats = this.calculatePlatformStats(normalizedContent);
    
    // Generate trending insights
    const insights = this.generateTrendingInsights(trendingTopics, viralContent, crisisContent);
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTopics: scoredTopics.length,
        trendingCount: trendingTopics.length,
        viralCount: viralTopics.length,
        crisisCount: crisisTopics.length,
        totalContent: normalizedContent.length
      },
      trendingTopics: trendingTopics.slice(0, 20), // Top 20 trending
      viralTopics: viralTopics.slice(0, 10), // Top 10 viral
      crisisTopics: crisisTopics.slice(0, 10), // Top 10 crisis
      viralContent: viralContent.slice(0, 10), // Top 10 viral content
      crisisContent: crisisContent.slice(0, 10), // Top 10 crisis content
      platformStats,
      insights,
      metadata: {
        analysisTime: Date.now() - now,
        cacheExpiry: now + this.cacheValidityMs,
        algorithm: 'multi-source-trending-v1.0'
      }
    };
    
    // Update current trending topics for tracking
    this.trendingTopics = trendingTopics;
    
    return analysis;
  }

  /**
   * Calculate platform-specific statistics
   * @param {Array} normalizedContent - All normalized content
   * @returns {Object} Platform statistics
   */
  calculatePlatformStats(normalizedContent) {
    const stats = {
      news: { count: 0, engagement: 0, avgCrisisScore: 0 },
      reddit: { count: 0, engagement: 0, avgCrisisScore: 0 },
      gdelt: { count: 0, engagement: 0, avgCrisisScore: 0 }
    };
    
    normalizedContent.forEach(item => {
      const platform = item.source;
      if (stats[platform]) {
        stats[platform].count++;
        stats[platform].engagement += item.engagement.shares + item.engagement.comments + item.engagement.reactions;
        stats[platform].avgCrisisScore += item.metadata.crisisScore || 0;
      }
    });
    
    // Calculate averages
    Object.keys(stats).forEach(platform => {
      if (stats[platform].count > 0) {
        stats[platform].avgEngagement = stats[platform].engagement / stats[platform].count;
        stats[platform].avgCrisisScore = stats[platform].avgCrisisScore / stats[platform].count;
      }
    });
    
    return stats;
  }

  /**
   * Generate insights about trending patterns
   * @param {Array} trendingTopics - Trending topics
   * @param {Array} viralContent - Viral content
   * @param {Array} crisisContent - Crisis content
   * @returns {Object} Trending insights
   */
  generateTrendingInsights(trendingTopics, viralContent, crisisContent) {
    const insights = {
      topCategories: this.getTopCategories(trendingTopics),
      emergingTopics: this.getEmergingTopics(trendingTopics),
      crossPlatformTrends: this.getCrossPlatformTrends(trendingTopics),
      crisisAlerts: this.getCrisisAlerts(crisisContent),
      viralPatterns: this.getViralPatterns(viralContent)
    };
    
    return insights;
  }

  /**
   * Get top trending categories
   * @param {Array} trendingTopics - Trending topics
   * @returns {Array} Top categories
   */
  getTopCategories(trendingTopics) {
    const categories = new Map();
    
    trendingTopics.forEach(topic => {
      let category = 'general';
      
      // Categorize based on keywords
      if (topic.isCrisisRelated) category = 'crisis';
      else if (topic.isViralIndicator) category = 'viral';
      else if (topic.keyword.includes('health') || topic.keyword.includes('medical')) category = 'health';
      else if (topic.keyword.includes('politics') || topic.keyword.includes('election')) category = 'politics';
      else if (topic.keyword.includes('technology') || topic.keyword.includes('tech')) category = 'technology';
      
      if (!categories.has(category)) {
        categories.set(category, { category, count: 0, totalScore: 0 });
      }
      
      const cat = categories.get(category);
      cat.count++;
      cat.totalScore += topic.scores.trending;
    });
    
    return Array.from(categories.values())
      .map(cat => ({ ...cat, avgScore: cat.totalScore / cat.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }

  /**
   * Get emerging topics (new trends)
   * @param {Array} trendingTopics - Trending topics
   * @returns {Array} Emerging topics
   */
  getEmergingTopics(trendingTopics) {
    const now = Date.now();
    
    return trendingTopics
      .filter(topic => {
        const age = now - topic.firstSeen;
        return age < this.config.shortTermWindow && topic.scores.velocity > 0.7;
      })
      .slice(0, 5);
  }

  /**
   * Get cross-platform trending topics
   * @param {Array} trendingTopics - Trending topics
   * @returns {Array} Cross-platform trends
   */
  getCrossPlatformTrends(trendingTopics) {
    return trendingTopics
      .filter(topic => topic.platforms.length >= 2)
      .sort((a, b) => b.platforms.length - a.platforms.length)
      .slice(0, 5);
  }

  /**
   * Get crisis alerts
   * @param {Array} crisisContent - Crisis content
   * @returns {Array} Crisis alerts
   */
  getCrisisAlerts(crisisContent) {
    return crisisContent
      .filter(item => item.crisisScore > 0.8)
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        source: item.platform,
        crisisScore: item.crisisScore,
        crisisKeywords: item.crisisKeywords,
        url: item.url,
        publishedAt: item.publishedAt
      }));
  }

  /**
   * Get viral patterns
   * @param {Array} viralContent - Viral content
   * @returns {Object} Viral patterns analysis
   */
  getViralPatterns(viralContent) {
    const patterns = {
      avgViralScore: 0,
      commonIndicators: [],
      topPlatforms: [],
      timePatterns: {}
    };
    
    if (viralContent.length === 0) return patterns;
    
    // Calculate average viral score
    patterns.avgViralScore = viralContent.reduce((sum, item) => sum + item.viralScore, 0) / viralContent.length;
    
    // Find common viral indicators
    const indicatorCounts = new Map();
    viralContent.forEach(item => {
      item.viralIndicators?.forEach(indicator => {
        indicatorCounts.set(indicator, (indicatorCounts.get(indicator) || 0) + 1);
      });
    });
    
    patterns.commonIndicators = Array.from(indicatorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([indicator, count]) => ({ indicator, count }));
    
    return patterns;
  }

  /**
   * Update topic history for trend tracking
   * @param {Array} scoredTopics - Current scored topics
   */
  updateTopicHistory(scoredTopics) {
    const now = Date.now();
    
    scoredTopics.forEach(topic => {
      if (!this.topicHistory.has(topic.keyword)) {
        this.topicHistory.set(topic.keyword, {
          keyword: topic.keyword,
          history: [],
          firstSeen: now,
          peakScore: 0,
          totalMentions: 0
        });
      }
      
      const history = this.topicHistory.get(topic.keyword);
      
      // Add current data point
      history.history.push({
        timestamp: now,
        score: topic.scores.trending,
        mentions: topic.totalMentions,
        platforms: topic.platforms.length,
        engagement: topic.avgEngagement
      });
      
      // Update peak score and total mentions
      history.peakScore = Math.max(history.peakScore, topic.scores.trending);
      history.totalMentions += topic.totalMentions;
      
      // Keep only recent history (last 24 hours)
      const cutoff = now - this.config.longTermWindow;
      history.history = history.history.filter(point => point.timestamp > cutoff);
    });
    
    console.log(`📚 Updated history for ${scoredTopics.length} topics`);
  }

  /**
   * Check if analysis cache is still valid
   * @returns {boolean} Cache validity
   */
  isCacheValid() {
    if (!this.lastAnalysisTime || !this.analysisCache) {
      return false;
    }
    
    const now = Date.now();
    return (now - this.lastAnalysisTime) < this.cacheValidityMs;
  }

  /**
   * Cache analysis results
   * @param {Object} analysis - Analysis results
   */
  cacheAnalysis(analysis) {
    this.analysisCache = analysis;
    this.lastAnalysisTime = Date.now();
  }

  /**
   * Check if keyword is crisis-related
   * @param {string} keyword - Keyword to check
   * @returns {boolean} Is crisis keyword
   */
  isCrisisKeyword(keyword) {
    return this.config.crisisKeywords.some(crisisWord => 
      keyword.toLowerCase().includes(crisisWord.toLowerCase())
    );
  }

  /**
   * Check if keyword indicates viral content
   * @param {string} keyword - Keyword to check
   * @returns {boolean} Is viral keyword
   */
  isViralKeyword(keyword) {
    return this.config.viralIndicators.some(viralWord => 
      keyword.toLowerCase().includes(viralWord.toLowerCase())
    );
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} Is stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Generate hash for string (simple hash function)
   * @param {string} str - String to hash
   * @returns {string} Hash value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get current trending topics
   * @returns {Array} Current trending topics
   */
  getCurrentTrendingTopics() {
    return this.trendingTopics;
  }

  /**
   * Get topic history
   * @param {string} keyword - Optional keyword filter
   * @returns {Map|Object} Topic history
   */
  getTopicHistory(keyword = null) {
    if (keyword) {
      return this.topicHistory.get(keyword) || null;
    }
    return this.topicHistory;
  }

  /**
   * Clear old topic history
   * @param {number} maxAge - Maximum age in milliseconds
   */
  clearOldHistory(maxAge = this.config.longTermWindow * 7) { // 7 days default
    const cutoff = Date.now() - maxAge;
    
    for (const [keyword, history] of this.topicHistory.entries()) {
      if (history.firstSeen < cutoff) {
        this.topicHistory.delete(keyword);
      }
    }
    
    console.log(`🧹 Cleared old topic history, ${this.topicHistory.size} topics remaining`);
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      totalTopicsTracked: this.topicHistory.size,
      currentTrendingCount: this.trendingTopics.length,
      cacheStatus: this.isCacheValid() ? 'valid' : 'expired',
      lastAnalysisTime: this.lastAnalysisTime,
      memoryUsage: {
        topicHistory: this.topicHistory.size,
        currentTopics: this.currentTopics.size
      }
    };
  }
}

module.exports = TrendingTopicDetectionService;