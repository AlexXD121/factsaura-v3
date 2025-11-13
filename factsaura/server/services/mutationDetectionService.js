// Misinformation Mutation Detection Service
// Tracks how fake news evolves and mutates over time
const crypto = require('crypto');
const SemanticSimilarityService = require('./semanticSimilarityService');

class MutationDetectionService {
  constructor() {
    // Configuration for mutation detection
    this.similarityThreshold = parseFloat(process.env.MUTATION_SIMILARITY_THRESHOLD) || 0.75;
    this.mutationTimeWindow = parseInt(process.env.MUTATION_TIME_WINDOW) || 86400000; // 24 hours in ms
    this.maxMutationDepth = parseInt(process.env.MAX_MUTATION_DEPTH) || 10;
    
    // Initialize semantic similarity engine
    this.semanticSimilarity = new SemanticSimilarityService();
    
    // In-memory storage for mutations (in production, this would be in database)
    this.mutationFamilies = new Map(); // familyId -> family data
    this.contentHashes = new Map(); // contentHash -> mutation data
    this.semanticIndex = new Map(); // semantic fingerprint -> mutation IDs
    
    // Mutation pattern detection
    this.mutationPatterns = {
      // Common mutation types
      WORD_SUBSTITUTION: 'word_substitution',
      PHRASE_ADDITION: 'phrase_addition', 
      CONTEXT_SHIFT: 'context_shift',
      EMOTIONAL_AMPLIFICATION: 'emotional_amplification',
      SOURCE_MODIFICATION: 'source_modification',
      NUMERICAL_CHANGE: 'numerical_change',
      LOCATION_CHANGE: 'location_change',
      TIME_SHIFT: 'time_shift'
    };
    
    // Semantic similarity keywords for clustering
    this.semanticClusters = {
      medical: ['cure', 'treatment', 'vaccine', 'medicine', 'doctor', 'hospital', 'health'],
      disaster: ['flood', 'earthquake', 'emergency', 'evacuation', 'disaster', 'crisis'],
      financial: ['scam', 'money', 'investment', 'fraud', 'bank', 'payment', 'crypto'],
      political: ['government', 'election', 'vote', 'policy', 'politician', 'party'],
      conspiracy: ['cover-up', 'secret', 'hidden', 'conspiracy', 'truth', 'exposed']
    };
  }

  /**
   * Analyze content for mutations and track genealogy
   * @param {string} content - Content to analyze
   * @param {Object} metadata - Additional metadata (source, timestamp, etc.)
   * @returns {Promise<Object>} Mutation analysis result
   */
  async detectMutation(content, metadata = {}) {
    try {
      // Generate content fingerprints
      const contentHash = this._generateContentHash(content);
      const semanticFingerprint = this._generateSemanticFingerprint(content);
      
      // Check if this exact content already exists
      if (this.contentHashes.has(contentHash)) {
        return {
          is_mutation: false,
          mutation_type: 'EXACT_DUPLICATE',
          family_id: this.contentHashes.get(contentHash).family_id,
          confidence: 1.0,
          analysis: 'Exact duplicate content detected'
        };
      }
      
      // Find potential parent mutations using semantic similarity
      const potentialParents = await this._findPotentialParents(content, semanticFingerprint);
      
      if (potentialParents.length === 0) {
        // This is a new original misinformation - create new family
        return await this._createNewMutationFamily(content, contentHash, semanticFingerprint, metadata);
      }
      
      // Analyze mutations against potential parents
      const mutationAnalysis = await this._analyzeMutations(content, potentialParents);
      
      if (mutationAnalysis.is_mutation) {
        // Add to existing family as a mutation
        return await this._addMutationToFamily(
          content, 
          contentHash, 
          semanticFingerprint, 
          mutationAnalysis,
          metadata
        );
      }
      
      // Not similar enough to be a mutation - create new family
      return await this._createNewMutationFamily(content, contentHash, semanticFingerprint, metadata);
      
    } catch (error) {
      console.error('Mutation detection failed:', error.message);
      return {
        is_mutation: false,
        error: true,
        error_message: error.message,
        confidence: 0.0
      };
    }
  }

