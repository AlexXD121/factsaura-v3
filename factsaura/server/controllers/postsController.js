// Posts Controller - handles post-related operations
const Post = require('../models/Post');
const aiService = require('../services/aiService');
const MutationDetectionService = require('../services/mutationDetectionService');
const config = require('../config');

// Initialize mutation detection service
const mutationService = new MutationDetectionService();

const getPosts = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
      urgency_level,
      location,
      is_misinformation
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Max 100 posts per page
    const offset = (pageNum - 1) * limitNum;

    // Validate sort parameters
    const validSortFields = ['created_at', 'updated_at', 'upvotes', 'downvotes', 'confidence_score', 'urgency_level'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validSortOrders.includes(sort_order) ? sort_order : 'desc';

    // Validate filter parameters
    const validUrgencyLevels = ['critical', 'high', 'medium'];
    const urgencyFilter = validUrgencyLevels.includes(urgency_level) ? urgency_level : null;
    
    const locationFilter = location || null;
    
    let misinformationFilter = null;
    if (is_misinformation === 'true') misinformationFilter = true;
    if (is_misinformation === 'false') misinformationFilter = false;

    console.log('📄 Fetching posts with parameters:', {
      page: pageNum,
      limit: limitNum,
      offset,
      sort_by: sortBy,
      sort_order: sortOrder,
      urgency_level: urgencyFilter,
      location: locationFilter,
      is_misinformation: misinformationFilter
    });

    // Fetch posts using the Post model
    const posts = await Post.getFeed({
      limit: limitNum,
      offset,
      urgency_level: urgencyFilter,
      location: locationFilter,
      is_misinformation: misinformationFilter,
      sort_by: sortBy,
      sort_order: sortOrder
    });

    console.log(`✅ Retrieved ${posts.length} posts`);

    // Calculate pagination metadata
    const hasMore = posts.length === limitNum;
    const nextPage = hasMore ? pageNum + 1 : null;
    const prevPage = pageNum > 1 ? pageNum - 1 : null;

    // Return paginated response
    res.status(200).json({
      success: true,
      data: {
        posts: posts.map(post => post.toJSON()),
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          has_more: hasMore,
          next_page: nextPage,
          prev_page: prevPage,
          total_returned: posts.length
        },
        filters: {
          urgency_level: urgencyFilter,
          location: locationFilter,
          is_misinformation: misinformationFilter,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    
    // Handle specific error types
    if (error.message.includes('invalid input syntax') || 
        error.message.includes('column') ||
        error.message.includes('relation')) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Invalid query parameters',
          details: config.nodeEnv === 'development' ? error.message : undefined
        }
      });
    }

    // Generic server error
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch posts',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

