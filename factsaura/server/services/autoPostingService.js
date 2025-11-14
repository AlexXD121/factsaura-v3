/**
 * Auto-Posting Service
 * Automatically creates warning posts when misinformation is detected
 * Implements the Auto-Posting Agent from the FactSaura specification
 */

const Post = require('../models/Post');
const aiService = require('./aiService');

class AutoPostingService {
  constructor() {
    this.confidenceThreshold = parseFloat(process.env.AUTO_POST_CONFIDENCE_THRESHOLD) || 0.7; // 70%
    this.isEnabled = process.env.AUTO_POSTING_ENABLED !== 'false'; // Default enabled
    this.maxPostsPerHour = parseInt(process.env.MAX_AUTO_POSTS_PER_HOUR) || 10;
    this.recentPosts = []; // Track recent posts for rate limiting
    this.systemUserId = null; // Will be set on first use
    
    console.log(`🤖 Auto-Posting Service initialized - Threshold: ${this.confidenceThreshold * 100}%, Enabled: ${this.isEnabled}`);
  }

  /**
   * Get or create system user for auto-posting
   */
  async getSystemUserId() {
    if (this.systemUserId) {
      return this.systemUserId;
    }

    try {
      const { supabaseAdmin } = require('../config/supabase');
      const { data: systemUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', 'system')
        .single();
      
      if (userError || !systemUser) {
        console.error('❌ System user not found for auto-posting:', userError?.message);
        throw new Error('System user not configured for auto-posting');
      }
      
      this.systemUserId = systemUser.id;
      return this.systemUserId;
    } catch (error) {
      console.error('❌ Failed to get system user ID:', error);
      throw error;
    }
  }

  /**
   * Check if auto-posting is allowed (rate limiting)
   */
  isRateLimited() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.recentPosts = this.recentPosts.filter(timestamp => timestamp > oneHourAgo);
    
    return this.recentPosts.length >= this.maxPostsPerHour;
  }

  /**
   * Process scraped content and create auto-posts for detected misinformation
   * @param {Object} scrapedContent - Content from monitoring agents
   * @returns {Object} Processing results
   */
  async processScrapedContent(scrapedContent) {
    if (!this.isEnabled) {
      return { success: true, message: 'Auto-posting disabled', postsCreated: 0 };
    }

    if (this.isRateLimited()) {
      console.log('⚠️ Auto-posting rate limited - skipping this cycle');
      return { success: true, message: 'Rate limited', postsCreated: 0 };
    }

    const results = {
      processed: 0,
      postsCreated: 0,
      errors: [],
      posts: []
    };

    try {
      // Combine all content from different sources
      const allContent = [
        ...(scrapedContent.news || []),
        ...(scrapedContent.reddit || []),
        ...(scrapedContent.gdelt || [])
      ];

      console.log(`🔍 Auto-posting: Processing ${allContent.length} items for misinformation detection`);

      // Process each content item
      for (const item of allContent) {
        try {
          results.processed++;
          
          // Check if this content should trigger an auto-post
          const shouldCreatePost = await this.shouldCreateAutoPost(item);
          
          if (shouldCreatePost.create) {
            const autoPost = await this.createMisinformationAlert(item, shouldCreatePost.analysis);
            if (autoPost) {
              results.postsCreated++;
              results.posts.push(autoPost);
              this.recentPosts.push(Date.now());
              
              // Check rate limit after each post
              if (this.isRateLimited()) {
                console.log('⚠️ Rate limit reached during processing - stopping');
                break;
              }
            }
          }
        } catch (error) {
          console.error('❌ Error processing item for auto-post:', error);
          results.errors.push({
            item: item.title || item.content?.substring(0, 50) || 'Unknown',
            error: error.message
          });
        }
      }

      console.log(`✅ Auto-posting completed: ${results.postsCreated} posts created from ${results.processed} items`);
      return { success: true, ...results };

    } catch (error) {
      console.error('❌ Auto-posting service error:', error);
      return { 
        success: false, 
        error: error.message, 
        ...results 
      };
    }
  }

