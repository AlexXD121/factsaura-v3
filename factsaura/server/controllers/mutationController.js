// Mutation Controller - handles mutation detection and genealogy operations
const MutationDetectionService = require('../services/mutationDetectionService');
const config = require('../config');

// Initialize mutation detection service
const mutationService = new MutationDetectionService();

/**
 * Analyze content for mutations
 * POST /api/mutations/analyze
 */
const analyzeMutation = async (req, res) => {
  try {
    const { content, metadata = {} } = req.body;
    
    // Input validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content is required and must be a non-empty string'
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

    console.log('🧬 Analyzing content for mutations...');
    
    // Perform mutation detection
    const mutationAnalysis = await mutationService.detectMutation(content, {
      ...metadata,
      api_request: true,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Mutation analysis completed:', {
      is_mutation: mutationAnalysis.is_mutation,
      family_id: mutationAnalysis.family_id,
      confidence: mutationAnalysis.confidence
    });

    res.status(200).json({
      success: true,
      data: {
        mutation_analysis: mutationAnalysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error analyzing mutation:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to analyze mutation',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get mutation family tree
 * GET /api/mutations/family/:identifier
 */
const getMutationFamily = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family identifier is required'
        }
      });
    }

    console.log('🌳 Retrieving mutation family:', identifier);
    
    const familyData = mutationService.getMutationFamily(identifier);
    
    if (!familyData.found) {
      return res.status(404).json({
        error: {
          code: 'FAMILY_NOT_FOUND',
          message: 'Mutation family not found',
          details: familyData.error
        }
      });
    }

    console.log('✅ Family retrieved:', {
      family_id: familyData.family_id,
      mutation_count: familyData.mutation_count
    });

    res.status(200).json({
      success: true,
      data: familyData
    });

  } catch (error) {
    console.error('❌ Error retrieving mutation family:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve mutation family',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Predict future mutations for a family
 * GET /api/mutations/predict/:familyId
 */
const predictMutations = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    if (!familyId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family ID is required'
        }
      });
    }

    console.log('🔮 Predicting mutations for family:', familyId);
    
    const predictions = mutationService.predictMutations(familyId);
    
    if (predictions.error) {
      return res.status(404).json({
        error: {
          code: 'FAMILY_NOT_FOUND',
          message: 'Mutation family not found for predictions',
          details: predictions.error
        }
      });
    }

    console.log('✅ Predictions generated:', {
      family_id: familyId,
      prediction_count: predictions.predictions.length,
      confidence: predictions.confidence
    });

    res.status(200).json({
      success: true,
      data: predictions
    });

  } catch (error) {
    console.error('❌ Error predicting mutations:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to predict mutations',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get mutation statistics
 * GET /api/mutations/statistics
 */
const getMutationStatistics = async (req, res) => {
  try {
    console.log('📊 Retrieving mutation statistics...');
    
    const statistics = mutationService.getMutationStatistics();
    
    console.log('✅ Statistics retrieved:', {
      total_families: statistics.total_families,
      total_mutations: statistics.total_mutations,
      active_families: statistics.active_families
    });

    res.status(200).json({
      success: true,
      data: {
        statistics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving mutation statistics:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve mutation statistics',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get mutation trends and patterns
 * GET /api/mutations/trends
 */
const getMutationTrends = async (req, res) => {
  try {
    const { timeframe = '24h', cluster } = req.query;
    
    console.log('📈 Retrieving mutation trends...');
    
    const statistics = mutationService.getMutationStatistics();
    
    // Process trends based on timeframe and cluster
    const trends = {
      timeframe,
      cluster_filter: cluster || 'all',
      active_families: statistics.active_families,
      recent_activity: statistics.recent_activity,
      mutation_types: statistics.mutation_types,
      semantic_clusters: statistics.semantic_clusters,
      trend_analysis: {
        most_active_cluster: Object.entries(statistics.semantic_clusters)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        dominant_mutation_type: Object.entries(statistics.mutation_types)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        activity_level: statistics.active_families > 0 ? 'high' : 'low'
      }
    };

    console.log('✅ Trends retrieved:', {
      active_families: trends.active_families,
      dominant_type: trends.trend_analysis.dominant_mutation_type
    });

    res.status(200).json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('❌ Error retrieving mutation trends:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve mutation trends',
        details: config.nodeEnv === 'development' ? error.message : undefined
      }
    });
  }
};

module.exports = {
  analyzeMutation,
  getMutationFamily,
  predictMutations,
  getMutationStatistics,
  getMutationTrends
};