const createPost = async (req, res) => {
  try {
    // Input validation
    const { title, content, content_type = 'text', source_url } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required',
          details: {
            title: !title ? 'Title is required' : null,
            content: !content ? 'Content is required' : null
          }
        }
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must be 200 characters or less'
        }
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content must be 10,000 characters or less'
        }
      });
    }

    // Get user ID from auth (for now, use system user)
    // TODO: Implement proper authentication in later tasks
    let author_id = req.user?.id;
    
    // If no authenticated user, use system user for testing
    if (!author_id) {
      // Get system user ID from database
      const { supabaseAdmin } = require('../config/supabase');
      const { data: systemUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', 'system')
        .single();
      
      if (userError || !systemUser) {
        console.error('❌ Failed to get system user:', userError?.message);
        return res.status(500).json({
          error: {
            code: 'SYSTEM_ERROR',
            message: 'System user not found. Please run setup scripts.'
          }
        });
      }
      
      author_id = systemUser.id;
      console.log('✅ Using system user ID:', author_id);
    }

    console.log('🔍 Starting AI analysis for new post...');
    
    // Perform AI analysis on the content
    const aiAnalysis = await aiService.analyzeContentBasic(content, {
      include_crisis_context: true,
      include_reasoning: true
    });

    console.log('✅ AI analysis completed:', {
      is_misinformation: aiAnalysis.is_misinformation,
      confidence: aiAnalysis.confidence_score,
      urgency: aiAnalysis.crisis_context?.urgency_level
    });

    // 🧬 MUTATION DETECTION: Check if this content is a mutation of existing misinformation
    console.log('🧬 Starting mutation detection analysis...');
    const mutationAnalysis = await mutationService.detectMutation(content, {
      source: req.headers['user-agent'] || 'web',
      user_id: author_id,
      timestamp: new Date().toISOString(),
      ai_confidence: aiAnalysis.confidence_score
    });

    console.log('✅ Mutation analysis completed:', {
      is_mutation: mutationAnalysis.is_mutation,
      mutation_type: mutationAnalysis.mutation_type,
      family_id: mutationAnalysis.family_id,
      confidence: mutationAnalysis.confidence
    });

    // Extract crisis context from AI analysis
    const crisisContext = aiAnalysis.crisis_context || {};
    
    // Prepare post data with AI analysis results and mutation detection
    const postData = {
      title: title.trim(),
      content: content.trim(),
      content_type,
      source_url: source_url || null,
      post_type: 'user_submitted',
      author_id,
      
      // Crisis context fields
      urgency_level: crisisContext.urgency_level || 'medium',
      location_relevance: 'global', // Default, can be enhanced later
      harm_category: crisisContext.harm_category || 'general',
      crisis_keywords: crisisContext.crisis_keywords_found || [],
      
      // AI analysis fields (including mutation data)
      ai_analysis: {
        ...aiAnalysis,
        mutation_analysis: mutationAnalysis // Include mutation data in AI analysis
      },
      confidence_score: aiAnalysis.confidence_score || 0,
      is_misinformation: aiAnalysis.is_misinformation || false,
      analysis_explanation: aiAnalysis.explanation,
      reasoning_steps: aiAnalysis.reasoning_steps || [],
      sources_checked: aiAnalysis.sources_checked || [],
      uncertainty_flags: aiAnalysis.uncertainty_flags || [],
      analysis_timestamp: new Date().toISOString(),
      
      // 🧬 MUTATION DETECTION FIELDS (stored in ai_analysis for now until DB migration)
      // TODO: Add dedicated mutation columns in future migration
      // mutation_analysis: mutationAnalysis,
      // is_mutation: mutationAnalysis.is_mutation || false,
      // mutation_family_id: mutationAnalysis.family_id || null,
      // mutation_type: mutationAnalysis.mutation_type || null,
      // mutation_generation: mutationAnalysis.generation || null,
      // mutation_confidence: mutationAnalysis.confidence || 0,
      
      // Default engagement values
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      expert_verifications: 0,
      community_trust_score: 0.5,
      
      // Publication status
      is_published: true,
      is_flagged: false,
      is_verified: false
    };

    console.log('💾 Creating post in database...');
    console.log('📝 Post data:', JSON.stringify(postData, null, 2));
    
    // Create post in database
    const newPost = await Post.create(postData);
    
    console.log('✅ Post created successfully:', newPost.id);

    // Return success response with post data, AI analysis, and mutation detection
    res.status(201).json({
      success: true,
      message: 'Post created successfully with AI analysis and mutation detection',
      data: {
        post: newPost.toJSON(),
        ai_analysis: {
          confidence_score: aiAnalysis.confidence_score,
          is_misinformation: aiAnalysis.is_misinformation,
          explanation: aiAnalysis.explanation,
          reasoning_steps: aiAnalysis.reasoning_steps,
          crisis_context: crisisContext,
          processing_time_ms: aiAnalysis.processing_time_ms,
          analysis_quality: aiAnalysis.analysis_quality
        },
        mutation_analysis: {
          is_mutation: mutationAnalysis.is_mutation,
          mutation_type: mutationAnalysis.mutation_type,
          family_id: mutationAnalysis.family_id,
          generation: mutationAnalysis.generation,
          confidence: mutationAnalysis.confidence,
          analysis: mutationAnalysis.analysis
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating post:', error);
    
    // Handle specific error types
    if (error.message.includes('Content is required') || 
        error.message.includes('Title') || 
        error.message.includes('characters')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }

    if (error.message.includes('AI analysis') || 
        error.message.includes('Circuit breaker') ||
        error.message.includes('timeout')) {
      return res.status(503).json({
        error: {
          code: 'AI_SERVICE_ERROR',
          message: 'AI analysis service temporarily unavailable',
          details: error.message,
          retry_after: 30
        }
      });
    }

    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_POST',
          message: 'A similar post already exists'
        }
      });
    }

    // Generic server error
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create post',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

const getPostById = async (req, res) => {
  res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Post retrieval will be implemented in Task 2.3'
    }
  });
};

const voteOnPost = async (req, res) => {
  res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Voting functionality will be implemented in Task 3.1'
    }
  });
};

const getPostComments = async (req, res) => {
  res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Comments functionality will be implemented in later tasks'
    }
  });
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  voteOnPost,
  getPostComments
};