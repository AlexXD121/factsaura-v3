// Semantic Similarity Engine for Misinformation Variant Identification
// Advanced semantic analysis to detect misinformation variants and mutations
const crypto = require('crypto');

class SemanticSimilarityService {
  constructor() {
    // Configuration for semantic similarity
    this.similarityThreshold = parseFloat(process.env.SEMANTIC_SIMILARITY_THRESHOLD) || 0.45;
    this.vectorDimensions = parseInt(process.env.VECTOR_DIMENSIONS) || 100;
    this.maxNGramSize = parseInt(process.env.MAX_NGRAM_SIZE) || 3;
    
    // Semantic feature weights
    this.featureWeights = {
      lexical: 0.4,        // Word-level similarity (increased for better variant detection)
      syntactic: 0.3,      // Sentence structure similarity (increased)
      semantic: 0.2,       // Meaning-level similarity (decreased)
      contextual: 0.1      // Context and domain similarity
    };
    
    // Domain-specific vocabularies for enhanced semantic understanding
    this.domainVocabularies = {
      medical: {
        keywords: ['cure', 'treatment', 'vaccine', 'medicine', 'doctor', 'hospital', 'health', 'disease', 'symptom', 'therapy', 'drug', 'clinical', 'patient', 'diagnosis'],
        synonyms: {
          'cure': ['treatment', 'remedy', 'healing', 'medicine'],
          'doctor': ['physician', 'medic', 'practitioner', 'specialist'],
          'medicine': ['drug', 'medication', 'pharmaceutical', 'remedy'],
          'disease': ['illness', 'condition', 'disorder', 'ailment']
        }
      },
      disaster: {
        keywords: ['flood', 'earthquake', 'emergency', 'evacuation', 'disaster', 'crisis', 'rescue', 'damage', 'victim', 'relief', 'warning', 'alert', 'safety'],
        synonyms: {
          'flood': ['flooding', 'deluge', 'inundation', 'overflow'],
          'emergency': ['crisis', 'urgent', 'critical', 'alarm'],
          'disaster': ['catastrophe', 'calamity', 'tragedy', 'crisis'],
          'evacuation': ['relocation', 'removal', 'exodus', 'withdrawal']
        }
      },
      financial: {
        keywords: ['scam', 'money', 'investment', 'fraud', 'bank', 'payment', 'crypto', 'bitcoin', 'profit', 'scheme', 'return', 'interest'],
        synonyms: {
          'scam': ['fraud', 'scheme', 'con', 'swindle'],
          'money': ['cash', 'funds', 'currency', 'capital'],
          'investment': ['funding', 'capital', 'stake', 'venture'],
          'profit': ['return', 'gain', 'earnings', 'income']
        }
      },
      political: {
        keywords: ['government', 'election', 'vote', 'policy', 'politician', 'party', 'democracy', 'candidate', 'campaign', 'ballot'],
        synonyms: {
          'government': ['administration', 'authority', 'state', 'regime'],
          'politician': ['leader', 'official', 'representative', 'candidate'],
          'election': ['vote', 'ballot', 'poll', 'campaign'],
          'policy': ['law', 'regulation', 'rule', 'guideline']
        }
      }
    };
    
    // Stop words for filtering
    this.stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'shall', 'a', 'an', 'as', 'if', 'when',
      'where', 'why', 'how', 'what', 'who', 'which', 'whom', 'whose'
    ]);
    
    // Semantic vector cache for performance
    this.vectorCache = new Map();
    this.similarityCache = new Map();
  }

  /**
   * Calculate comprehensive semantic similarity between two texts
   * @param {string} text1 - First text to compare
   * @param {string} text2 - Second text to compare
   * @param {Object} options - Additional options for similarity calculation
   * @returns {Promise<Object>} Detailed similarity analysis
   */
  async calculateSimilarity(text1, text2, options = {}) {
    try {
      // Generate cache key for performance
      const cacheKey = this._generateCacheKey(text1, text2);
      if (this.similarityCache.has(cacheKey)) {
        return this.similarityCache.get(cacheKey);
      }
      
      // Preprocess texts with error handling
      let processed1, processed2;
      try {
        processed1 = this._preprocessText(text1);
        processed2 = this._preprocessText(text2);
      } catch (preprocessError) {
        console.error('Text preprocessing failed:', preprocessError.message);
        // Fallback to basic processing
        processed1 = {
          original: text1,
          normalized: text1.toLowerCase().trim(),
          words: this._extractWords(text1),
          sentences: this._extractSentences(text1),
          ngrams: this._extractNGrams(text1),
          entities: { numbers: [], dates: [], locations: [], organizations: [] },
          domain: { primary: 'general', confidence: 0, matches: 0 }
        };
        processed2 = {
          original: text2,
          normalized: text2.toLowerCase().trim(),
          words: this._extractWords(text2),
          sentences: this._extractSentences(text2),
          ngrams: this._extractNGrams(text2),
          entities: { numbers: [], dates: [], locations: [], organizations: [] },
          domain: { primary: 'general', confidence: 0, matches: 0 }
        };
      }
      
      // Calculate different types of similarity with error handling
      let lexicalSimilarity, syntacticSimilarity, semanticSimilarity, contextualSimilarity;
      
      try {
        lexicalSimilarity = await this._calculateLexicalSimilarity(processed1, processed2);
      } catch (error) {
        lexicalSimilarity = { score: 0, error: error.message };
      }
      
      try {
        syntacticSimilarity = await this._calculateSyntacticSimilarity(processed1, processed2);
      } catch (error) {
        syntacticSimilarity = { score: 0, error: error.message };
      }
      
      try {
        semanticSimilarity = await this._calculateSemanticSimilarity(processed1, processed2);
      } catch (error) {
        semanticSimilarity = { score: 0, error: error.message };
      }
      
      try {
        contextualSimilarity = await this._calculateContextualSimilarity(text1, text2);
      } catch (error) {
        contextualSimilarity = { score: 0, error: error.message };
      }
      
      // Calculate weighted overall similarity
      const overallSimilarity = 
        (lexicalSimilarity.score * this.featureWeights.lexical) +
        (syntacticSimilarity.score * this.featureWeights.syntactic) +
        (semanticSimilarity.score * this.featureWeights.semantic) +
        (contextualSimilarity.score * this.featureWeights.contextual);
      
      const result = {
        overall_similarity: overallSimilarity,
        is_variant: overallSimilarity >= this.similarityThreshold,
        confidence: overallSimilarity,
        breakdown: {
          lexical: lexicalSimilarity,
          syntactic: syntacticSimilarity,
          semantic: semanticSimilarity,
          contextual: contextualSimilarity
        },
        variant_analysis: this._analyzeVariantType(text1, text2, {
          lexical: lexicalSimilarity,
          syntactic: syntacticSimilarity,
          semantic: semanticSimilarity,
          contextual: contextualSimilarity
        }),
        processing_time: Date.now()
      };
      
      // Cache result for performance
      this.similarityCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error('Semantic similarity calculation failed:', error.message);
      return {
        overall_similarity: 0.0,
        is_variant: false,
        confidence: 0.0,
        error: error.message
      };
    }
  }

  /**
   * Find semantic variants from a collection of texts
   * @param {string} targetText - Text to find variants for
   * @param {Array<Object>} textCollection - Collection of texts to search through
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of found variants with similarity scores
   */
  async findVariants(targetText, textCollection, options = {}) {
    try {
      const variants = [];
      const minSimilarity = options.minSimilarity || this.similarityThreshold;
      const maxResults = options.maxResults || 50;
      
      // Calculate similarity with each text in collection
      for (const textItem of textCollection) {
        const similarity = await this.calculateSimilarity(targetText, textItem.content || textItem.text);
        
        if (similarity.is_variant && similarity.overall_similarity >= minSimilarity) {
          variants.push({
            ...textItem,
            similarity_analysis: similarity,
            similarity_score: similarity.overall_similarity,
            variant_type: similarity.variant_analysis.primary_type,
            confidence: similarity.confidence
          });
        }
      }
      
      // Sort by similarity score (highest first) and limit results
      return variants
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, maxResults);
        
    } catch (error) {
      console.error('Variant finding failed:', error.message);
      return [];
    }
  }

  /**
   * Cluster similar texts based on semantic similarity
   * @param {Array<Object>} textCollection - Collection of texts to cluster
   * @param {Object} options - Clustering options
   * @returns {Promise<Array>} Array of clusters with similar texts
   */
  async clusterSimilarTexts(textCollection, options = {}) {
    try {
      const clusters = [];
      const processed = new Set();
      const similarityThreshold = options.threshold || this.similarityThreshold;
      
      for (let i = 0; i < textCollection.length; i++) {
        if (processed.has(i)) continue;
        
        const cluster = {
          cluster_id: crypto.randomUUID(),
          representative_text: textCollection[i],
          members: [textCollection[i]],
          similarity_scores: []
        };
        
        // Find similar texts for this cluster
        for (let j = i + 1; j < textCollection.length; j++) {
          if (processed.has(j)) continue;
          
          const similarity = await this.calculateSimilarity(
            textCollection[i].content || textCollection[i].text,
            textCollection[j].content || textCollection[j].text
          );
          
          if (similarity.is_variant && similarity.overall_similarity >= similarityThreshold) {
            cluster.members.push(textCollection[j]);
            cluster.similarity_scores.push({
              member_index: j,
              similarity: similarity.overall_similarity,
              variant_type: similarity.variant_analysis.primary_type
            });
            processed.add(j);
          }
        }
        
        processed.add(i);
        
        // Only add cluster if it has multiple members
        if (cluster.members.length > 1) {
          cluster.cluster_size = cluster.members.length;
          cluster.average_similarity = cluster.similarity_scores.reduce((sum, s) => sum + s.similarity, 0) / cluster.similarity_scores.length;
          clusters.push(cluster);
        }
      }
      
      // Sort clusters by size (largest first)
      return clusters.sort((a, b) => b.cluster_size - a.cluster_size);
      
    } catch (error) {
      console.error('Text clustering failed:', error.message);
      return [];
    }
  }

  /**
   * Generate semantic fingerprint for fast similarity matching
   * @param {string} text - Text to generate fingerprint for
   * @returns {Object} Semantic fingerprint with multiple representations
   */
  generateSemanticFingerprint(text) {
    try {
      const processed = this._preprocessText(text);
      
      // Generate different types of fingerprints
      const wordFingerprint = this._generateWordFingerprint(processed);
      const ngramFingerprint = this._generateNGramFingerprint(processed);
      const semanticFingerprint = this._generateSemanticFingerprint(processed);
      const domainFingerprint = this._generateDomainFingerprint(text);
      
      return {
        word_fingerprint: wordFingerprint,
        ngram_fingerprint: ngramFingerprint,
        semantic_fingerprint: semanticFingerprint,
        domain_fingerprint: domainFingerprint,
        combined_hash: this._generateCombinedHash([
          wordFingerprint,
          ngramFingerprint,
          semanticFingerprint,
          domainFingerprint
        ])
      };
      
    } catch (error) {
      console.error('Fingerprint generation failed:', error.message);
      return {
        error: error.message,
        combined_hash: crypto.createHash('md5').update(text).digest('hex')
      };
    }
  }

  /**
   * Preprocess text for semantic analysis
   * @private
   */
  _preprocessText(text) {
    return {
      original: text,
      normalized: text.toLowerCase().trim(),
      words: this._extractWords(text),
      sentences: this._extractSentences(text),
      ngrams: this._extractNGrams(text),
      entities: this._extractEntities(text),
      domain: this._identifyDomain(text)
    };
  }

  /**
   * Extract words from text, filtering stop words
   * @private
   */
  _extractWords(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.filter(word => 
      word.length > 2 && 
      !this.stopWords.has(word) &&
      !/^\d+$/.test(word) // Filter pure numbers
    );
  }

  /**
   * Extract sentences from text
   * @private
   */
  _extractSentences(text) {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Extract n-grams from text
   * @private
   */
  _extractNGrams(text) {
    const words = this._extractWords(text);
    const ngrams = {};
    
    for (let n = 2; n <= this.maxNGramSize; n++) {
      ngrams[`${n}gram`] = [];
      for (let i = 0; i <= words.length - n; i++) {
        ngrams[`${n}gram`].push(words.slice(i, i + n).join(' '));
      }
    }
    
    return ngrams;
  }

  /**
   * Extract named entities (simple implementation)
   * @private
   */
  _extractEntities(text) {
    const entities = {
      numbers: text.match(/\d+(?:\.\d+)?/g) || [],
      dates: text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g) || [],
      locations: this._extractLocations(text),
      organizations: this._extractOrganizations(text)
    };
    
    return entities;
  }

  /**
   * Extract location entities
   * @private
   */
  _extractLocations(text) {
    const locationPatterns = [
      /\b(Mumbai|Delhi|Bangalore|Chennai|Kolkata|Hyderabad|Pune|Ahmedabad|Jaipur|Lucknow)\b/gi,
      /\b(India|Pakistan|Bangladesh|China|USA|UK|Canada|Australia)\b/gi,
      /\b(Asia|Europe|America|Africa|Antarctica|Australia)\b/gi
    ];
    
    const locations = [];
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      locations.push(...matches);
    });
    
    return [...new Set(locations)]; // Remove duplicates
  }

  /**
   * Extract organization entities
   * @private
   */
  _extractOrganizations(text) {
    const orgPatterns = [
      /\b(WHO|CDC|FDA|NASA|FBI|CIA|UN|EU|NATO)\b/g,
      /\b(Google|Facebook|Twitter|Microsoft|Apple|Amazon)\b/gi,
      /\b(Government|Ministry|Department|Agency|Bureau)\b/gi
    ];
    
    const organizations = [];
    orgPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      organizations.push(...matches);
    });
    
    return [...new Set(organizations)];
  }

  /**
   * Identify domain/topic of text
   * @private
   */
  _identifyDomain(text) {
    const words = new Set(this._extractWords(text));
    let bestDomain = 'general';
    let bestScore = 0;
    
    for (const [domain, vocabulary] of Object.entries(this.domainVocabularies)) {
      if (vocabulary && vocabulary.keywords) {
        const matches = vocabulary.keywords.filter(keyword => words.has(keyword)).length;
        const score = matches / vocabulary.keywords.length;
        
        if (score > bestScore) {
          bestScore = score;
          bestDomain = domain;
        }
      }
    }
    
    return {
      primary: bestDomain,
      confidence: bestScore,
      matches: bestScore * (this.domainVocabularies[bestDomain]?.keywords?.length || 0)
    };
  }

  /**
   * Calculate lexical similarity (word-level)
   * @private
   */
  async _calculateLexicalSimilarity(processed1, processed2) {
    const words1 = new Set(processed1.words);
    const words2 = new Set(processed2.words);
    
    // Jaccard similarity
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    const jaccardScore = union.size > 0 ? intersection.size / union.size : 0;
    
    // Cosine similarity with word frequencies
    const cosineScore = this._calculateCosineWordSimilarity(processed1.words, processed2.words);
    
    // Combine scores
    const combinedScore = (jaccardScore + cosineScore) / 2;
    
    return {
      score: combinedScore,
      jaccard: jaccardScore,
      cosine: cosineScore,
      common_words: [...intersection],
      unique_words_1: [...words1].filter(x => !words2.has(x)),
      unique_words_2: [...words2].filter(x => !words1.has(x))
    };
  }

  /**
   * Calculate syntactic similarity (structure-level)
   * @private
   */
  async _calculateSyntacticSimilarity(processed1, processed2) {
    // Sentence length similarity
    const lengthSimilarity = this._calculateLengthSimilarity(
      processed1.sentences.map(s => s.length),
      processed2.sentences.map(s => s.length)
    );
    
    // N-gram similarity
    const ngramSimilarity = this._calculateNGramSimilarity(processed1.ngrams, processed2.ngrams);
    
    // Sentence structure similarity
    const structureSimilarity = this._calculateStructureSimilarity(processed1.sentences, processed2.sentences);
    
    const combinedScore = (lengthSimilarity + ngramSimilarity + structureSimilarity) / 3;
    
    return {
      score: combinedScore,
      length_similarity: lengthSimilarity,
      ngram_similarity: ngramSimilarity,
      structure_similarity: structureSimilarity
    };
  }

  /**
   * Calculate semantic similarity (meaning-level)
   * @private
   */
  async _calculateSemanticSimilarity(processed1, processed2) {
    // Domain similarity
    const domainSimilarity = this._calculateDomainSimilarity(processed1.domain, processed2.domain);
    
    // Entity similarity
    const entitySimilarity = this._calculateEntitySimilarity(processed1.entities, processed2.entities);
    
    // Synonym-aware similarity - use the primary domain from processed1
    const primaryDomain = processed1.domain?.primary || 'general';
    const synonymSimilarity = this._calculateSynonymSimilarity(processed1.words, processed2.words, primaryDomain);
    
    const combinedScore = (domainSimilarity + entitySimilarity + synonymSimilarity) / 3;
    
    return {
      score: combinedScore,
      domain_similarity: domainSimilarity,
      entity_similarity: entitySimilarity,
      synonym_similarity: synonymSimilarity
    };
  }

  /**
   * Calculate contextual similarity
   * @private
   */
  async _calculateContextualSimilarity(text1, text2) {
    // Emotional tone similarity
    const emotionalSimilarity = this._calculateEmotionalSimilarity(text1, text2);
    
    // Urgency level similarity
    const urgencySimilarity = this._calculateUrgencySimilarity(text1, text2);
    
    // Intent similarity
    const intentSimilarity = this._calculateIntentSimilarity(text1, text2);
    
    const combinedScore = (emotionalSimilarity + urgencySimilarity + intentSimilarity) / 3;
    
    return {
      score: combinedScore,
      emotional_similarity: emotionalSimilarity,
      urgency_similarity: urgencySimilarity,
      intent_similarity: intentSimilarity
    };
  }

  /**
   * Calculate cosine similarity for word frequencies
   * @private
   */
  _calculateCosineWordSimilarity(words1, words2) {
    // Create word frequency vectors
    const allWords = [...new Set([...words1, ...words2])];
    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);
    
    // Calculate cosine similarity
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    return (magnitude1 && magnitude2) ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Calculate length similarity
   * @private
   */
  _calculateLengthSimilarity(lengths1, lengths2) {
    if (lengths1.length === 0 && lengths2.length === 0) return 1.0;
    if (lengths1.length === 0 || lengths2.length === 0) return 0.0;
    
    const avg1 = lengths1.reduce((sum, len) => sum + len, 0) / lengths1.length;
    const avg2 = lengths2.reduce((sum, len) => sum + len, 0) / lengths2.length;
    
    const difference = Math.abs(avg1 - avg2);
    const maxAvg = Math.max(avg1, avg2);
    
    return maxAvg > 0 ? 1 - (difference / maxAvg) : 1.0;
  }

  /**
   * Calculate n-gram similarity
   * @private
   */
  _calculateNGramSimilarity(ngrams1, ngrams2) {
    let totalSimilarity = 0;
    let ngramTypes = 0;
    
    for (const ngramType of Object.keys(ngrams1)) {
      if (ngrams2[ngramType]) {
        const set1 = new Set(ngrams1[ngramType]);
        const set2 = new Set(ngrams2[ngramType]);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        const similarity = union.size > 0 ? intersection.size / union.size : 0;
        totalSimilarity += similarity;
        ngramTypes++;
      }
    }
    
    return ngramTypes > 0 ? totalSimilarity / ngramTypes : 0;
  }

  /**
   * Calculate structure similarity
   * @private
   */
  _calculateStructureSimilarity(sentences1, sentences2) {
    // Simple structure comparison based on sentence count and patterns
    const countSimilarity = Math.min(sentences1.length, sentences2.length) / Math.max(sentences1.length, sentences2.length);
    
    // Pattern similarity (questions, exclamations, etc.)
    const pattern1 = this._extractSentencePatterns(sentences1);
    const pattern2 = this._extractSentencePatterns(sentences2);
    
    const patternSimilarity = this._calculatePatternSimilarity(pattern1, pattern2);
    
    return (countSimilarity + patternSimilarity) / 2;
  }

  /**
   * Extract sentence patterns
   * @private
   */
  _extractSentencePatterns(sentences) {
    return {
      questions: sentences.filter(s => s.includes('?')).length,
      exclamations: sentences.filter(s => s.includes('!')).length,
      statements: sentences.filter(s => !s.includes('?') && !s.includes('!')).length
    };
  }

  /**
   * Calculate pattern similarity
   * @private
   */
  _calculatePatternSimilarity(pattern1, pattern2) {
    const keys = ['questions', 'exclamations', 'statements'];
    let similarity = 0;
    
    for (const key of keys) {
      const val1 = pattern1[key] || 0;
      const val2 = pattern2[key] || 0;
      const maxVal = Math.max(val1, val2);
      
      if (maxVal > 0) {
        similarity += Math.min(val1, val2) / maxVal;
      } else {
        similarity += 1; // Both are 0
      }
    }
    
    return similarity / keys.length;
  }

  /**
   * Calculate domain similarity
   * @private
   */
  _calculateDomainSimilarity(domain1, domain2) {
    if (domain1.primary === domain2.primary) {
      return Math.min(domain1.confidence, domain2.confidence);
    }
    
    // Check for related domains
    const relatedDomains = {
      'medical': ['disaster'],
      'disaster': ['medical'],
      'financial': ['political'],
      'political': ['financial']
    };
    
    const related = relatedDomains[domain1.primary];
    if (related && related.includes(domain2.primary)) {
      return 0.5 * Math.min(domain1.confidence, domain2.confidence);
    }
    
    return 0;
  }

  /**
   * Calculate entity similarity
   * @private
   */
  _calculateEntitySimilarity(entities1, entities2) {
    let totalSimilarity = 0;
    let entityTypes = 0;
    
    for (const entityType of Object.keys(entities1)) {
      if (entities2[entityType]) {
        const set1 = new Set(entities1[entityType]);
        const set2 = new Set(entities2[entityType]);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        const similarity = union.size > 0 ? intersection.size / union.size : 0;
        totalSimilarity += similarity;
        entityTypes++;
      }
    }
    
    return entityTypes > 0 ? totalSimilarity / entityTypes : 0;
  }

  /**
   * Calculate synonym-aware similarity
   * @private
   */
  _calculateSynonymSimilarity(words1, words2, domain) {
    if (!domain || !this.domainVocabularies[domain] || !this.domainVocabularies[domain].synonyms) {
      return 0;
    }
    
    const synonyms = this.domainVocabularies[domain].synonyms;
    let synonymMatches = 0;
    let totalComparisons = 0;
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        totalComparisons++;
        
        if (word1 === word2) {
          synonymMatches++;
        } else if (synonyms[word1] && synonyms[word1].includes(word2)) {
          synonymMatches += 0.8; // Synonym match is slightly less than exact match
        } else if (synonyms[word2] && synonyms[word2].includes(word1)) {
          synonymMatches += 0.8;
        }
      }
    }
    
    return totalComparisons > 0 ? synonymMatches / totalComparisons : 0;
  }

  /**
   * Calculate emotional similarity
   * @private
   */
  _calculateEmotionalSimilarity(text1, text2) {
    const emotionalWords = {
      positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'],
      negative: ['bad', 'terrible', 'awful', 'horrible', 'dangerous', 'scary'],
      urgent: ['urgent', 'emergency', 'critical', 'immediate', 'now', 'quickly'],
      fear: ['fear', 'afraid', 'scared', 'terrified', 'panic', 'worried']
    };
    
    const emotion1 = this._analyzeEmotion(text1, emotionalWords);
    const emotion2 = this._analyzeEmotion(text2, emotionalWords);
    
    let similarity = 0;
    let categories = 0;
    
    for (const category of Object.keys(emotionalWords)) {
      const score1 = emotion1[category] || 0;
      const score2 = emotion2[category] || 0;
      const maxScore = Math.max(score1, score2);
      
      if (maxScore > 0) {
        similarity += Math.min(score1, score2) / maxScore;
      } else {
        similarity += 1; // Both are 0
      }
      categories++;
    }
    
    return categories > 0 ? similarity / categories : 0;
  }

  /**
   * Analyze emotional content
   * @private
   */
  _analyzeEmotion(text, emotionalWords) {
    const words = this._extractWords(text);
    const emotion = {};
    
    for (const [category, categoryWords] of Object.entries(emotionalWords)) {
      emotion[category] = categoryWords.filter(word => words.includes(word)).length;
    }
    
    return emotion;
  }

  /**
   * Calculate urgency similarity
   * @private
   */
  _calculateUrgencySimilarity(text1, text2) {
    const urgencyIndicators = ['urgent', 'emergency', 'critical', 'immediate', 'breaking', 'alert', 'warning', 'now', 'quickly', 'asap'];
    
    const urgency1 = this._calculateUrgencyScore(text1, urgencyIndicators);
    const urgency2 = this._calculateUrgencyScore(text2, urgencyIndicators);
    
    const maxUrgency = Math.max(urgency1, urgency2);
    return maxUrgency > 0 ? Math.min(urgency1, urgency2) / maxUrgency : 1.0;
  }

  /**
   * Calculate urgency score
   * @private
   */
  _calculateUrgencyScore(text, urgencyIndicators) {
    const words = this._extractWords(text);
    return urgencyIndicators.filter(indicator => words.includes(indicator)).length;
  }

  /**
   * Calculate intent similarity
   * @private
   */
  _calculateIntentSimilarity(text1, text2) {
    const intentPatterns = {
      warning: ['warning', 'beware', 'caution', 'danger', 'avoid', 'don\'t'],
      information: ['according', 'report', 'study', 'research', 'data', 'statistics'],
      instruction: ['should', 'must', 'need to', 'have to', 'follow', 'do this'],
      question: ['?', 'what', 'how', 'why', 'when', 'where', 'who']
    };
    
    const intent1 = this._analyzeIntent(text1, intentPatterns);
    const intent2 = this._analyzeIntent(text2, intentPatterns);
    
    let similarity = 0;
    let categories = 0;
    
    for (const category of Object.keys(intentPatterns)) {
      const score1 = intent1[category] || 0;
      const score2 = intent2[category] || 0;
      const maxScore = Math.max(score1, score2);
      
      if (maxScore > 0) {
        similarity += Math.min(score1, score2) / maxScore;
      } else {
        similarity += 1;
      }
      categories++;
    }
    
    return categories > 0 ? similarity / categories : 0;
  }

  /**
   * Analyze intent patterns
   * @private
   */
  _analyzeIntent(text, intentPatterns) {
    const intent = {};
    const lowerText = text.toLowerCase();
    
    for (const [category, patterns] of Object.entries(intentPatterns)) {
      intent[category] = patterns.filter(pattern => lowerText.includes(pattern)).length;
    }
    
    return intent;
  }

  /**
   * Analyze variant type based on similarity breakdown
   * @private
   */
  _analyzeVariantType(text1, text2, similarityBreakdown) {
    const types = [];
    
    // Determine primary variant type based on highest similarity component
    const scores = {
      lexical: similarityBreakdown.lexical.score,
      syntactic: similarityBreakdown.syntactic.score,
      semantic: similarityBreakdown.semantic.score,
      contextual: similarityBreakdown.contextual.score
    };
    
    const primaryType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // Identify specific variant characteristics
    if (similarityBreakdown.lexical.score > 0.8) {
      types.push('LEXICAL_VARIANT'); // Very similar words
    }
    
    if (similarityBreakdown.semantic.score > 0.7 && similarityBreakdown.lexical.score < 0.5) {
      types.push('SEMANTIC_VARIANT'); // Same meaning, different words
    }
    
    if (similarityBreakdown.syntactic.score > 0.7) {
      types.push('STRUCTURAL_VARIANT'); // Similar structure
    }
    
    if (similarityBreakdown.contextual.score > 0.8) {
      types.push('CONTEXTUAL_VARIANT'); // Similar context/tone
    }
    
    // Check for specific mutation patterns
    const mutationPatterns = this._identifyMutationPatterns(text1, text2);
    types.push(...mutationPatterns);
    
    return {
      primary_type: primaryType.toUpperCase(),
      variant_types: types,
      confidence: scores[primaryType],
      mutation_patterns: mutationPatterns
    };
  }

  /**
   * Identify specific mutation patterns
   * @private
   */
  _identifyMutationPatterns(text1, text2) {
    const patterns = [];
    
    // Number changes
    const numbers1 = text1.match(/\d+/g) || [];
    const numbers2 = text2.match(/\d+/g) || [];
    if (numbers1.length !== numbers2.length || !numbers1.every((num, i) => num === numbers2[i])) {
      patterns.push('NUMERICAL_MUTATION');
    }
    
    // Location changes
    const locations1 = this._extractLocations(text1);
    const locations2 = this._extractLocations(text2);
    if (locations1.length !== locations2.length || !locations1.every(loc => locations2.includes(loc))) {
      patterns.push('LOCATION_MUTATION');
    }
    
    // Emotional amplification
    const emotionalWords = ['urgent', 'critical', 'dangerous', 'shocking', 'breaking'];
    const emotional1 = emotionalWords.filter(word => text1.toLowerCase().includes(word)).length;
    const emotional2 = emotionalWords.filter(word => text2.toLowerCase().includes(word)).length;
    if (emotional2 > emotional1) {
      patterns.push('EMOTIONAL_AMPLIFICATION');
    }
    
    // Length changes
    const lengthRatio = text2.length / text1.length;
    if (lengthRatio > 1.3) {
      patterns.push('CONTENT_EXPANSION');
    } else if (lengthRatio < 0.7) {
      patterns.push('CONTENT_REDUCTION');
    }
    
    return patterns;
  }

  /**
   * Generate word-based fingerprint
   * @private
   */
  _generateWordFingerprint(processed) {
    const significantWords = processed.words
      .filter(word => word.length > 3)
      .sort()
      .slice(0, 20);
    
    return crypto.createHash('md5').update(significantWords.join('|')).digest('hex');
  }

  /**
   * Generate n-gram based fingerprint
   * @private
   */
  _generateNGramFingerprint(processed) {
    const allNgrams = [];
    for (const ngramType of Object.keys(processed.ngrams)) {
      allNgrams.push(...processed.ngrams[ngramType]);
    }
    
    const significantNgrams = allNgrams
      .sort()
      .slice(0, 15);
    
    return crypto.createHash('md5').update(significantNgrams.join('|')).digest('hex');
  }

  /**
   * Generate semantic fingerprint
   * @private
   */
  _generateSemanticFingerprint(processed) {
    const semanticElements = [
      processed.domain.primary,
      ...Object.keys(processed.entities).map(type => `${type}:${processed.entities[type].length}`),
      ...processed.words.slice(0, 10)
    ];
    
    return crypto.createHash('md5').update(semanticElements.join('|')).digest('hex');
  }

  /**
   * Generate domain-specific fingerprint
   * @private
   */
  _generateDomainFingerprint(text) {
    const domain = this._identifyDomain(text);
    const domainVocab = this.domainVocabularies[domain.primary];
    const domainWords = domainVocab?.keywords || [];
    const matchingWords = domainWords.filter(word => text.toLowerCase().includes(word));
    
    return crypto.createHash('md5').update(`${domain.primary}:${matchingWords.join('|')}`).digest('hex');
  }

  /**
   * Generate combined hash from multiple fingerprints
   * @private
   */
  _generateCombinedHash(fingerprints) {
    return crypto.createHash('sha256').update(fingerprints.join('|')).digest('hex');
  }

  /**
   * Generate cache key for similarity calculation
   * @private
   */
  _generateCacheKey(text1, text2) {
    const hash1 = crypto.createHash('md5').update(text1).digest('hex');
    const hash2 = crypto.createHash('md5').update(text2).digest('hex');
    return [hash1, hash2].sort().join('|');
  }

  /**
   * Clear caches to free memory
   */
  clearCaches() {
    this.vectorCache.clear();
    this.similarityCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      vector_cache_size: this.vectorCache.size,
      similarity_cache_size: this.similarityCache.size,
      memory_usage: process.memoryUsage()
    };
  }
}

module.exports = SemanticSimilarityService;