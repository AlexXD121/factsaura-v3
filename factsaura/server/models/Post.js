const { supabase, supabaseAdmin } = require('../config/supabase');

class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.content_type = data.content_type || 'text';
    this.source_url = data.source_url;
    this.post_type = data.post_type || 'user_submitted';
    this.author_id = data.author_id;
    this.crisis_context = data.crisis_context || {};
    this.urgency_level = data.urgency_level || 'medium';
    this.location_relevance = data.location_relevance;
    this.harm_category = data.harm_category;
    this.crisis_keywords = data.crisis_keywords || [];
    this.ai_analysis = data.ai_analysis || {};
    this.confidence_score = data.confidence_score || 0.000;
    this.is_misinformation = data.is_misinformation || false;
    this.analysis_explanation = data.analysis_explanation;
    this.reasoning_steps = data.reasoning_steps || [];
    this.sources_checked = data.sources_checked || [];
    this.uncertainty_flags = data.uncertainty_flags || [];
    this.analysis_timestamp = data.analysis_timestamp;
    this.upvotes = data.upvotes || 0;
    this.downvotes = data.downvotes || 0;
    this.comments_count = data.comments_count || 0;
    this.expert_verifications = data.expert_verifications || 0;
    this.community_trust_score = data.community_trust_score || 0.000;
    this.is_published = data.is_published !== false;
    this.is_flagged = data.is_flagged || false;
    this.is_verified = data.is_verified || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
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

  // Update AI analysis
  async updateAIAnalysis(analysis) {
    return this.update({
      ai_analysis: analysis,
      confidence_score: analysis.confidence_score,
      is_misinformation: analysis.is_misinformation,
      analysis_explanation: analysis.explanation,
      reasoning_steps: analysis.reasoning_steps,
      sources_checked: analysis.sources_checked,
      uncertainty_flags: analysis.uncertainty_flags,
      analysis_timestamp: new Date().toISOString()
    });
  }

  // Update vote counts
  async updateVoteCounts() {
    const { data: votes, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', this.id);

    if (error) throw error;

    const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
    const downvotes = votes.filter(v => v.vote_type === 'downvote').length;

    return this.update({ upvotes, downvotes });
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

  // Serialize for API response
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      content_type: this.content_type,
      source_url: this.source_url,
      post_type: this.post_type,
      author_id: this.author_id,
      crisis_context: this.crisis_context,
      urgency_level: this.urgency_level,
      location_relevance: this.location_relevance,
      harm_category: this.harm_category,
      crisis_keywords: this.crisis_keywords,
      ai_analysis: this.ai_analysis,
      confidence_score: this.confidence_score,
      is_misinformation: this.is_misinformation,
      analysis_explanation: this.analysis_explanation,
      reasoning_steps: this.reasoning_steps,
      sources_checked: this.sources_checked,
      uncertainty_flags: this.uncertainty_flags,
      analysis_timestamp: this.analysis_timestamp,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      comments_count: this.comments_count,
      expert_verifications: this.expert_verifications,
      community_trust_score: this.community_trust_score,
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