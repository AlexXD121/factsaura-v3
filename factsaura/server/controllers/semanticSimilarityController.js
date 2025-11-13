// Semantic Similarity Controller
// API endpoints for semantic similarity and variant identification

const SemanticSimilarityService = require('../services/semanticSimilarityService');
const MutationDetectionService = require('../services/mutationDetectionService');

class SemanticSimilarityController {
  constructor() {
    this.semanticService = new SemanticSimilarityService();
    this.mutationService = new MutationDetectionService();
  }

  /**
   * Calculate semantic similarity between two texts
   * POST /api/semantic/similarity
   */
  async calculateSimilarity(req, res) {
    try {
      const { text1, text2, options = {} } = req.body;

      if (!text1 || !text2) {
        return res.status(400).json({
          error: 'Both text1 and text2 are required',
          code: 'MISSING_TEXTS'
        });
      }

      const similarity = await this.semanticService.calculateSimilarity(text1, text2, options);

      res.json({
        success: true,
        similarity: similarity,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Similarity calculation failed:', error.message);
      res.status(500).json({
        error: 'Failed to calculate semantic similarity',
        details: error.message,
        code: 'SIMILARITY_CALCULATION_FAILED'
      });
    }
  }

  /**
   * Find semantic variants of given text
   * POST /api/semantic/find-variants
   */
  async findVariants(req, res) {
    try {
      const { text, collection, options = {} } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Text parameter is required',
          code: 'MISSING_TEXT'
        });
      }

      if (!collection || !Array.isArray(collection)) {
        return res.status(400).json({
          error: 'Collection must be an array of text objects',
          code: 'INVALID_COLLECTION'
        });
      }

      const variants = await this.semanticService.findVariants(text, collection, options);

      res.json({
        success: true,
        query_text: text,
        variants_found: variants.length,
        variants: variants,
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Variant finding failed:', error.message);
      res.status(500).json({
        error: 'Failed to find semantic variants',
        details: error.message,
        code: 'VARIANT_FINDING_FAILED'
      });
    }
  }

  /**
   * Cluster texts by semantic similarity
   * POST /api/semantic/cluster
   */
  async clusterTexts(req, res) {
    try {
      const { texts, options = {} } = req.body;

      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({
          error: 'Texts must be an array of text objects',
          code: 'INVALID_TEXTS'
        });
      }

      const clusters = await this.semanticService.clusterSimilarTexts(texts, options);

      res.json({
        success: true,
        total_texts: texts.length,
        clusters_found: clusters.length,
        clusters: clusters,
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Text clustering failed:', error.message);
      res.status(500).json({
        error: 'Failed to cluster texts',
        details: error.message,
        code: 'CLUSTERING_FAILED'
      });
    }
  }

  /**
   * Generate semantic fingerprint for text
   * POST /api/semantic/fingerprint
   */
  async generateFingerprint(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Text parameter is required',
          code: 'MISSING_TEXT'
        });
      }

      const fingerprint = this.semanticService.generateSemanticFingerprint(text);

      res.json({
        success: true,
        text: text,
        fingerprint: fingerprint,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Fingerprint generation failed:', error.message);
      res.status(500).json({
        error: 'Failed to generate semantic fingerprint',
        details: error.message,
        code: 'FINGERPRINT_GENERATION_FAILED'
      });
    }
  }

  /**
   * Find semantic variants across all mutation families
   * POST /api/semantic/find-mutation-variants
   */
  async findMutationVariants(req, res) {
    try {
      const { text, options = {} } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Text parameter is required',
          code: 'MISSING_TEXT'
        });
      }

      const variants = await this.mutationService.findSemanticVariants(text, options);

      res.json({
        success: true,
        ...variants,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Mutation variant finding failed:', error.message);
      res.status(500).json({
        error: 'Failed to find mutation variants',
        details: error.message,
        code: 'MUTATION_VARIANT_FINDING_FAILED'
      });
    }
  }

  /**
   * Cluster all mutations by semantic similarity
   * GET /api/semantic/cluster-mutations
   */
  async clusterMutations(req, res) {
    try {
      const options = {
        threshold: parseFloat(req.query.threshold) || undefined,
        maxClusters: parseInt(req.query.maxClusters) || undefined
      };

      const clusters = await this.mutationService.clusterMutationsBySemantic(options);

      res.json({
        success: true,
        clusters_found: clusters.length,
        clusters: clusters,
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Mutation clustering failed:', error.message);
      res.status(500).json({
        error: 'Failed to cluster mutations',
        details: error.message,
        code: 'MUTATION_CLUSTERING_FAILED'
      });
    }
  }

  /**
   * Get semantic similarity service statistics
   * GET /api/semantic/stats
   */
  async getStats(req, res) {
    try {
      const cacheStats = this.semanticService.getCacheStats();
      const mutationStats = this.mutationService.getMutationStatistics();

      res.json({
        success: true,
        semantic_service: {
          cache_stats: cacheStats,
          threshold: this.semanticService.similarityThreshold,
          feature_weights: this.semanticService.featureWeights
        },
        mutation_service: mutationStats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Stats retrieval failed:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve statistics',
        details: error.message,
        code: 'STATS_RETRIEVAL_FAILED'
      });
    }
  }

  /**
   * Clear semantic similarity caches
   * POST /api/semantic/clear-cache
   */
  async clearCache(req, res) {
    try {
      this.semanticService.clearCaches();

      res.json({
        success: true,
        message: 'Semantic similarity caches cleared',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Cache clearing failed:', error.message);
      res.status(500).json({
        error: 'Failed to clear cache',
        details: error.message,
        code: 'CACHE_CLEARING_FAILED'
      });
    }
  }

  /**
   * Test semantic similarity engine with sample data
   * GET /api/semantic/test
   */
  async testEngine(req, res) {
    try {
      // Sample test data
      const testData = {
        original: 'Turmeric can cure COVID-19 completely in 3 days',
        variants: [
          'Turmeric completely cures coronavirus in just 3 days',
          'COVID-19 can be fully healed with turmeric in 72 hours'
        ],
        non_variants: [
          'The weather is nice today',
          'Bitcoin price is rising'
        ]
      };

      const results = {
        original: testData.original,
        variant_tests: [],
        non_variant_tests: []
      };

      // Test variants
      for (const variant of testData.variants) {
        const similarity = await this.semanticService.calculateSimilarity(testData.original, variant);
        results.variant_tests.push({
          text: variant,
          similarity: similarity.overall_similarity,
          is_variant: similarity.is_variant,
          confidence: similarity.confidence,
          primary_type: similarity.variant_analysis?.primary_type
        });
      }

      // Test non-variants
      for (const nonVariant of testData.non_variants) {
        const similarity = await this.semanticService.calculateSimilarity(testData.original, nonVariant);
        results.non_variant_tests.push({
          text: nonVariant,
          similarity: similarity.overall_similarity,
          is_variant: similarity.is_variant,
          confidence: similarity.confidence
        });
      }

      res.json({
        success: true,
        test_results: results,
        engine_status: 'operational',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Engine test failed:', error.message);
      res.status(500).json({
        error: 'Failed to test semantic similarity engine',
        details: error.message,
        code: 'ENGINE_TEST_FAILED'
      });
    }
  }
}

module.exports = SemanticSimilarityController;