  /**
   * Determine if content should trigger an auto-post
   * @param {Object} item - Content item to analyze
   * @returns {Object} Decision and analysis
   */
  async shouldCreateAutoPost(item) {
    try {
      // Skip if already processed or too old
      if (item.processed_for_autopost || this.isContentTooOld(item)) {
        return { create: false, reason: 'already_processed_or_old' };
      }

      // Get content text for analysis
      const contentText = this.extractContentText(item);
      if (!contentText || contentText.length < 50) {
        return { create: false, reason: 'insufficient_content' };
      }

      // Perform AI analysis for misinformation detection
      console.log('🤖 Analyzing content for misinformation...');
      const analysis = await aiService.analyzeContentBasic(contentText, {
        include_crisis_context: true,
        include_reasoning: true,
        focus_on_misinformation: true
      });

      // Check confidence threshold
      if (analysis.confidence_score < this.confidenceThreshold) {
        return { 
          create: false, 
          reason: 'below_threshold',
          confidence: analysis.confidence_score 
        };
      }

      // Check if it's actually misinformation
      if (!analysis.is_misinformation) {
        return { 
          create: false, 
          reason: 'not_misinformation',
          confidence: analysis.confidence_score 
        };
      }

      // Check for crisis-level urgency
      const urgencyLevel = analysis.crisis_context?.urgency_level || 'low';
      if (!['high', 'critical'].includes(urgencyLevel)) {
        return { 
          create: false, 
          reason: 'low_urgency',
          urgency: urgencyLevel 
        };
      }

      console.log(`🚨 Misinformation detected! Confidence: ${analysis.confidence_score * 100}%, Urgency: ${urgencyLevel}`);
      
      return { 
        create: true, 
        analysis,
        confidence: analysis.confidence_score,
        urgency: urgencyLevel
      };

    } catch (error) {
      console.error('❌ Error in shouldCreateAutoPost:', error);
      return { create: false, reason: 'analysis_error', error: error.message };
    }
  }

  /**
   * Create a misinformation alert post
   * @param {Object} originalItem - Original content that triggered the alert
   * @param {Object} analysis - AI analysis results
   * @returns {Object} Created post or null
   */
  async createMisinformationAlert(originalItem, analysis) {
    try {
      const systemUserId = await this.getSystemUserId();
      
      // Generate alert post content
      const alertContent = this.generateAlertContent(originalItem, analysis);
      
      // Prepare post data
      const postData = {
        title: alertContent.title,
        content: alertContent.content,
        content_type: 'text',
        source_url: this.extractSourceUrl(originalItem),
        post_type: 'ai_detected',
        author_id: systemUserId,
        
        // Crisis context
        urgency_level: analysis.crisis_context?.urgency_level || 'high',
        location_relevance: this.extractLocation(originalItem) || 'global',
        harm_category: analysis.crisis_context?.harm_category || 'misinformation',
        crisis_keywords: analysis.crisis_context?.crisis_keywords_found || [],
        
        // AI analysis data
        ai_analysis: {
          ...analysis,
          auto_generated: true,
          original_source: this.getSourceInfo(originalItem),
          detection_timestamp: new Date().toISOString()
        },
        confidence_score: analysis.confidence_score,
        is_misinformation: true,
        analysis_explanation: analysis.explanation,
        reasoning_steps: analysis.reasoning_steps || [],
        sources_checked: analysis.sources_checked || [],
        uncertainty_flags: analysis.uncertainty_flags || [],
        analysis_timestamp: new Date().toISOString(),
        
        // Default engagement
        upvotes: 0,
        downvotes: 0,
        comments_count: 0,
        expert_verifications: 0,
        community_trust_score: 0.8, // Higher trust for AI-generated alerts
        
        // Publication status
        is_published: true,
        is_flagged: false,
        is_verified: true // AI-generated alerts are pre-verified
      };

      console.log('🚨 Creating misinformation alert post...');
      const newPost = await Post.create(postData);
      
      console.log(`✅ Misinformation alert created: ${newPost.id}`);
      
      return newPost;

    } catch (error) {
      console.error('❌ Failed to create misinformation alert:', error);
      return null;
    }
  }

