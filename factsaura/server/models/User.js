const { supabase, supabaseAdmin } = require('../config/supabase');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.full_name = data.full_name;
    this.avatar_url = data.avatar_url;
    this.reputation_score = data.reputation_score || 0;
    this.badges = data.badges || [];
    this.expertise_areas = data.expertise_areas || [];
    this.submissions_count = data.submissions_count || 0;
    this.accurate_submissions = data.accurate_submissions || 0;
    this.expert_verifications_given = data.expert_verifications_given || 0;
    this.community_trust_rating = data.community_trust_rating || 0.00;
    this.location = data.location;
    this.is_verified = data.is_verified || false;
    this.is_expert = data.is_expert || false;
    this.is_active = data.is_active || true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_login_at = data.last_login_at;
  }

  // Create new user
  static async create(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return new User(data);
  }

  // Find user by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return new User(data);
  }

  // Find user by email
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return new User(data);
  }

  // Find user by username
  static async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return new User(data);
  }

  // Update user
  async update(updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;
    
    // Update current instance
    Object.assign(this, data);
    return this;
  }

  // Add reputation points
  async addReputation(points) {
    return this.update({
      reputation_score: this.reputation_score + points
    });
  }

  // Add badge
  async addBadge(badge) {
    const badges = [...this.badges, badge];
    return this.update({ badges });
  }

  // Update last login
  async updateLastLogin() {
    return this.update({
      last_login_at: new Date().toISOString()
    });
  }

  // Get user's posts
  async getPosts(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', this.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Serialize for API response
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      full_name: this.full_name,
      avatar_url: this.avatar_url,
      reputation_score: this.reputation_score,
      badges: this.badges,
      expertise_areas: this.expertise_areas,
      community_trust_rating: this.community_trust_rating,
      location: this.location,
      is_verified: this.is_verified,
      is_expert: this.is_expert,
      created_at: this.created_at
    };
  }
}

module.exports = User;