const { supabase, supabaseAdmin } = require('../config/supabase');

class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.type = data.post_type || data.type || 'user_submitted'; // Align with design spec
    this.content_type = data.content_type || 'text';
    this.source_url = data.source_url;
    this.author_id = data.author_id;
    
    // Crisis Context - structured object as per design spec
    this.crisis_context = this._buildCrisisContext(data);
    
    // AI Analysis - structured object as per design spec  
    this.ai_analysis = this._buildAIAnalysis(data);
    
    // Engagement - structured object as per design spec
    this.engagement = this._buildEngagement(data);
    
    // Status fields
    this.is_published = data.is_published !== false;
    this.is_flagged = data.is_flagged || false;
    this.is_verified = data.is_verified || false;
    
    // Timestamps
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Author information (if populated from join)
    this.author = data.author;
  }

  /**
   * Build structured crisis context object as per design specification
   */
  _buildCrisisContext(data) {
    return {
      urgency_level: data.urgency_level || data.crisis_context?.urgency_level || 'medium',
      location_relevance: data.location_relevance || data.crisis_context?.location_relevance || 'global',
      harm_category: data.harm_category || data.crisis_context?.harm_category || 'general',
      crisis_keywords: data.crisis_keywords || data.crisis_context?.crisis_keywords || []
    };
  }

  /**
   * Build structured AI analysis object as per design specification
   */
  _buildAIAnalysis(data) {
    // Handle both flat structure (from DB) and nested structure (from API)
    const aiData = data.ai_analysis || {};
    
    return {
      confidence_score: data.confidence_score || aiData.confidence_score || 0.000,
      is_misinformation: data.is_misinformation !== undefined ? data.is_misinformation : (aiData.is_misinformation || false),
      explanation: data.analysis_explanation || aiData.explanation || '',
      reasoning_steps: data.reasoning_steps || aiData.reasoning_steps || [],
      sources_checked: this._formatSourcesChecked(data.sources_checked || aiData.sources_checked || []),
      uncertainty_flags: data.uncertainty_flags || aiData.uncertainty_flags || [],
      analysis_timestamp: data.analysis_timestamp || aiData.analysis_timestamp
    };
  }

  /**
   * Build structured engagement object as per design specification
   */
  _buildEngagement(data) {
    return {
      upvotes: data.upvotes || 0,
      downvotes: data.downvotes || 0,
      comments_count: data.comments_count || 0,
      expert_verifications: data.expert_verifications || 0,
      community_trust_score: data.community_trust_score || 0.000
    };
  }

  /**
   * Format sources_checked to match design specification structure
   */
  _formatSourcesChecked(sources) {
    if (!Array.isArray(sources)) return [];
    
    return sources.map(source => {
      if (typeof source === 'string') {
        return { url: source, credibility: 0.5, status: 'unchecked' };
      }
      return {
        url: source.url || '',
        credibility: source.credibility || 0.5,
        status: source.status || 'unchecked'
      };
    });
  }

  // Create new post
  static async create(postData) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return new Post(data);
  }

  // Create AI-detected misinformation post
  static async createAIDetected(detectionData) {
    const {
      title,
      content,
      source_url,
      ai_analysis,
      crisis_context = {},
      author_id // Should be system user for AI-detected posts
    } = detectionData;

    const postData = {
      title,
      content,
      source_url,
      post_type: 'ai_detected',
      author_id,
      
      // Crisis context
      urgency_level: crisis_context.urgency_level || 'high',
      location_relevance: crisis_context.location_relevance || 'global',
      harm_category: crisis_context.harm_category || 'general',
      crisis_keywords: crisis_context.crisis_keywords || [],
      
      // AI analysis
      ai_analysis,
      confidence_score: ai_analysis.confidence_score,
      is_misinformation: ai_analysis.is_misinformation,
      analysis_explanation: ai_analysis.explanation,
      reasoning_steps: ai_analysis.reasoning_steps || [],
      sources_checked: ai_analysis.sources_checked || [],
      uncertainty_flags: ai_analysis.uncertainty_flags || [],
      analysis_timestamp: new Date().toISOString(),
      
      // Default values for AI-detected posts
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      expert_verifications: 0,
      community_trust_score: ai_analysis.confidence_score || 0.5,
      is_published: true,
      is_flagged: ai_analysis.is_misinformation || false,
      is_verified: false
    };

    return this.create(postData);
  }

  // Find post by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, full_name, avatar_url, reputation_score, badges, is_verified, is_expert)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return new Post(data);
  }

  // Get feed with pagination and filtering
  static async getFeed(options = {}) {
    const {
      limit = 20,
      offset = 0,
      urgency_level = null,
      location = null,
      is_misinformation = null,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, full_name, avatar_url, reputation_score, badges, is_verified, is_expert)
      `)
      .eq('is_published', true);

    // Apply filters
    if (urgency_level) {
      query = query.eq('urgency_level', urgency_level);
    }
    if (location) {
      query = query.eq('location_relevance', location);
    }
    if (is_misinformation !== null) {
      query = query.eq('is_misinformation', is_misinformation);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data.map(post => new Post(post));
  }

  // Update post
  async update(updates) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;
    
    // Update current instance
    Object.assign(this, data);
    return this;
  }

  // Update AI analysis with structured format
  async updateAIAnalysis(analysis) {
    const updateData = {
      // Store structured AI analysis object
      ai_analysis: {
        confidence_score: analysis.confidence_score || 0.000,
        is_misinformation: analysis.is_misinformation || false,
        explanation: analysis.explanation || '',
        reasoning_steps: analysis.reasoning_steps || [],
        sources_checked: this._formatSourcesChecked(analysis.sources_checked || []),
        uncertainty_flags: analysis.uncertainty_flags || [],
        analysis_timestamp: new Date().toISOString()
      },
      // Also update flat fields for database compatibility
      confidence_score: analysis.confidence_score || 0.000,
      is_misinformation: analysis.is_misinformation || false,
      analysis_explanation: analysis.explanation || '',
      reasoning_steps: analysis.reasoning_steps || [],
      sources_checked: this._formatSourcesChecked(analysis.sources_checked || []),
      uncertainty_flags: analysis.uncertainty_flags || [],
      analysis_timestamp: new Date().toISOString()
    };

    return this.update(updateData);
  }

  // Update vote counts and recalculate community trust score
  async updateVoteCounts() {
    const { data: votes, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', this.id);

    if (error) throw error;

    const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
    const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
    
    // Calculate community trust score based on votes and AI confidence
    const totalVotes = upvotes + downvotes;
    const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0.5;
    const aiConfidence = this.ai_analysis.confidence_score || 0.5;
    
    // Weighted average of vote ratio and AI confidence
    const community_trust_score = (voteRatio * 0.6 + aiConfidence * 0.4);

    return this.update({ 
      upvotes, 
      downvotes, 
      community_trust_score: Math.round(community_trust_score * 1000) / 1000 // Round to 3 decimal places
    });
  }

  // Update crisis context
  async updateCrisisContext(crisisData) {
    const updatedContext = {
      ...this.crisis_context,
      ...crisisData
    };

    return this.update({
      crisis_context: updatedContext,
      urgency_level: updatedContext.urgency_level,
      location_relevance: updatedContext.location_relevance,
      harm_category: updatedContext.harm_category,
      crisis_keywords: updatedContext.crisis_keywords
    });
  }

  // Check if post needs expert review based on AI analysis
  needsExpertReview() {
    const { confidence_score, uncertainty_flags } = this.ai_analysis;
    
    // Needs review if confidence is low or has uncertainty flags
    return confidence_score < 0.7 || 
           (uncertainty_flags && uncertainty_flags.length > 0) ||
           this.crisis_context.urgency_level === 'critical';
  }

  // Get crisis priority score for sorting
  getCrisisPriorityScore() {
    const urgencyScores = {
      'critical': 100,
      'high': 75,
      'medium': 50,
      'low': 25
    };
    
    const baseScore = urgencyScores[this.crisis_context.urgency_level] || 50;
    const confidenceBonus = this.ai_analysis.confidence_score * 20;
    const trustBonus = this.engagement.community_trust_score * 10;
    
    return baseScore + confidenceBonus + trustBonus;
  }

  // Check if post is likely misinformation with high confidence
  isHighConfidenceMisinformation() {
    return this.ai_analysis.is_misinformation && 
           this.ai_analysis.confidence_score >= 0.8;
  }

  // Get post comments
  async getComments(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(id, username, full_name, avatar_url, reputation_score, badges, is_verified, is_expert)
      `)
      .eq('post_id', this.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Serialize for API response - structured format as per design specification
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      type: this.type, // Align with design spec naming
      content_type: this.content_type,
      source_url: this.source_url,
      author_id: this.author_id,
      
      // Structured crisis context
      crisis_context: this.crisis_context,
      
      // Structured AI analysis
      ai_analysis: this.ai_analysis,
      
      // Structured engagement metrics
      engagement: this.engagement,
      
      // Status fields
      is_published: this.is_published,
      is_flagged: this.is_flagged,
      is_verified: this.is_verified,
      
      // Timestamps
      created_at: this.created_at,
      updated_at: this.updated_at,
      
      // Author information (if available)
      author: this.author
    };
  }

  // Legacy method for backward compatibility with existing code
  toLegacyJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      content_type: this.content_type,
      source_url: this.source_url,
      post_type: this.type,
      author_id: this.author_id,
      crisis_context: this.crisis_context,
      urgency_level: this.crisis_context.urgency_level,
      location_relevance: this.crisis_context.location_relevance,
      harm_category: this.crisis_context.harm_category,
      crisis_keywords: this.crisis_context.crisis_keywords,
      ai_analysis: this.ai_analysis,
      confidence_score: this.ai_analysis.confidence_score,
      is_misinformation: this.ai_analysis.is_misinformation,
      analysis_explanation: this.ai_analysis.explanation,
      reasoning_steps: this.ai_analysis.reasoning_steps,
      sources_checked: this.ai_analysis.sources_checked,
      uncertainty_flags: this.ai_analysis.uncertainty_flags,
      analysis_timestamp: this.ai_analysis.analysis_timestamp,
      upvotes: this.engagement.upvotes,
      downvotes: this.engagement.downvotes,
      comments_count: this.engagement.comments_count,
      expert_verifications: this.engagement.expert_verifications,
      community_trust_score: this.engagement.community_trust_score,
      is_published: this.is_published,
      is_flagged: this.is_flagged,
      is_verified: this.is_verified,
      created_at: this.created_at,
      updated_at: this.updated_at,
      author: this.author
    };
  }
}

module.exports = Post;