  /**
   * Generate alert post content based on detected misinformation
   * @param {Object} originalItem - Original content
   * @param {Object} analysis - AI analysis
   * @returns {Object} Generated title and content
   */
  generateAlertContent(originalItem, analysis) {
    const sourceInfo = this.getSourceInfo(originalItem);
    const confidence = Math.round(analysis.confidence_score * 100);
    const urgency = analysis.crisis_context?.urgency_level || 'high';
    
    // Generate title based on content type and urgency
    let title = '🚨 MISINFORMATION ALERT';
    if (urgency === 'critical') {
      title = '🔴 CRITICAL MISINFORMATION ALERT';
    }
    
    // Add specific topic if available
    const harmCategory = analysis.crisis_context?.harm_category;
    if (harmCategory && harmCategory !== 'general') {
      title += ` - ${harmCategory.toUpperCase()}`;
    }

    // Generate detailed content
    const originalText = this.extractContentText(originalItem);
    const truncatedOriginal = originalText.length > 200 ? 
      originalText.substring(0, 200) + '...' : originalText;

    const content = `🚨 MISINFORMATION ALERT

Detected on ${sourceInfo.platform}: "${truncatedOriginal}"

🤖 AI Analysis: ${analysis.explanation || 'This content contains misleading or false information that could cause harm.'}

📊 Confidence: ${confidence}% misinformation
⚠️ Urgency: ${urgency.toUpperCase()}
🔍 Sources: ${analysis.sources_checked?.join(', ') || 'Multiple fact-checking databases'}

${analysis.reasoning_steps?.length ? 
  '🧠 Reasoning:\n' + analysis.reasoning_steps.map((step, i) => `${i + 1}. ${step}`).join('\n') + '\n\n' : 
  ''
}⚡ This alert was automatically generated by FactSaura's AI monitoring system.

#MisinformationAlert #FactCheck #AIDetected`;

    return { title, content };
  }

  /**
   * Extract readable content text from various item formats
   */
  extractContentText(item) {
    if (item.content) return item.content;
    if (item.title && item.description) return `${item.title}\n\n${item.description}`;
    if (item.title) return item.title;
    if (item.selftext) return item.selftext; // Reddit
    if (item.description) return item.description;
    if (item.text) return item.text;
    return '';
  }

  /**
   * Extract source URL from item
   */
  extractSourceUrl(item) {
    return item.url || item.source_url || item.permalink || null;
  }

  /**
   * Extract location information from item
   */
  extractLocation(item) {
    if (item.location) return item.location;
    if (item.country) return item.country;
    if (item.geo) return item.geo;
    return null;
  }

  /**
   * Get source information for attribution
   */
  getSourceInfo(item) {
    if (item.source === 'reddit' || item.subreddit) {
      return {
        platform: 'Reddit',
        source: item.subreddit ? `r/${item.subreddit}` : 'Reddit',
        type: 'social_media'
      };
    }
    
    if (item.source === 'news' || item.source?.name) {
      return {
        platform: item.source?.name || 'News',
        source: item.source?.name || 'News Media',
        type: 'news'
      };
    }
    
    if (item.source === 'gdelt') {
      return {
        platform: 'GDELT',
        source: 'Global News Monitoring',
        type: 'news_aggregator'
      };
    }
    
    return {
      platform: 'Unknown',
      source: 'External Source',
      type: 'unknown'
    };
  }

  /**
   * Check if content is too old to process
   */
  isContentTooOld(item) {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const itemTime = new Date(item.created_utc * 1000 || item.publishedAt || item.created_at || Date.now());
    return (Date.now() - itemTime.getTime()) > maxAge;
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.confidenceThreshold !== undefined) {
      this.confidenceThreshold = config.confidenceThreshold;
    }
    if (config.isEnabled !== undefined) {
      this.isEnabled = config.isEnabled;
    }
    if (config.maxPostsPerHour !== undefined) {
      this.maxPostsPerHour = config.maxPostsPerHour;
    }
    
    console.log('⚙️ Auto-posting config updated:', {
      threshold: this.confidenceThreshold,
      enabled: this.isEnabled,
      maxPerHour: this.maxPostsPerHour
    });
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      isEnabled: this.isEnabled,
      confidenceThreshold: this.confidenceThreshold,
      maxPostsPerHour: this.maxPostsPerHour,
      recentPostsCount: this.recentPosts.length,
      isRateLimited: this.isRateLimited(),
      systemUserId: this.systemUserId
    };
  }
}

module.exports = AutoPostingService;