  /**
   * Get mutation family tree for a given content or family ID
   * @param {string} identifier - Content hash or family ID
   * @returns {Object} Family tree structure
   */
  getMutationFamily(identifier) {
    try {
      let familyId;
      
      // Check if identifier is a content hash
      if (this.contentHashes.has(identifier)) {
        familyId = this.contentHashes.get(identifier).family_id;
      } else {
        // Assume it's a family ID
        familyId = identifier;
      }
      
      const family = this.mutationFamilies.get(familyId);
      if (!family) {
        return {
          found: false,
          error: 'Family not found'
        };
      }
      
      return {
        found: true,
        family_id: familyId,
        original_content: family.original.content,
        creation_date: family.creation_date,
        mutation_count: family.mutations.length,
        mutation_tree: this._buildMutationTree(family),
        mutation_timeline: this._buildMutationTimeline(family),
        spread_analysis: this._analyzeMutationSpread(family)
      };
      
    } catch (error) {
      console.error('Failed to get mutation family:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Predict potential future mutations based on advanced pattern analysis
   * @param {string} familyId - Family ID to analyze
   * @returns {Object} Advanced mutation predictions with detailed analysis
   */
  predictMutations(familyId) {
    try {
      const family = this.mutationFamilies.get(familyId);
      if (!family) {
        return {
          predictions: [],
          error: 'Family not found'
        };
      }
      
      // Analyze mutation patterns in the family using advanced analysis
      const patterns = this._analyzeMutationPatterns(family);
      
      // Generate sophisticated predictions based on pattern analysis
      const predictions = [];
      
      // 1. VELOCITY-BASED PREDICTIONS
      if (patterns.mutation_velocity && patterns.mutation_velocity.velocity > 0.1) {
        const nextMutationTime = this._predictNextMutationTime(patterns.mutation_velocity);
        const isAccelerating = patterns.mutation_velocity.trend === 'accelerating';
        predictions.push({
          type: 'VELOCITY_ACCELERATION',
          category: 'temporal',
          probability: isAccelerating ? 0.85 : 0.65,
          predicted_timing: nextMutationTime,
          predicted_content: this._generateVelocityBasedMutation(family.original.content, patterns),
          reasoning: `Mutation velocity detected (${patterns.mutation_velocity.velocity.toFixed(2)}/hour, trend: ${patterns.mutation_velocity.trend}). Next mutation predicted within ${nextMutationTime.hours.toFixed(1)} hours.`,
          confidence_factors: isAccelerating ? ['high_velocity', 'acceleration_trend', 'recent_activity'] : ['moderate_velocity', 'pattern_detected']
        });
      }

      // 2. PATTERN EVOLUTION PREDICTIONS
      if (patterns.pattern_evolution && patterns.pattern_evolution.pattern_shift) {
        const nextEvolutionType = this._predictPatternEvolution(patterns.pattern_evolution);
        predictions.push({
          type: 'PATTERN_EVOLUTION',
          category: 'structural',
          probability: 0.75,
          predicted_mutation_type: nextEvolutionType.type,
          predicted_content: this._generateEvolutionBasedMutation(family.original.content, nextEvolutionType),
          reasoning: `Pattern evolution detected: ${patterns.pattern_evolution.early_dominant} → ${patterns.pattern_evolution.late_dominant}. Next evolution: ${nextEvolutionType.type}`,
          confidence_factors: ['pattern_shift_detected', 'evolution_trend', 'historical_progression']
        });
      }

      // 3. VIRALITY-DRIVEN PREDICTIONS
      if (patterns.virality_indicators && patterns.virality_indicators.viral_potential === 'high') {
        predictions.push({
          type: 'VIRAL_AMPLIFICATION',
          category: 'engagement',
          probability: 0.9,
          predicted_content: this._generateViralityBasedMutation(family.original.content, patterns.virality_indicators),
          reasoning: `High viral potential detected (score: ${patterns.virality_indicators.average_viral_score.toFixed(3)}). Trend: ${patterns.virality_indicators.virality_trend}`,
          viral_enhancement: {
            urgency_amplification: true,
            emotional_intensification: true,
            shareability_optimization: true
          },
          confidence_factors: ['high_viral_score', 'viral_trend', 'emotional_escalation']
        });
      }

      // 4. AUDIENCE TARGETING PREDICTIONS
      if (patterns.target_audience_shifts && patterns.target_audience_shifts.targeting_diversity.diversity_score >= 0.3) {
        const nextTargetAudience = this._predictNextTargetAudience(patterns.target_audience_shifts);
        predictions.push({
          type: 'AUDIENCE_TARGETING',
          category: 'demographic',
          probability: patterns.target_audience_shifts.targeting_diversity.diversity_score > 0.5 ? 0.7 : 0.55,
          target_audience: nextTargetAudience.audience,
          predicted_content: this._generateAudienceTargetedMutation(family.original.content, nextTargetAudience),
          reasoning: `Audience diversification detected (${patterns.target_audience_shifts.targeting_diversity.unique_audiences} audiences targeted). Next target: ${nextTargetAudience.audience}`,
          targeting_strategy: nextTargetAudience.strategy,
          confidence_factors: ['audience_diversity', 'targeting_pattern', 'demographic_analysis']
        });
      }

      // 5. GEOGRAPHICAL SPREAD PREDICTIONS
      if (patterns.geographical_spread && patterns.geographical_spread.spread_pattern !== 'localized') {
        const nextLocation = this._predictGeographicalSpread(patterns.geographical_spread);
        predictions.push({
          type: 'GEOGRAPHICAL_EXPANSION',
          category: 'location',
          probability: 0.8,
          target_location: nextLocation.location,
          predicted_content: this._generateGeographicalMutation(family.original.content, nextLocation),
          reasoning: `Geographical spread pattern: ${patterns.geographical_spread.spread_pattern}. Localization trend: ${patterns.geographical_spread.localization_trend}`,
          expansion_strategy: nextLocation.strategy,
          confidence_factors: ['spread_pattern', 'localization_trend', 'geographical_analysis']
        });
      }

      // 6. PLATFORM ADAPTATION PREDICTIONS
      if (patterns.cross_platform_adaptation && patterns.cross_platform_adaptation.adaptation_patterns.adaptation_score >= 0.1) {
        const nextPlatform = this._predictPlatformAdaptation(patterns.cross_platform_adaptation);
        predictions.push({
          type: 'PLATFORM_OPTIMIZATION',
          category: 'format',
          probability: patterns.cross_platform_adaptation.adaptation_patterns.adaptation_score > 0.3 ? 0.65 : 0.45,
          target_platform: nextPlatform.platform,
          predicted_content: this._generatePlatformOptimizedMutation(family.original.content, nextPlatform),
          reasoning: `Cross-platform adaptation detected (score: ${patterns.cross_platform_adaptation.adaptation_patterns.adaptation_score.toFixed(2)}). Next platform: ${nextPlatform.platform}`,
          format_optimizations: nextPlatform.optimizations,
          confidence_factors: ['adaptation_score', 'platform_diversity', 'format_evolution']
        });
      }

      // 7. SEMANTIC DRIFT PREDICTIONS
      if (patterns.semantic_drift && patterns.semantic_drift.drift_trend === 'increasing_drift') {
        predictions.push({
          type: 'SEMANTIC_MUTATION',
          category: 'content',
          probability: 0.6,
          predicted_content: this._generateSemanticDriftMutation(family.original.content, patterns.semantic_drift),
          reasoning: `Semantic drift increasing (avg: ${patterns.semantic_drift.average_drift.toFixed(2)}, max: ${patterns.semantic_drift.max_drift.toFixed(2)}). Stability: ${patterns.semantic_drift.semantic_stability}`,
          drift_analysis: {
            current_drift: patterns.semantic_drift.average_drift,
            predicted_drift: patterns.semantic_drift.average_drift * 1.3,
            stability_risk: patterns.semantic_drift.semantic_stability
          },
          confidence_factors: ['drift_trend', 'semantic_analysis', 'content_evolution']
        });
      }

      // 8. COMPLEXITY EVOLUTION PREDICTIONS
      if (patterns.complexity_evolution && patterns.complexity_evolution.complexity_trend !== 'stable_complexity') {
        const complexityPrediction = this._predictComplexityEvolution(patterns.complexity_evolution);
        predictions.push({
          type: 'COMPLEXITY_SHIFT',
          category: 'structure',
          probability: 0.55,
          predicted_content: this._generateComplexityBasedMutation(family.original.content, complexityPrediction),
          reasoning: `Complexity trend: ${patterns.complexity_evolution.complexity_trend}. Simplification tendency: ${patterns.complexity_evolution.simplification_tendency}`,
          complexity_prediction: complexityPrediction,
          confidence_factors: ['complexity_trend', 'simplification_pattern', 'structural_analysis']
        });
      }

      // Calculate overall prediction confidence using advanced analysis
      const predictionConfidence = this._calculatePredictionConfidence(patterns);

      // 9. PATTERN INTENSIFICATION PREDICTIONS (always generate if mutations exist)
      if (patterns.total_mutations > 0) {
        const dominantPattern = this._identifyDominantMutationPattern(patterns);
        predictions.push({
          type: 'PATTERN_INTENSIFICATION',
          category: 'behavioral',
          probability: 0.6,
          predicted_pattern: dominantPattern.type,
          predicted_content: this._generatePatternIntensificationMutation(family.original.content, dominantPattern),
          reasoning: `Dominant pattern identified: ${dominantPattern.type} (${dominantPattern.count}/${patterns.total_mutations} mutations). Intensification likely.`,
          intensification_strategy: dominantPattern.strategy,
          confidence_factors: ['pattern_dominance', 'historical_data', 'behavioral_analysis']
        });
      }

      // Sort predictions by probability (highest first)
      predictions.sort((a, b) => b.probability - a.probability);

      return {
        family_id: familyId,
        predictions: predictions,
        prediction_summary: {
          total_predictions: predictions.length,
          high_probability_predictions: predictions.filter(p => p.probability >= 0.8).length,
          prediction_categories: [...new Set(predictions.map(p => p.category))],
          dominant_prediction_type: predictions[0]?.type || 'none'
        },
        confidence: predictionConfidence.confidence,
        confidence_analysis: predictionConfidence.confidence_factors,
        pattern_analysis: {
          mutation_velocity: patterns.mutation_velocity,
          pattern_evolution: patterns.pattern_evolution,
          virality_indicators: patterns.virality_indicators,
          semantic_drift: patterns.semantic_drift,
          geographical_spread: patterns.geographical_spread
        },
        analysis_date: new Date().toISOString(),
        next_analysis_recommended: this._calculateNextAnalysisTime(patterns)
      };
      
    } catch (error) {
      console.error('Advanced mutation prediction failed:', error.message);
      return {
        predictions: [],
        error: error.message,
        error_details: {
          family_id: familyId,
          error_type: 'prediction_engine_failure',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Find semantic variants of given content across all mutation families
   * @param {string} content - Content to find variants for
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of semantic variants with detailed analysis
   */
  async findSemanticVariants(content, options = {}) {
    try {
      const variants = [];
      const minSimilarity = options.minSimilarity || 0.6; // Lower threshold for variant detection
      const maxResults = options.maxResults || 20;
      const includeAnalysis = options.includeAnalysis !== false;
      
      // Collect all content from mutation families
      const allContent = [];
      
      // Add original content from all families
      for (const [familyId, family] of this.mutationFamilies) {
        allContent.push({
          content: family.original.content,
          content_hash: family.original.content_hash,
          family_id: familyId,
          type: 'original',
          timestamp: family.original.timestamp,
          metadata: family.original.metadata
        });
        
        // Add all mutations
        family.mutations.forEach(mutation => {
          allContent.push({
            content: mutation.content,
            content_hash: mutation.content_hash,
            family_id: familyId,
            mutation_id: mutation.mutation_id,
            type: 'mutation',
            mutation_type: mutation.mutation_type,
            generation: mutation.generation,
            timestamp: mutation.timestamp,
            metadata: mutation.metadata
          });
        });
      }
      
      // Use semantic similarity service to find variants
      const semanticVariants = await this.semanticSimilarity.findVariants(content, allContent, {
        minSimilarity: minSimilarity,
        maxResults: maxResults
      });
      
      // Enhance results with mutation family context
      for (const variant of semanticVariants) {
        const family = this.mutationFamilies.get(variant.family_id);
        if (family) {
          variants.push({
            ...variant,
            family_context: {
              family_id: variant.family_id,
              creation_date: family.creation_date,
              semantic_cluster: family.semantic_cluster,
              total_mutations: family.mutations.length,
              mutation_tree: includeAnalysis ? this._buildMutationTree(family) : null
            },
            variant_relationship: this._analyzeVariantRelationship(content, variant, family)
          });
        }
      }
      
      return {
        query_content: content,
        total_variants_found: variants.length,
        variants: variants,
        search_options: options,
        analysis_timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Semantic variant search failed:', error.message);
      return {
        query_content: content,
        total_variants_found: 0,
        variants: [],
        error: error.message
      };
    }
  }

  /**
   * Cluster all mutation content by semantic similarity
   * @param {Object} options - Clustering options
   * @returns {Promise<Array>} Array of semantic clusters
   */
  async clusterMutationsBySemantic(options = {}) {
    try {
      // Collect all content
      const allContent = [];
      
      for (const [familyId, family] of this.mutationFamilies) {
        allContent.push({
          content: family.original.content,
          family_id: familyId,
          type: 'original',
          hash: family.original.content_hash
        });
        
        family.mutations.forEach(mutation => {
          allContent.push({
            content: mutation.content,
            family_id: familyId,
            type: 'mutation',
            mutation_id: mutation.mutation_id,
            hash: mutation.content_hash
          });
        });
      }
      
      // Use semantic similarity service for clustering
      const clusters = await this.semanticSimilarity.clusterSimilarTexts(allContent, options);
      
      // Enhance clusters with mutation context
      return clusters.map(cluster => ({
        ...cluster,
        mutation_families_involved: [...new Set(cluster.members.map(m => m.family_id))],
        cross_family_variants: cluster.members.filter(m => 
          m.family_id !== cluster.representative_text.family_id
        ).length,
        semantic_analysis: {
          dominant_domain: this._identifyClusterDomain(cluster.members),
          mutation_patterns: this._analyzeClusterMutationPatterns(cluster.members)
        }
      }));
      
    } catch (error) {
      console.error('Semantic clustering failed:', error.message);
      return [];
    }
  }

  /**
   * Generate semantic fingerprint for content using advanced engine
   * @param {string} content - Content to generate fingerprint for
   * @returns {Object} Advanced semantic fingerprint
   */
  generateAdvancedSemanticFingerprint(content) {
    try {
      const basicFingerprint = this._generateSemanticFingerprint(content);
      const advancedFingerprint = this.semanticSimilarity.generateSemanticFingerprint(content);
      
      return {
        basic_fingerprint: basicFingerprint,
        advanced_fingerprint: advancedFingerprint,
        combined_hash: crypto.createHash('sha256')
          .update(basicFingerprint + advancedFingerprint.combined_hash)
          .digest('hex')
      };
      
    } catch (error) {
      console.error('Advanced fingerprint generation failed:', error.message);
      return {
        basic_fingerprint: this._generateSemanticFingerprint(content),
        error: error.message
      };
    }
  }

  /**
   * Analyze variant relationship between query and found variant
   * @private
   */
  _analyzeVariantRelationship(queryContent, variant, family) {
    const relationship = {
      relationship_type: 'unknown',
      confidence: variant.confidence,
      generation_distance: 0,
      mutation_path: []
    };
    
    if (variant.type === 'original') {
      relationship.relationship_type = 'original_variant';
      relationship.generation_distance = 0;
    } else if (variant.type === 'mutation') {
      relationship.relationship_type = 'mutation_variant';
      relationship.generation_distance = variant.generation || 1;
      
      // Try to trace mutation path
      const mutationPath = this._traceMutationPath(variant.content_hash, family);
      relationship.mutation_path = mutationPath;
    }
    
    return relationship;
  }

  /**
   * Trace mutation path from original to specific mutation
   * @private
   */
  _traceMutationPath(targetHash, family) {
    const path = [];
    
    // Start from target and work backwards
    let currentHash = targetHash;
    const visited = new Set();
    
    while (currentHash && !visited.has(currentHash)) {
      visited.add(currentHash);
      
      if (currentHash === family.original.content_hash) {
        path.unshift({
          type: 'original',
          hash: currentHash,
          content: family.original.content
        });
        break;
      }
      
      const mutation = family.mutations.find(m => m.content_hash === currentHash);
      if (mutation) {
        path.unshift({
          type: 'mutation',
          hash: currentHash,
          mutation_type: mutation.mutation_type,
          generation: mutation.generation
        });
        currentHash = mutation.parent_hash;
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Identify dominant domain in cluster
   * @private
   */
  _identifyClusterDomain(members) {
    const domainCounts = {};
    
    members.forEach(member => {
      const domain = this._determineSemanticCluster(member.content);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    
    return Object.keys(domainCounts).reduce((a, b) => 
      domainCounts[a] > domainCounts[b] ? a : b
    );
  }

  /**
   * Analyze mutation patterns in cluster
   * @private
   */
  _analyzeClusterMutationPatterns(members) {
    const patterns = {};
    
    members.forEach(member => {
      if (member.type === 'mutation' && member.mutation_type) {
        patterns[member.mutation_type] = (patterns[member.mutation_type] || 0) + 1;
      }
    });
    
    return patterns;
  }

  /**
   * Get mutation statistics and trends
   * @returns {Object} Comprehensive mutation statistics
   */
  getMutationStatistics() {
    try {
      const stats = {
        total_families: this.mutationFamilies.size,
        total_mutations: 0,
        active_families: 0,
        mutation_types: {},
        semantic_clusters: {},
        recent_activity: []
      };
      
      const now = Date.now();
      const recentWindow = 24 * 60 * 60 * 1000; // 24 hours
      
      // Analyze each family
      for (const [familyId, family] of this.mutationFamilies) {
        stats.total_mutations += family.mutations.length;
        
        // Check if family is active (mutations in last 24 hours)
        const recentMutations = family.mutations.filter(m => 
          now - new Date(m.timestamp).getTime() < recentWindow
        );
        
        if (recentMutations.length > 0) {
          stats.active_families++;
          stats.recent_activity.push({
            family_id: familyId,
            recent_mutations: recentMutations.length,
            latest_mutation: recentMutations[recentMutations.length - 1].timestamp
          });
        }
        
        // Count mutation types
        family.mutations.forEach(mutation => {
          const type = mutation.mutation_type;
          stats.mutation_types[type] = (stats.mutation_types[type] || 0) + 1;
        });
        
        // Count semantic clusters
        const cluster = family.semantic_cluster;
        stats.semantic_clusters[cluster] = (stats.semantic_clusters[cluster] || 0) + 1;
      }
      
      // Sort recent activity by latest mutation
      stats.recent_activity.sort((a, b) => 
        new Date(b.latest_mutation) - new Date(a.latest_mutation)
      );
      
      return stats;
      
    } catch (error) {
      console.error('Failed to get mutation statistics:', error.message);
      return {
        error: error.message,
        total_families: 0,
        total_mutations: 0
      };
    }
  }

  /**
   * Generate content hash for exact duplicate detection
   * @private
   */
  _generateContentHash(content) {
    // Normalize content for hashing
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Generate semantic fingerprint for similarity detection
   * @private
   */
  _generateSemanticFingerprint(content) {
    // Extract key semantic elements
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Create fingerprint based on significant words
    const significantWords = words.filter(word => 
      word.length > 3 && 
      !this._isStopWord(word)
    );
    
    // Sort and create fingerprint
    const fingerprint = significantWords
      .sort()
      .slice(0, 20) // Top 20 significant words
      .join('|');
    
    return crypto.createHash('md5').update(fingerprint).digest('hex');
  }

  /**
   * Check if word is a stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
    
    return stopWords.has(word);
  }

  /**
   * Find potential parent mutations using advanced semantic similarity
   * @private
   */
  async _findPotentialParents(content, semanticFingerprint) {
    const potentialParents = [];
    
    // Check against existing content using advanced semantic similarity
    for (const [hash, mutationData] of this.contentHashes) {
      try {
        const similarityAnalysis = await this.semanticSimilarity.calculateSimilarity(content, mutationData.content);
        
        if (similarityAnalysis.is_variant && similarityAnalysis.overall_similarity >= this.similarityThreshold) {
          potentialParents.push({
            ...mutationData,
            similarity_score: similarityAnalysis.overall_similarity,
            similarity_analysis: similarityAnalysis,
            variant_type: similarityAnalysis.variant_analysis.primary_type
          });
        }
      } catch (error) {
        console.error(`Similarity calculation failed for ${hash}:`, error.message);
        // Fallback to basic similarity
        const basicSimilarity = this._calculateSemanticSimilarity(content, mutationData.content);
        if (basicSimilarity >= this.similarityThreshold) {
          potentialParents.push({
            ...mutationData,
            similarity_score: basicSimilarity,
            similarity_analysis: { overall_similarity: basicSimilarity, is_variant: true },
            variant_type: 'BASIC_SIMILARITY'
          });
        }
      }
    }
    
    // Sort by similarity score (highest first)
    return potentialParents.sort((a, b) => b.similarity_score - a.similarity_score);
  }

  /**
   * Calculate semantic similarity between two pieces of content
   * @private
   */
  _calculateSemanticSimilarity(content1, content2) {
    const words1 = new Set(content1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(content2.toLowerCase().match(/\b\w+\b/g) || []);
    
    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Boost similarity for semantic clusters
    let semanticBoost = 0;
    for (const [cluster, keywords] of Object.entries(this.semanticClusters)) {
      const cluster1 = keywords.filter(keyword => words1.has(keyword)).length;
      const cluster2 = keywords.filter(keyword => words2.has(keyword)).length;
      
      if (cluster1 > 0 && cluster2 > 0) {
        semanticBoost += 0.1; // Boost for shared semantic cluster
      }
    }
    
    return Math.min(1.0, jaccardSimilarity + semanticBoost);
  }

  /**
   * Analyze mutations against potential parents using advanced semantic analysis
   * @private
   */
  async _analyzeMutations(content, potentialParents) {
    if (potentialParents.length === 0) {
      return { is_mutation: false };
    }
    
    const bestParent = potentialParents[0];
    
    // Use advanced mutation type identification if available
    let mutationType = bestParent.variant_type || this._identifyMutationType(content, bestParent.content);
    
    // Enhanced mutation analysis using semantic similarity breakdown
    const enhancedAnalysis = bestParent.similarity_analysis ? {
      semantic_breakdown: bestParent.similarity_analysis.breakdown,
      variant_analysis: bestParent.similarity_analysis.variant_analysis,
      mutation_patterns: bestParent.similarity_analysis.variant_analysis?.mutation_patterns || []
    } : {};
    
    return {
      is_mutation: true,
      parent_hash: bestParent.content_hash,
      parent_family_id: bestParent.family_id,
      mutation_type: mutationType,
      similarity_score: bestParent.similarity_score,
      confidence: bestParent.similarity_score,
      mutation_analysis: {
        ...this._analyzeMutationChanges(content, bestParent.content),
        ...enhancedAnalysis
      }
    };
  }

  /**
   * Identify the type of mutation between parent and child content
   * @private
   */
  _identifyMutationType(childContent, parentContent) {
    const childWords = childContent.toLowerCase().match(/\b\w+\b/g) || [];
    const parentWords = parentContent.toLowerCase().match(/\b\w+\b/g) || [];
    const childLower = childContent.toLowerCase();
    const parentLower = parentContent.toLowerCase();
    
    // Check for numerical changes (highest priority)
    const childNumbers = childContent.match(/\d+/g) || [];
    const parentNumbers = parentContent.match(/\d+/g) || [];
    if (childNumbers.length !== parentNumbers.length || 
        !childNumbers.every((num, i) => num === parentNumbers[i])) {
      return this.mutationPatterns.NUMERICAL_CHANGE;
    }
    
    // Check for emotional amplification (high priority)
    const emotionalWords = ['urgent', 'critical', 'dangerous', 'shocking', 'breaking', 'alert', 'warning', 'emergency'];
    const childEmotional = emotionalWords.filter(word => childLower.includes(word)).length;
    const parentEmotional = emotionalWords.filter(word => parentLower.includes(word)).length;
    if (childEmotional > parentEmotional) {
      return this.mutationPatterns.EMOTIONAL_AMPLIFICATION;
    }
    
    // Check for location changes
    const locationWords = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'india', 'city', 'state', 'country'];
    const childLocations = locationWords.filter(word => childLower.includes(word)).length;
    const parentLocations = locationWords.filter(word => parentLower.includes(word)).length;
    if (childLocations !== parentLocations) {
      return this.mutationPatterns.LOCATION_CHANGE;
    }
    
    // Check for time-related changes
    const timeWords = ['hours', 'days', 'minutes', 'weeks', 'months', 'years', 'today', 'tomorrow', 'yesterday'];
    const childTime = timeWords.filter(word => childLower.includes(word)).length;
    const parentTime = timeWords.filter(word => parentLower.includes(word)).length;
    if (childTime !== parentTime) {
      return this.mutationPatterns.TIME_SHIFT;
    }
    
    // Check for source modification
    const sourceWords = ['doctors', 'experts', 'scientists', 'researchers', 'officials', 'authorities'];
    const childSources = sourceWords.filter(word => childLower.includes(word)).length;
    const parentSources = sourceWords.filter(word => parentLower.includes(word)).length;
    if (childSources !== parentSources) {
      return this.mutationPatterns.SOURCE_MODIFICATION;
    }
    
    // Check for phrase addition (significant length increase)
    if (childWords.length > parentWords.length * 1.3) {
      return this.mutationPatterns.PHRASE_ADDITION;
    }
    
    // Check for word substitution (high similarity but some changes)
    const commonWords = childWords.filter(word => parentWords.includes(word));
    const similarity = commonWords.length / Math.max(childWords.length, parentWords.length);
    if (similarity > 0.7 && similarity < 0.95) {
      return this.mutationPatterns.WORD_SUBSTITUTION;
    }
    
    // Default to context shift
    return this.mutationPatterns.CONTEXT_SHIFT;
  }

  /**
   * Analyze specific changes between parent and child content
   * @private
   */
  _analyzeMutationChanges(childContent, parentContent) {
    return {
      length_change: childContent.length - parentContent.length,
      word_count_change: (childContent.match(/\b\w+\b/g) || []).length - 
                        (parentContent.match(/\b\w+\b/g) || []).length,
      added_words: this._findAddedWords(childContent, parentContent),
      removed_words: this._findRemovedWords(childContent, parentContent),
      changed_numbers: this._findChangedNumbers(childContent, parentContent)
    };
  }

  /**
   * Find words added in mutation
   * @private
   */
  _findAddedWords(childContent, parentContent) {
    const childWords = new Set(childContent.toLowerCase().match(/\b\w+\b/g) || []);
    const parentWords = new Set(parentContent.toLowerCase().match(/\b\w+\b/g) || []);
    
    return [...childWords].filter(word => !parentWords.has(word));
  }

  /**
   * Find words removed in mutation
   * @private
   */
  _findRemovedWords(childContent, parentContent) {
    const childWords = new Set(childContent.toLowerCase().match(/\b\w+\b/g) || []);
    const parentWords = new Set(parentContent.toLowerCase().match(/\b\w+\b/g) || []);
    
    return [...parentWords].filter(word => !childWords.has(word));
  }

  /**
   * Find changed numbers in mutation
   * @private
   */
  _findChangedNumbers(childContent, parentContent) {
    const childNumbers = childContent.match(/\d+/g) || [];
    const parentNumbers = parentContent.match(/\d+/g) || [];
    
    const changes = [];
    const maxLength = Math.max(childNumbers.length, parentNumbers.length);
    
    for (let i = 0; i < maxLength; i++) {
      const childNum = childNumbers[i];
      const parentNum = parentNumbers[i];
      
      if (childNum !== parentNum) {
        changes.push({
          from: parentNum || null,
          to: childNum || null,
          position: i
        });
      }
    }
    
    return changes;
  }

  /**
   * Create new mutation family for original misinformation
   * @private
   */
  async _createNewMutationFamily(content, contentHash, semanticFingerprint, metadata) {
    const familyId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Determine semantic cluster
    const semanticCluster = this._determineSemanticCluster(content);
    
    const family = {
      family_id: familyId,
      creation_date: timestamp,
      semantic_cluster: semanticCluster,
      original: {
        content: content,
        content_hash: contentHash,
        semantic_fingerprint: semanticFingerprint,
        timestamp: timestamp,
        metadata: metadata
      },
      mutations: []
    };
    
    // Store family and content mapping
    this.mutationFamilies.set(familyId, family);
    this.contentHashes.set(contentHash, {
      family_id: familyId,
      content: content,
      content_hash: contentHash,
      is_original: true,
      timestamp: timestamp
    });
    
    // Index semantic fingerprint
    if (!this.semanticIndex.has(semanticFingerprint)) {
      this.semanticIndex.set(semanticFingerprint, []);
    }
    this.semanticIndex.get(semanticFingerprint).push(contentHash);
    
    return {
      is_mutation: false,
      is_original: true,
      family_id: familyId,
      confidence: 1.0,
      semantic_cluster: semanticCluster,
      analysis: 'New misinformation family created'
    };
  }

  /**
   * Add mutation to existing family
   * @private
   */
  async _addMutationToFamily(content, contentHash, semanticFingerprint, mutationAnalysis, metadata) {
    const familyId = mutationAnalysis.parent_family_id;
    const family = this.mutationFamilies.get(familyId);
    
    if (!family) {
      throw new Error('Parent family not found');
    }
    
    const timestamp = new Date().toISOString();
    const mutationId = crypto.randomUUID();
    
    const mutation = {
      mutation_id: mutationId,
      content: content,
      content_hash: contentHash,
      semantic_fingerprint: semanticFingerprint,
      parent_hash: mutationAnalysis.parent_hash,
      mutation_type: mutationAnalysis.mutation_type,
      similarity_score: mutationAnalysis.similarity_score,
      mutation_analysis: mutationAnalysis.mutation_analysis,
      timestamp: timestamp,
      metadata: metadata,
      generation: this._calculateGeneration(family, mutationAnalysis.parent_hash)
    };
    
    // Add mutation to family
    family.mutations.push(mutation);
    
    // Store content mapping
    this.contentHashes.set(contentHash, {
      family_id: familyId,
      content: content,
      content_hash: contentHash,
      is_original: false,
      mutation_id: mutationId,
      timestamp: timestamp
    });
    
    // Index semantic fingerprint
    if (!this.semanticIndex.has(semanticFingerprint)) {
      this.semanticIndex.set(semanticFingerprint, []);
    }
    this.semanticIndex.get(semanticFingerprint).push(contentHash);
    
    return {
      is_mutation: true,
      family_id: familyId,
      mutation_id: mutationId,
      mutation_type: mutationAnalysis.mutation_type,
      confidence: mutationAnalysis.confidence,
      generation: mutation.generation,
      analysis: `Mutation detected: ${mutationAnalysis.mutation_type}`
    };
  }

  /**
   * Calculate generation number for mutation
   * @private
   */
  _calculateGeneration(family, parentHash) {
    if (parentHash === family.original.content_hash) {
      return 1; // Direct child of original
    }
    
    // Find parent mutation and add 1 to its generation
    const parentMutation = family.mutations.find(m => m.content_hash === parentHash);
    return parentMutation ? parentMutation.generation + 1 : 1;
  }

  /**
   * Determine semantic cluster for content
   * @private
   */
  _determineSemanticCluster(content) {
    const words = new Set(content.toLowerCase().match(/\b\w+\b/g) || []);
    
    let bestCluster = 'general';
    let bestScore = 0;
    
    for (const [cluster, keywords] of Object.entries(this.semanticClusters)) {
      const matches = keywords.filter(keyword => words.has(keyword)).length;
      const score = matches / keywords.length;
      
      if (score > bestScore) {
        bestScore = score;
        bestCluster = cluster;
      }
    }
    
    return bestCluster;
  }

  /**
   * Build mutation tree structure
   * @private
   */
  _buildMutationTree(family) {
    const tree = {
      original: {
        content: family.original.content,
        hash: family.original.content_hash,
        timestamp: family.original.timestamp,
        children: []
      }
    };
    
    // Build tree recursively
    this._addChildrenToNode(tree.original, family, family.original.content_hash);
    
    return tree;
  }

  /**
   * Add children to tree node recursively
   * @private
   */
  _addChildrenToNode(node, family, parentHash) {
    const children = family.mutations.filter(m => m.parent_hash === parentHash);
    
    children.forEach(child => {
      const childNode = {
        content: child.content,
        hash: child.content_hash,
        mutation_type: child.mutation_type,
        timestamp: child.timestamp,
        generation: child.generation,
        children: []
      };
      
      node.children.push(childNode);
      
      // Recursively add grandchildren
      this._addChildrenToNode(childNode, family, child.content_hash);
    });
  }

  /**
   * Build mutation timeline
   * @private
   */
  _buildMutationTimeline(family) {
    const timeline = [
      {
        timestamp: family.original.timestamp,
        type: 'ORIGINAL',
        content: family.original.content,
        hash: family.original.content_hash
      }
    ];
    
    // Add mutations sorted by timestamp
    family.mutations
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(mutation => {
        timeline.push({
          timestamp: mutation.timestamp,
          type: 'MUTATION',
          mutation_type: mutation.mutation_type,
          content: mutation.content,
          hash: mutation.content_hash,
          generation: mutation.generation
        });
      });
    
    return timeline;
  }

  /**
   * Analyze mutation spread patterns
   * @private
   */
  _analyzeMutationSpread(family) {
    const now = Date.now();
    const mutations = family.mutations;
    
    if (mutations.length === 0) {
      return {
        spread_rate: 0,
        active_branches: 0,
        mutation_velocity: 0
      };
    }
    
    // Calculate spread rate (mutations per hour)
    const firstMutation = new Date(mutations[0].timestamp);
    const lastMutation = new Date(mutations[mutations.length - 1].timestamp);
    const timeSpanHours = (lastMutation - firstMutation) / (1000 * 60 * 60);
    const spreadRate = timeSpanHours > 0 ? mutations.length / timeSpanHours : 0;
    
    // Count active branches (mutations in last 24 hours)
    const recentWindow = 24 * 60 * 60 * 1000;
    const activeBranches = mutations.filter(m => 
      now - new Date(m.timestamp).getTime() < recentWindow
    ).length;
    
    // Calculate mutation velocity (recent mutations per hour)
    const recentMutations = mutations.filter(m => 
      now - new Date(m.timestamp).getTime() < recentWindow
    );
    const mutationVelocity = recentMutations.length / 24; // per hour in last 24h
    
    return {
      spread_rate: spreadRate,
      active_branches: activeBranches,
      mutation_velocity: mutationVelocity,
      total_generations: Math.max(...mutations.map(m => m.generation), 0),
      mutation_types: this._countMutationTypes(mutations)
    };
  }

  /**
   * Count mutation types in family
   * @private
   */
  _countMutationTypes(mutations) {
    const counts = {};
    mutations.forEach(mutation => {
      const type = mutation.mutation_type;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Analyze mutation patterns for prediction using advanced pattern analysis
   * @private
   */
  _analyzeMutationPatterns(family) {
    const mutations = family.mutations;
    
    // Basic pattern counts
    const basicPatterns = {
      location_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.LOCATION_CHANGE
      ).length,
      numerical_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.NUMERICAL_CHANGE
      ).length,
      emotional_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.EMOTIONAL_AMPLIFICATION
      ).length,
      word_substitution_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.WORD_SUBSTITUTION
      ).length,
      phrase_addition_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.PHRASE_ADDITION
      ).length,
      context_shift_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.CONTEXT_SHIFT
      ).length,
      source_modification_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.SOURCE_MODIFICATION
      ).length,
      time_shift_mutations: mutations.filter(m => 
        m.mutation_type === this.mutationPatterns.TIME_SHIFT
      ).length,
      total_mutations: mutations.length
    };

    // Advanced pattern analysis
    const advancedPatterns = {
      ...basicPatterns,
      recent_trend: this._calculateRecentTrend(mutations),
      mutation_velocity: this._calculateMutationVelocity(mutations),
      pattern_evolution: this._analyzePatternEvolution(mutations),
      semantic_drift: this._analyzeSemanticDrift(family, mutations),
      virality_indicators: this._analyzeViralityIndicators(mutations),
      target_audience_shifts: this._analyzeTargetAudienceShifts(mutations),
      geographical_spread: this._analyzeGeographicalSpread(mutations),
      temporal_patterns: this._analyzeTemporalPatterns(mutations),
      complexity_evolution: this._analyzeComplexityEvolution(family.original, mutations),
      cross_platform_adaptation: this._analyzeCrossPlatformAdaptation(mutations)
    };

    return advancedPatterns;
  }

  /**
   * Calculate recent mutation trend
   * @private
   */
  _calculateRecentTrend(mutations) {
    const now = Date.now();
    const recentWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    const recentMutations = mutations.filter(m => 
      now - new Date(m.timestamp).getTime() < recentWindow
    );
    
    return {
      recent_count: recentMutations.length,
      trend: recentMutations.length > 0 ? 'increasing' : 'stable'
    };
  }

  /**
   * Generate location-based mutation prediction
   * @private
   */
  _generateLocationMutation(originalContent) {
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Simple location substitution
    return originalContent.replace(/\b(in|at|from)\s+\w+/gi, `$1 ${randomLocation}`);
  }

  /**
   * Generate numerical escalation mutation
   * @private
   */
  _generateNumericalMutation(originalContent) {
    return originalContent.replace(/\d+/g, (match) => {
      const num = parseInt(match);
      return Math.floor(num * (1.5 + Math.random())); // Escalate by 50-250%
    });
  }

  /**
   * Generate emotional amplification mutation
   * @private
   */
  _generateEmotionalMutation(originalContent) {
    const emotionalWords = {
      'important': 'URGENT',
      'serious': 'CRITICAL',
      'bad': 'DANGEROUS',
      'problem': 'CRISIS',
      'issue': 'EMERGENCY'
    };
    
    let mutated = originalContent;
    for (const [mild, intense] of Object.entries(emotionalWords)) {
      mutated = mutated.replace(new RegExp(`\\b${mild}\\b`, 'gi'), intense);
    }
    
    return mutated;
  }

  /**
   * Calculate mutation velocity (mutations per hour)
   * @private
   */
  _calculateMutationVelocity(mutations) {
    if (mutations.length < 2) return { velocity: 0, trend: 'stable' };

    const sortedMutations = mutations.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const firstMutation = new Date(sortedMutations[0].timestamp);
    const lastMutation = new Date(sortedMutations[sortedMutations.length - 1].timestamp);
    const timeSpanHours = (lastMutation - firstMutation) / (1000 * 60 * 60);

    if (timeSpanHours === 0) return { velocity: 0, trend: 'stable' };

    const velocity = mutations.length / timeSpanHours;
    
    // Analyze recent vs older velocity
    const now = Date.now();
    const recentWindow = 6 * 60 * 60 * 1000; // 6 hours
    const recentMutations = mutations.filter(m => 
      now - new Date(m.timestamp).getTime() < recentWindow
    );

    const recentVelocity = recentMutations.length / 6; // per hour
    const overallVelocity = velocity;

    let trend = 'stable';
    if (recentVelocity > overallVelocity * 1.5) trend = 'accelerating';
    else if (recentVelocity < overallVelocity * 0.5) trend = 'decelerating';

    return {
      velocity: velocity,
      recent_velocity: recentVelocity,
      trend: trend,
      acceleration_factor: recentVelocity / (overallVelocity || 1)
    };
  }

  /**
   * Analyze how mutation patterns evolve over time
   * @private
   */
  _analyzePatternEvolution(mutations) {
    if (mutations.length < 3) return { 
      evolution: 'insufficient_data',
      early_dominant: 'unknown',
      middle_dominant: 'unknown', 
      late_dominant: 'unknown',
      pattern_shift: false,
      evolution_trend: ['insufficient_data']
    };

    const sortedMutations = mutations.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Divide mutations into early, middle, late phases
    const phaseSize = Math.ceil(mutations.length / 3);
    const earlyPhase = sortedMutations.slice(0, phaseSize);
    const middlePhase = sortedMutations.slice(phaseSize, phaseSize * 2);
    const latePhase = sortedMutations.slice(phaseSize * 2);

    const analyzePhase = (phase) => {
      const types = {};
      phase.forEach(m => {
        const mutationType = m.mutation_type || 'unknown';
        types[mutationType] = (types[mutationType] || 0) + 1;
      });
      return types;
    };

    const earlyTypes = analyzePhase(earlyPhase);
    const middleTypes = analyzePhase(middlePhase);
    const lateTypes = analyzePhase(latePhase);

    // Identify dominant patterns in each phase
    const getDominantType = (types) => {
      if (Object.keys(types).length === 0) return 'none';
      return Object.keys(types).reduce((a, b) => (types[a] || 0) > (types[b] || 0) ? a : b, 'none');
    };

    const earlyDominant = getDominantType(earlyTypes);
    const middleDominant = getDominantType(middleTypes);
    const lateDominant = getDominantType(lateTypes);

    return {
      early_dominant: earlyDominant,
      middle_dominant: middleDominant,
      late_dominant: lateDominant,
      pattern_shift: earlyDominant !== lateDominant && earlyDominant !== 'none' && lateDominant !== 'none',
      evolution_trend: this._identifyEvolutionTrend(earlyTypes, middleTypes, lateTypes),
      phase_analysis: {
        early_types: earlyTypes,
        middle_types: middleTypes,
        late_types: lateTypes
      }
    };
  }

  /**
   * Analyze semantic drift in mutations
   * @private
   */
  _analyzeSemanticDrift(family, mutations) {
    if (mutations.length === 0) return { 
      drift: 'none',
      average_drift: 0,
      max_drift: 0,
      drift_progression: [],
      drift_trend: 'no_data',
      semantic_stability: 'stable'
    };

    const originalContent = family.original.content;
    const originalWords = new Set(originalContent.toLowerCase().match(/\b\w+\b/g) || []);
    
    let totalDrift = 0;
    let maxDrift = 0;
    const driftProgression = [];

    mutations.forEach((mutation, index) => {
      const mutationWords = new Set(mutation.content.toLowerCase().match(/\b\w+\b/g) || []);
      
      // Calculate semantic drift from original
      const intersection = new Set([...originalWords].filter(x => mutationWords.has(x)));
      const union = new Set([...originalWords, ...mutationWords]);
      const similarity = union.size > 0 ? intersection.size / union.size : 1;
      const drift = 1 - similarity;
      
      totalDrift += drift;
      maxDrift = Math.max(maxDrift, drift);
      driftProgression.push({ generation: index + 1, drift: drift });
    });

    const averageDrift = mutations.length > 0 ? totalDrift / mutations.length : 0;

    return {
      average_drift: averageDrift,
      max_drift: maxDrift,
      drift_progression: driftProgression,
      drift_trend: this._calculateDriftTrend(driftProgression),
      semantic_stability: averageDrift < 0.3 ? 'stable' : averageDrift < 0.6 ? 'moderate' : 'high_drift'
    };
  }

  /**
   * Analyze virality indicators in mutations
   * @private
   */
  _analyzeViralityIndicators(mutations) {
    const viralKeywords = [
      'urgent', 'breaking', 'shocking', 'must', 'share', 'everyone', 'immediately',
      'warning', 'alert', 'emergency', 'critical', 'dangerous', 'exposed', 'truth'
    ];

    const emotionalIntensifiers = [
      'very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally',
      'massive', 'huge', 'enormous', 'devastating', 'catastrophic'
    ];

    let viralScore = 0;
    let emotionalScore = 0;
    const viralEvolution = [];

    mutations.forEach((mutation, index) => {
      const content = mutation.content.toLowerCase();
      const words = content.match(/\b\w+\b/g) || [];
      
      const viralCount = viralKeywords.filter(keyword => content.includes(keyword)).length;
      const emotionalCount = emotionalIntensifiers.filter(word => content.includes(word)).length;
      
      const mutationViralScore = (viralCount + emotionalCount) / words.length;
      viralScore += mutationViralScore;
      emotionalScore += emotionalCount;
      
      viralEvolution.push({
        generation: index + 1,
        viral_score: mutationViralScore,
        viral_keywords: viralCount,
        emotional_intensifiers: emotionalCount
      });
    });

    return {
      average_viral_score: mutations.length > 0 ? viralScore / mutations.length : 0,
      total_emotional_intensifiers: emotionalScore,
      viral_evolution: viralEvolution,
      virality_trend: this._calculateViralityTrend(viralEvolution),
      viral_potential: this._assessViralPotential(viralScore, mutations.length)
    };
  }

  /**
   * Analyze target audience shifts in mutations
   * @private
   */
  _analyzeTargetAudienceShifts(mutations) {
    const audienceIndicators = {
      elderly: ['grandparents', 'seniors', 'elderly', 'retirement', 'pension'],
      parents: ['children', 'kids', 'family', 'school', 'parenting'],
      youth: ['students', 'college', 'young', 'teens', 'university'],
      professionals: ['work', 'office', 'career', 'business', 'corporate'],
      medical: ['patients', 'doctors', 'health', 'medical', 'treatment']
    };

    const audienceShifts = [];
    
    mutations.forEach((mutation, index) => {
      const content = mutation.content.toLowerCase();
      const audienceScores = {};
      
      Object.entries(audienceIndicators).forEach(([audience, keywords]) => {
        const score = keywords.filter(keyword => content.includes(keyword)).length;
        audienceScores[audience] = score;
      });
      
      const dominantAudience = Object.keys(audienceScores).reduce((a, b) => 
        audienceScores[a] > audienceScores[b] ? a : b
      );
      
      audienceShifts.push({
        generation: index + 1,
        dominant_audience: dominantAudience,
        audience_scores: audienceScores
      });
    });

    return {
      audience_evolution: audienceShifts,
      targeting_diversity: this._calculateTargetingDiversity(audienceShifts),
      audience_focus_trend: this._analyzeAudienceFocusTrend(audienceShifts)
    };
  }

  /**
   * Analyze geographical spread patterns
   * @private
   */
  _analyzeGeographicalSpread(mutations) {
    const locationKeywords = {
      mumbai: ['mumbai', 'bombay'],
      delhi: ['delhi', 'new delhi'],
      bangalore: ['bangalore', 'bengaluru'],
      chennai: ['chennai', 'madras'],
      kolkata: ['kolkata', 'calcutta'],
      hyderabad: ['hyderabad'],
      pune: ['pune'],
      ahmedabad: ['ahmedabad'],
      india: ['india', 'indian', 'bharat'],
      global: ['world', 'global', 'international', 'worldwide']
    };

    const geographicalEvolution = [];
    
    mutations.forEach((mutation, index) => {
      const content = mutation.content.toLowerCase();
      const locationScores = {};
      
      Object.entries(locationKeywords).forEach(([location, keywords]) => {
        const score = keywords.filter(keyword => content.includes(keyword)).length;
        locationScores[location] = score;
      });
      
      geographicalEvolution.push({
        generation: index + 1,
        location_scores: locationScores,
        dominant_location: Object.keys(locationScores).reduce((a, b) => 
          locationScores[a] > locationScores[b] ? a : b
        )
      });
    });

    return {
      geographical_evolution: geographicalEvolution,
      spread_pattern: this._analyzeSpreadPattern(geographicalEvolution),
      localization_trend: this._analyzeLocalizationTrend(geographicalEvolution)
    };
  }

  /**
   * Analyze temporal patterns in mutations
   * @private
   */
  _analyzeTemporalPatterns(mutations) {
    if (mutations.length < 2) return { pattern: 'insufficient_data' };

    const timeIntervals = [];
    const sortedMutations = mutations.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (let i = 1; i < sortedMutations.length; i++) {
      const interval = new Date(sortedMutations[i].timestamp) - 
                      new Date(sortedMutations[i-1].timestamp);
      timeIntervals.push(interval / (1000 * 60 * 60)); // Convert to hours
    }

    const averageInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
    const minInterval = Math.min(...timeIntervals);
    const maxInterval = Math.max(...timeIntervals);

    // Analyze time-of-day patterns
    const hourDistribution = {};
    mutations.forEach(mutation => {
      const hour = new Date(mutation.timestamp).getHours();
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });

    return {
      average_interval_hours: averageInterval,
      min_interval_hours: minInterval,
      max_interval_hours: maxInterval,
      interval_variance: this._calculateVariance(timeIntervals),
      hour_distribution: hourDistribution,
      peak_hours: this._findPeakHours(hourDistribution),
      temporal_clustering: this._analyzeTemporalClustering(timeIntervals)
    };
  }

  /**
   * Analyze complexity evolution from original to mutations
   * @private
   */
  _analyzeComplexityEvolution(original, mutations) {
    const calculateComplexity = (content) => {
      const words = content.match(/\b\w+\b/g) || [];
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
      const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
      const lexicalDiversity = uniqueWords / Math.max(words.length, 1);
      
      return {
        word_count: words.length,
        sentence_count: sentences.length,
        avg_words_per_sentence: avgWordsPerSentence,
        lexical_diversity: lexicalDiversity,
        complexity_score: avgWordsPerSentence * lexicalDiversity
      };
    };

    const originalComplexity = calculateComplexity(original.content);
    const complexityEvolution = [];

    mutations.forEach((mutation, index) => {
      const mutationComplexity = calculateComplexity(mutation.content);
      complexityEvolution.push({
        generation: index + 1,
        complexity: mutationComplexity,
        complexity_change: mutationComplexity.complexity_score - originalComplexity.complexity_score
      });
    });

    return {
      original_complexity: originalComplexity,
      complexity_evolution: complexityEvolution,
      complexity_trend: this._analyzeComplexityTrend(complexityEvolution),
      simplification_tendency: this._analyzeSimplificationTendency(complexityEvolution)
    };
  }

  /**
   * Analyze cross-platform adaptation patterns
   * @private
   */
  _analyzeCrossPlatformAdaptation(mutations) {
    const platformIndicators = {
      twitter: ['#', '@', 'tweet', 'retweet', 'twitter'],
      facebook: ['facebook', 'fb', 'share', 'like'],
      whatsapp: ['whatsapp', 'forward', 'group'],
      telegram: ['telegram', 'channel'],
      instagram: ['instagram', 'story', 'post'],
      youtube: ['youtube', 'video', 'subscribe'],
      tiktok: ['tiktok', 'viral', 'trend']
    };

    const platformEvolution = [];
    
    mutations.forEach((mutation, index) => {
      const content = mutation.content.toLowerCase();
      const platformScores = {};
      
      Object.entries(platformIndicators).forEach(([platform, keywords]) => {
        const score = keywords.filter(keyword => content.includes(keyword)).length;
        platformScores[platform] = score;
      });
      
      // Analyze content format adaptations
      const formatAnalysis = {
        has_hashtags: content.includes('#'),
        has_mentions: content.includes('@'),
        has_urls: /https?:\/\//.test(content),
        character_count: content.length,
        line_breaks: (content.match(/\n/g) || []).length
      };
      
      platformEvolution.push({
        generation: index + 1,
        platform_scores: platformScores,
        format_analysis: formatAnalysis,
        dominant_platform: Object.keys(platformScores).reduce((a, b) => 
          platformScores[a] > platformScores[b] ? a : b
        )
      });
    });

    return {
      platform_evolution: platformEvolution,
      adaptation_patterns: this._analyzePlatformAdaptationPatterns(platformEvolution),
      cross_platform_optimization: this._analyzeCrossPlatformOptimization(platformEvolution)
    };
  }

  /**
   * Calculate prediction confidence based on advanced patterns
   * @private
   */
  _calculatePredictionConfidence(patterns) {
    const totalMutations = patterns.total_mutations;
    
    // Base confidence from mutation count
    let baseConfidence = 0.1;
    if (totalMutations >= 3) baseConfidence = 0.4;
    if (totalMutations >= 10) baseConfidence = 0.7;
    if (totalMutations >= 20) baseConfidence = 0.9;

    // Adjust based on pattern strength
    let patternStrength = 0;
    
    // Velocity factor
    if (patterns.mutation_velocity && patterns.mutation_velocity.trend === 'accelerating') {
      patternStrength += 0.2;
    }
    
    // Pattern evolution factor
    if (patterns.pattern_evolution && patterns.pattern_evolution.pattern_shift) {
      patternStrength += 0.1;
    }
    
    // Virality factor
    if (patterns.virality_indicators && patterns.virality_indicators.viral_potential === 'high') {
      patternStrength += 0.15;
    }
    
    // Semantic stability factor
    if (patterns.semantic_drift && patterns.semantic_drift.semantic_stability === 'stable') {
      patternStrength += 0.1;
    } else if (patterns.semantic_drift && patterns.semantic_drift.semantic_stability === 'high_drift') {
      patternStrength -= 0.1;
    }

    // Recent activity factor
    if (patterns.recent_trend && patterns.recent_trend.trend === 'increasing') {
      patternStrength += 0.1;
    }

    const finalConfidence = Math.min(0.95, Math.max(0.05, baseConfidence + patternStrength));
    
    return {
      confidence: finalConfidence,
      confidence_factors: {
        base_confidence: baseConfidence,
        pattern_strength: patternStrength,
        mutation_count_factor: totalMutations >= 10 ? 'high' : totalMutations >= 3 ? 'medium' : 'low',
        velocity_factor: patterns.mutation_velocity?.trend || 'unknown',
        virality_factor: patterns.virality_indicators?.viral_potential || 'unknown',
        stability_factor: patterns.semantic_drift?.semantic_stability || 'unknown'
      }
    };
  }

  /**
   * Identify evolution trend across phases
   * @private
   */
  _identifyEvolutionTrend(earlyTypes, middleTypes, lateTypes) {
    const phases = [earlyTypes, middleTypes, lateTypes];
    const trends = [];
    
    // Track how each mutation type changes across phases
    const allTypes = new Set([
      ...Object.keys(earlyTypes),
      ...Object.keys(middleTypes),
      ...Object.keys(lateTypes)
    ]);
    
    allTypes.forEach(type => {
      const counts = phases.map(phase => phase[type] || 0);
      if (counts[2] > counts[0]) trends.push(`${type}_increasing`);
      else if (counts[2] < counts[0]) trends.push(`${type}_decreasing`);
    });
    
    return trends.length > 0 ? trends : ['stable'];
  }

  /**
   * Calculate drift trend from progression data
   * @private
   */
  _calculateDriftTrend(driftProgression) {
    if (driftProgression.length < 2) return 'insufficient_data';
    
    const firstHalf = driftProgression.slice(0, Math.floor(driftProgression.length / 2));
    const secondHalf = driftProgression.slice(Math.floor(driftProgression.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.drift, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.drift, 0) / secondHalf.length;
    
    if (secondHalfAvg > firstHalfAvg * 1.2) return 'increasing_drift';
    if (secondHalfAvg < firstHalfAvg * 0.8) return 'decreasing_drift';
    return 'stable_drift';
  }

  /**
   * Calculate virality trend from evolution data
   * @private
   */
  _calculateViralityTrend(viralEvolution) {
    if (viralEvolution.length < 2) return 'insufficient_data';
    
    const scores = viralEvolution.map(item => item.viral_score);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.3) return 'increasing_virality';
    if (secondAvg < firstAvg * 0.7) return 'decreasing_virality';
    return 'stable_virality';
  }

  /**
   * Assess viral potential based on score and mutation count
   * @private
   */
  _assessViralPotential(totalViralScore, mutationCount) {
    if (mutationCount === 0) return 'none';
    
    const avgScore = totalViralScore / mutationCount;
    
    if (avgScore > 0.1) return 'high';
    if (avgScore > 0.05) return 'medium';
    return 'low';
  }

  /**
   * Calculate targeting diversity
   * @private
   */
  _calculateTargetingDiversity(audienceShifts) {
    const allAudiences = new Set();
    audienceShifts.forEach(shift => {
      if (shift.dominant_audience !== 'undefined') {
        allAudiences.add(shift.dominant_audience);
      }
    });
    
    return {
      unique_audiences: allAudiences.size,
      diversity_score: allAudiences.size / Math.max(audienceShifts.length, 1),
      audiences_targeted: Array.from(allAudiences)
    };
  }

  /**
   * Analyze audience focus trend
   * @private
   */
  _analyzeAudienceFocusTrend(audienceShifts) {
    if (audienceShifts.length < 2) return 'insufficient_data';
    
    const recentShifts = audienceShifts.slice(-3); // Last 3 mutations
    const recentAudiences = recentShifts.map(shift => shift.dominant_audience);
    const uniqueRecent = new Set(recentAudiences).size;
    
    if (uniqueRecent === 1) return 'focusing';
    if (uniqueRecent === recentShifts.length) return 'diversifying';
    return 'mixed';
  }

  /**
   * Analyze geographical spread pattern
   * @private
   */
  _analyzeSpreadPattern(geographicalEvolution) {
    if (geographicalEvolution.length < 2) return 'insufficient_data';
    
    const locations = geographicalEvolution.map(item => item.dominant_location);
    const uniqueLocations = new Set(locations).size;
    
    // Check for progression from local to global
    const hasLocalToGlobal = locations.some(loc => ['mumbai', 'delhi', 'bangalore'].includes(loc)) &&
                            locations.some(loc => ['india', 'global'].includes(loc));
    
    if (hasLocalToGlobal) return 'local_to_global';
    if (uniqueLocations > locations.length * 0.7) return 'diverse_spread';
    if (uniqueLocations === 1) return 'localized';
    return 'moderate_spread';
  }

  /**
   * Analyze localization trend
   * @private
   */
  _analyzeLocalizationTrend(geographicalEvolution) {
    if (geographicalEvolution.length < 2) return 'insufficient_data';
    
    const recentLocations = geographicalEvolution.slice(-3).map(item => item.dominant_location);
    const globalKeywords = ['global', 'world', 'international'];
    const localKeywords = ['mumbai', 'delhi', 'bangalore', 'chennai'];
    
    const recentGlobal = recentLocations.filter(loc => globalKeywords.includes(loc)).length;
    const recentLocal = recentLocations.filter(loc => localKeywords.includes(loc)).length;
    
    if (recentGlobal > recentLocal) return 'globalizing';
    if (recentLocal > recentGlobal) return 'localizing';
    return 'mixed';
  }

  /**
   * Calculate variance for time intervals
   * @private
   */
  _calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Find peak hours from hour distribution
   * @private
   */
  _findPeakHours(hourDistribution) {
    const hours = Object.keys(hourDistribution).map(Number);
    if (hours.length === 0) return [];
    
    const maxCount = Math.max(...Object.values(hourDistribution));
    return hours.filter(hour => hourDistribution[hour] === maxCount);
  }

  /**
   * Analyze temporal clustering
   * @private
   */
  _analyzeTemporalClustering(timeIntervals) {
    if (timeIntervals.length < 3) return 'insufficient_data';
    
    const shortIntervals = timeIntervals.filter(interval => interval < 1).length; // < 1 hour
    const mediumIntervals = timeIntervals.filter(interval => interval >= 1 && interval < 24).length;
    const longIntervals = timeIntervals.filter(interval => interval >= 24).length;
    
    if (shortIntervals > timeIntervals.length * 0.6) return 'highly_clustered';
    if (longIntervals > timeIntervals.length * 0.6) return 'sparse';
    return 'moderate_clustering';
  }

  /**
   * Analyze complexity trend
   * @private
   */
  _analyzeComplexityTrend(complexityEvolution) {
    if (complexityEvolution.length < 2) return 'insufficient_data';
    
    const changes = complexityEvolution.map(item => item.complexity_change);
    const increasingCount = changes.filter(change => change > 0).length;
    const decreasingCount = changes.filter(change => change < 0).length;
    
    if (increasingCount > decreasingCount * 1.5) return 'increasing_complexity';
    if (decreasingCount > increasingCount * 1.5) return 'decreasing_complexity';
    return 'stable_complexity';
  }

  /**
   * Analyze simplification tendency
   * @private
   */
  _analyzeSimplificationTendency(complexityEvolution) {
    if (complexityEvolution.length === 0) return 'no_data';
    
    const recentChanges = complexityEvolution.slice(-3).map(item => item.complexity_change);
    const avgRecentChange = recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length;
    
    if (avgRecentChange < -0.1) return 'strong_simplification';
    if (avgRecentChange < 0) return 'mild_simplification';
    if (avgRecentChange > 0.1) return 'increasing_complexity';
    return 'stable';
  }

  /**
   * Analyze platform adaptation patterns
   * @private
   */
  _analyzePlatformAdaptationPatterns(platformEvolution) {
    if (platformEvolution.length === 0) return 'no_data';
    
    const platforms = platformEvolution.map(item => item.dominant_platform);
    const uniquePlatforms = new Set(platforms).size;
    
    // Check for format adaptations
    const formatAdaptations = platformEvolution.map(item => ({
      has_hashtags: item.format_analysis.has_hashtags,
      has_mentions: item.format_analysis.has_mentions,
      has_urls: item.format_analysis.has_urls,
      character_count: item.format_analysis.character_count
    }));
    
    const hashtagUsage = formatAdaptations.filter(f => f.has_hashtags).length;
    const mentionUsage = formatAdaptations.filter(f => f.has_mentions).length;
    const urlUsage = formatAdaptations.filter(f => f.has_urls).length;
    
    return {
      platform_diversity: uniquePlatforms,
      hashtag_adoption: hashtagUsage / platformEvolution.length,
      mention_adoption: mentionUsage / platformEvolution.length,
      url_adoption: urlUsage / platformEvolution.length,
      adaptation_score: (hashtagUsage + mentionUsage + urlUsage) / (platformEvolution.length * 3)
    };
  }

  /**
   * Analyze cross-platform optimization
   * @private
   */
  _analyzeCrossPlatformOptimization(platformEvolution) {
    if (platformEvolution.length === 0) return 'no_data';
    
    const characterCounts = platformEvolution.map(item => item.format_analysis.character_count);
    const avgCharCount = characterCounts.reduce((a, b) => a + b, 0) / characterCounts.length;
    
    // Check for platform-specific optimizations
    const twitterOptimized = characterCounts.filter(count => count <= 280).length;
    const facebookOptimized = characterCounts.filter(count => count > 280 && count <= 2000).length;
    
    return {
      average_character_count: avgCharCount,
      twitter_optimized_ratio: twitterOptimized / platformEvolution.length,
      facebook_optimized_ratio: facebookOptimized / platformEvolution.length,
      optimization_trend: this._determineOptimizationTrend(characterCounts)
    };
  }

  /**
   * Determine optimization trend from character counts
   * @private
   */
  _determineOptimizationTrend(characterCounts) {
    if (characterCounts.length < 2) return 'insufficient_data';
    
    const firstHalf = characterCounts.slice(0, Math.floor(characterCounts.length / 2));
    const secondHalf = characterCounts.slice(Math.floor(characterCounts.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg < firstAvg * 0.8) return 'shortening';
    if (secondAvg > firstAvg * 1.2) return 'lengthening';
    return 'stable';
  } 
 // ============================================================================
  // ADVANCED MUTATION PREDICTION METHODS
  // ============================================================================

  /**
   * Predict next mutation time based on velocity patterns
   * @private
   */
  _predictNextMutationTime(velocityData) {
    const baseInterval = 1 / (velocityData.velocity || 0.1); // Hours between mutations
    const accelerationFactor = velocityData.acceleration_factor || 1;
    
    // Adjust for acceleration
    const predictedInterval = baseInterval / accelerationFactor;
    
    return {
      hours: Math.max(0.5, Math.min(48, predictedInterval)), // Between 30 minutes and 48 hours
      confidence: velocityData.trend === 'accelerating' ? 0.8 : 0.5,
      trend: velocityData.trend
    };
  }

  /**
   * Predict next pattern evolution type
   * @private
   */
  _predictPatternEvolution(evolutionData) {
    const evolutionTrends = evolutionData.evolution_trend || [];
    
    // Analyze which patterns are increasing
    const increasingPatterns = evolutionTrends.filter(trend => trend.includes('_increasing'));
    const decreasingPatterns = evolutionTrends.filter(trend => trend.includes('_decreasing'));
    
    // Predict next dominant pattern
    if (increasingPatterns.length > 0) {
      const nextPattern = increasingPatterns[0].replace('_increasing', '');
      return {
        type: nextPattern.toUpperCase(),
        confidence: 0.75,
        reasoning: `Pattern ${nextPattern} is trending upward`
      };
    }
    
    // Default to most common pattern evolution
    return {
      type: 'EMOTIONAL_AMPLIFICATION',
      confidence: 0.6,
      reasoning: 'Default evolution toward emotional amplification'
    };
  }

  /**
   * Predict next target audience based on patterns
   * @private
   */
  _predictNextTargetAudience(audienceData) {
    const targetedAudiences = new Set(audienceData.targeting_diversity.audiences_targeted);
    const allAudiences = ['elderly', 'parents', 'youth', 'professionals', 'medical'];
    
    // Find untargeted audiences
    const untargetedAudiences = allAudiences.filter(audience => !targetedAudiences.has(audience));
    
    if (untargetedAudiences.length > 0) {
      // Predict most vulnerable untargeted audience
      const vulnerabilityScores = {
        elderly: 0.9,
        parents: 0.8,
        youth: 0.7,
        professionals: 0.5,
        medical: 0.4
      };
      
      const nextAudience = untargetedAudiences.reduce((a, b) => 
        vulnerabilityScores[a] > vulnerabilityScores[b] ? a : b
      );
      
      return {
        audience: nextAudience,
        strategy: this._getTargetingStrategy(nextAudience),
        confidence: 0.7
      };
    }
    
    // Re-target most successful audience
    return {
      audience: audienceData.audience_evolution[0]?.dominant_audience || 'parents',
      strategy: 'retargeting',
      confidence: 0.5
    };
  }

  /**
   * Predict geographical spread
   * @private
   */
  _predictGeographicalSpread(geoData) {
    const spreadPattern = geoData.spread_pattern;
    const localizationTrend = geoData.localization_trend;
    
    if (spreadPattern === 'local_to_global' || localizationTrend === 'globalizing') {
      return {
        location: 'global',
        strategy: 'international_expansion',
        confidence: 0.8
      };
    }
    
    if (localizationTrend === 'localizing') {
      const localCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
      const randomCity = localCities[Math.floor(Math.random() * localCities.length)];
      return {
        location: randomCity.toLowerCase(),
        strategy: 'local_targeting',
        confidence: 0.7
      };
    }
    
    return {
      location: 'india',
      strategy: 'national_spread',
      confidence: 0.6
    };
  }

  /**
   * Predict platform adaptation
   * @private
   */
  _predictPlatformAdaptation(platformData) {
    const adaptationScore = platformData.adaptation_patterns.adaptation_score;
    const optimizationTrend = platformData.cross_platform_optimization.optimization_trend;
    
    // Predict next platform based on current trends
    const platformPriority = {
      twitter: { score: 0.9, optimizations: ['hashtags', 'mentions', 'character_limit'] },
      whatsapp: { score: 0.8, optimizations: ['forward_friendly', 'group_sharing'] },
      facebook: { score: 0.7, optimizations: ['longer_content', 'image_friendly'] },
      telegram: { score: 0.6, optimizations: ['channel_format', 'link_sharing'] },
      instagram: { score: 0.5, optimizations: ['visual_content', 'story_format'] }
    };
    
    const bestPlatform = Object.entries(platformPriority).reduce((a, b) => 
      a[1].score > b[1].score ? a : b
    );
    
    return {
      platform: bestPlatform[0],
      optimizations: bestPlatform[1].optimizations,
      confidence: adaptationScore > 0.5 ? 0.7 : 0.5
    };
  }

  /**
   * Predict complexity evolution
   * @private
   */
  _predictComplexityEvolution(complexityData) {
    const trend = complexityData.complexity_trend;
    const simplificationTendency = complexityData.simplification_tendency;
    
    if (simplificationTendency === 'strong_simplification') {
      return {
        direction: 'simplify',
        target_complexity: 0.3,
        strategy: 'aggressive_simplification'
      };
    }
    
    if (trend === 'increasing_complexity') {
      return {
        direction: 'complexify',
        target_complexity: 0.8,
        strategy: 'detail_expansion'
      };
    }
    
    return {
      direction: 'maintain',
      target_complexity: 0.5,
      strategy: 'stability'
    };
  }

  /**
   * Calculate next analysis time based on patterns
   * @private
   */
  _calculateNextAnalysisTime(patterns) {
    const velocity = patterns.mutation_velocity?.velocity || 0.1;
    const trend = patterns.mutation_velocity?.trend || 'stable';
    
    let hoursUntilNext = 24; // Default 24 hours
    
    if (trend === 'accelerating') {
      hoursUntilNext = Math.max(2, 12 / velocity); // More frequent analysis for accelerating patterns
    } else if (trend === 'decelerating') {
      hoursUntilNext = Math.min(72, 48 / velocity); // Less frequent for decelerating patterns
    }
    
    const nextAnalysisTime = new Date();
    nextAnalysisTime.setHours(nextAnalysisTime.getHours() + hoursUntilNext);
    
    return {
      next_analysis_time: nextAnalysisTime.toISOString(),
      hours_until_next: hoursUntilNext,
      analysis_frequency: trend === 'accelerating' ? 'high' : trend === 'decelerating' ? 'low' : 'medium'
    };
  }

  /**
   * Get targeting strategy for specific audience
   * @private
   */
  _getTargetingStrategy(audience) {
    const strategies = {
      elderly: 'authority_based_fear_appeal',
      parents: 'child_safety_concern',
      youth: 'peer_pressure_viral',
      professionals: 'career_impact_warning',
      medical: 'health_authority_challenge'
    };
    
    return strategies[audience] || 'general_appeal';
  }

  // ============================================================================
  // ADVANCED MUTATION CONTENT GENERATORS
  // ============================================================================

  /**
   * Generate velocity-based mutation
   * @private
   */
  _generateVelocityBasedMutation(originalContent, patterns) {
    // For accelerating mutations, add urgency and time pressure
    const urgencyWords = ['URGENT', 'BREAKING', 'IMMEDIATE', 'NOW', 'QUICKLY'];
    const timeWords = ['within hours', 'by tomorrow', 'before it\'s too late', 'right now'];
    
    const urgencyWord = urgencyWords[Math.floor(Math.random() * urgencyWords.length)];
    const timeWord = timeWords[Math.floor(Math.random() * timeWords.length)];
    
    return `${urgencyWord}: ${originalContent} - Act ${timeWord}!`;
  }

  /**
   * Generate evolution-based mutation
   * @private
   */
  _generateEvolutionBasedMutation(originalContent, evolutionType) {
    switch (evolutionType.type) {
      case 'EMOTIONAL_AMPLIFICATION':
        return this._generateEmotionalMutation(originalContent);
      case 'NUMERICAL_CHANGE':
        return this._generateNumericalMutation(originalContent);
      case 'LOCATION_CHANGE':
        return this._generateLocationMutation(originalContent);
      default:
        return this._generateContextShiftMutation(originalContent);
    }
  }

  /**
   * Generate virality-based mutation
   * @private
   */
  _generateViralityBasedMutation(originalContent, viralityData) {
    const viralPrefixes = [
      '🚨 VIRAL ALERT:',
      '⚠️ EVERYONE MUST KNOW:',
      '🔥 TRENDING NOW:',
      '💥 EXPLOSIVE NEWS:',
      '🌟 GOING VIRAL:'
    ];
    
    const viralSuffixes = [
      'SHARE BEFORE IT\'S DELETED!',
      'SPREAD THE WORD!',
      'DON\'T LET THEM HIDE THIS!',
      'EVERYONE NEEDS TO SEE THIS!',
      'SHARE TO SAVE LIVES!'
    ];
    
    const prefix = viralPrefixes[Math.floor(Math.random() * viralPrefixes.length)];
    const suffix = viralSuffixes[Math.floor(Math.random() * viralSuffixes.length)];
    
    return `${prefix} ${originalContent} ${suffix}`;
  }

  /**
   * Generate audience-targeted mutation
   * @private
   */
  _generateAudienceTargetedMutation(originalContent, targetData) {
    const audienceFrames = {
      elderly: 'Seniors need to know: ',
      parents: 'PARENTS WARNING: This affects your children! ',
      youth: 'Students and young people: ',
      professionals: 'Working professionals beware: ',
      medical: 'Healthcare workers alert: '
    };
    
    const frame = audienceFrames[targetData.audience] || '';
    return `${frame}${originalContent}`;
  }

  /**
   * Generate geographical mutation
   * @private
   */
  _generateGeographicalMutation(originalContent, locationData) {
    const locationFrames = {
      mumbai: 'Mumbai residents alert: ',
      delhi: 'Delhi breaking news: ',
      bangalore: 'Bangalore urgent: ',
      india: 'All India warning: ',
      global: 'Global emergency: '
    };
    
    const frame = locationFrames[locationData.location] || '';
    return `${frame}${originalContent}`;
  }

  /**
   * Generate platform-optimized mutation
   * @private
   */
  _generatePlatformOptimizedMutation(originalContent, platformData) {
    switch (platformData.platform) {
      case 'twitter':
        // Add hashtags and mentions, keep under 280 chars
        const twitterContent = originalContent.substring(0, 200);
        return `${twitterContent} #BreakingNews #Alert @everyone`;
        
      case 'whatsapp':
        // Add forward-friendly format
        return `*IMPORTANT MESSAGE*\n\n${originalContent}\n\n_Please forward to all groups_`;
        
      case 'facebook':
        // Longer format with engagement hooks
        return `${originalContent}\n\nWhat do you think? Share your thoughts below!\n\n#StayInformed #ShareToHelp`;
        
      case 'telegram':
        // Channel-friendly format
        return `📢 CHANNEL UPDATE\n\n${originalContent}\n\nJoin our channel for more updates: @FactSauraAlerts`;
        
      default:
        return originalContent;
    }
  }

  /**
   * Generate semantic drift mutation
   * @private
   */
  _generateSemanticDriftMutation(originalContent, driftData) {
    // Gradually shift meaning while maintaining surface similarity
    const synonymReplacements = {
      'dangerous': 'risky',
      'critical': 'important',
      'emergency': 'situation',
      'warning': 'notice',
      'urgent': 'timely'
    };
    
    let mutatedContent = originalContent;
    
    Object.entries(synonymReplacements).forEach(([original, replacement]) => {
      mutatedContent = mutatedContent.replace(
        new RegExp(`\\b${original}\\b`, 'gi'), 
        replacement
      );
    });
    
    return mutatedContent;
  }

  /**
   * Generate complexity-based mutation
   * @private
   */
  _generateComplexityBasedMutation(originalContent, complexityPrediction) {
    if (complexityPrediction.direction === 'simplify') {
      // Simplify language and structure
      return originalContent
        .replace(/\b(extremely|incredibly|absolutely)\b/gi, 'very')
        .replace(/\b(catastrophic|devastating)\b/gi, 'bad')
        .replace(/[,;:]/g, '.')
        .split('.')[0] + '.'; // Take only first sentence
    }
    
    if (complexityPrediction.direction === 'complexify') {
      // Add complexity and detail
      const complexifiers = [
        'According to recent studies,',
        'Medical experts confirm that',
        'Research indicates that',
        'Scientific evidence shows'
      ];
      
      const complexifier = complexifiers[Math.floor(Math.random() * complexifiers.length)];
      return `${complexifier} ${originalContent} This has been verified through multiple independent sources and peer-reviewed analysis.`;
    }
    
    return originalContent;
  }

  /**
   * Generate context shift mutation
   * @private
   */
  _generateContextShiftMutation(originalContent) {
    const contextShifts = [
      'New evidence suggests: ',
      'Updated information: ',
      'Latest developments: ',
      'Recent findings show: ',
      'Breaking update: '
    ];
    
    const shift = contextShifts[Math.floor(Math.random() * contextShifts.length)];
    return `${shift}${originalContent}`;
  }

  /**
   * Identify dominant mutation pattern from analysis
   * @private
   */
  _identifyDominantMutationPattern(patterns) {
    const patternCounts = {
      [this.mutationPatterns.EMOTIONAL_AMPLIFICATION]: patterns.emotional_mutations || 0,
      [this.mutationPatterns.NUMERICAL_CHANGE]: patterns.numerical_mutations || 0,
      [this.mutationPatterns.LOCATION_CHANGE]: patterns.location_mutations || 0,
      [this.mutationPatterns.PHRASE_ADDITION]: patterns.phrase_addition_mutations || 0,
      [this.mutationPatterns.WORD_SUBSTITUTION]: patterns.word_substitution_mutations || 0,
      [this.mutationPatterns.CONTEXT_SHIFT]: patterns.context_shift_mutations || 0,
      [this.mutationPatterns.SOURCE_MODIFICATION]: patterns.source_modification_mutations || 0,
      [this.mutationPatterns.TIME_SHIFT]: patterns.time_shift_mutations || 0
    };

    // Find the pattern with the highest count
    const dominantType = Object.keys(patternCounts).reduce((a, b) => 
      patternCounts[a] > patternCounts[b] ? a : b
    );

    const count = patternCounts[dominantType];
    
    return {
      type: dominantType,
      count: count,
      percentage: patterns.total_mutations > 0 ? (count / patterns.total_mutations) * 100 : 0,
      strategy: this._getIntensificationStrategy(dominantType)
    };
  }

  /**
   * Get intensification strategy for a mutation pattern
   * @private
   */
  _getIntensificationStrategy(patternType) {
    const strategies = {
      [this.mutationPatterns.EMOTIONAL_AMPLIFICATION]: 'escalate_urgency_and_fear',
      [this.mutationPatterns.NUMERICAL_CHANGE]: 'accelerate_timeline_compression',
      [this.mutationPatterns.LOCATION_CHANGE]: 'expand_geographical_scope',
      [this.mutationPatterns.PHRASE_ADDITION]: 'add_credibility_markers',
      [this.mutationPatterns.WORD_SUBSTITUTION]: 'strengthen_language_intensity',
      [this.mutationPatterns.CONTEXT_SHIFT]: 'reframe_narrative_angle',
      [this.mutationPatterns.SOURCE_MODIFICATION]: 'enhance_authority_claims',
      [this.mutationPatterns.TIME_SHIFT]: 'create_temporal_urgency'
    };

    return strategies[patternType] || 'general_intensification';
  }

  /**
   * Generate pattern intensification mutation
   * @private
   */
  _generatePatternIntensificationMutation(originalContent, dominantPattern) {
    switch (dominantPattern.type) {
      case this.mutationPatterns.EMOTIONAL_AMPLIFICATION:
        return `🚨 CRITICAL ALERT: ${originalContent.toUpperCase()} - SHARE IMMEDIATELY TO SAVE LIVES!`;
        
      case this.mutationPatterns.NUMERICAL_CHANGE:
        return originalContent.replace(/\d+/g, (match) => {
          const num = parseInt(match);
          return Math.floor(num * 0.5); // Accelerate timeline
        });
        
      case this.mutationPatterns.LOCATION_CHANGE:
        return `GLOBAL EMERGENCY: ${originalContent} - Spreading worldwide!`;
        
      case this.mutationPatterns.PHRASE_ADDITION:
        return `VERIFIED BY EXPERTS: ${originalContent} - Multiple sources confirm this shocking truth!`;
        
      case this.mutationPatterns.SOURCE_MODIFICATION:
        return originalContent.replace(/doctors?/gi, 'TOP MEDICAL EXPERTS').replace(/experts?/gi, 'LEADING SCIENTISTS');
        
      case this.mutationPatterns.TIME_SHIFT:
        return originalContent.replace(/\b(today|tomorrow|soon)\b/gi, 'RIGHT NOW');
        
      default:
        return `URGENT UPDATE: ${originalContent} - This changes everything!`;
    }
  }
}


module.exports = MutationDetectionService;