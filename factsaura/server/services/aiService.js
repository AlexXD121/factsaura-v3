// AI Service - handles AI integration and analysis with Jan AI
const axios = require('axios');

class AIService {
  constructor() {
    // Jan AI Configuration from settings
    this.janAIHost = process.env.JAN_AI_HOST || '127.0.0.1';
    this.janAIPort = process.env.JAN_AI_PORT || '1337';
    this.janAIEndpoint = `http://${this.janAIHost}:${this.janAIPort}`;
    this.janAIApiKey = process.env.JAN_AI_API_KEY || 'factsaura-key';
    this.janAIModel = process.env.JAN_AI_MODEL || 'Meta-Llama-3_1-8B-Instruct-IQ4_XS';
    
    this.timeout = parseInt(process.env.AI_ANALYSIS_TIMEOUT) || 90000; // Increased to 90 seconds for complex analysis
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7;
    
    // Configure axios instance for Jan AI
    this.janAIClient = axios.create({
      baseURL: this.janAIEndpoint,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.janAIApiKey}`,
      }
    });
  }

  /**
   * Test connection to Jan AI server
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await this.janAIClient.get('/v1/models');
      return response.status === 200;
    } catch (error) {
      console.error('Jan AI connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Check if the configured model is available
   * @returns {Promise<Object>} Model availability status
   */
  async checkModelAvailability() {
    try {
      const response = await this.janAIClient.get('/v1/models');
      const models = response.data.data || [];
      
      const targetModel = models.find(model => 
        model.id === this.janAIModel || 
        model.id.includes('Meta-Llama-3_1-8B-Instruct') ||
        model.id.includes('Llama-3') // More flexible matching
      );
      
      return {
        available: !!targetModel,
        model_id: targetModel?.id || null,
        configured_model: this.janAIModel,
        all_models: models.map(m => m.id),
        status: targetModel ? 'ready' : 'not_loaded'
      };
    } catch (error) {
      console.error('Model availability check failed:', error.message);
      return {
        available: false,
        model_id: null,
        configured_model: this.janAIModel,
        all_models: [],
        status: 'connection_failed',
        error: error.message
      };
    }
  }

  /**
   * Basic content analysis with simple prompts for misinformation detection
   * @param {string} content - Content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result with step-by-step reasoning
   */
  async analyzeContentBasic(content, options = {}) {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Content is required and must be a non-empty string');
    }

    try {
      const startTime = Date.now();
      
      // Prepare the enhanced analysis prompt
      const analysisPrompt = this._buildBasicAnalysisPrompt(content, options);
      
      // Get available model dynamically
      const modelCheck = await this.checkModelAvailability();
      if (!modelCheck.available) {
        console.warn('No suitable model available, using fallback analysis');
        return this._getFallbackAnalysis(content, new Error('No AI model available'));
      }
      
      const modelToUse = modelCheck.model_id;
      
      // Make request to Jan AI with enhanced error handling
      const response = await this.janAIClient.post('/v1/chat/completions', {
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: 'You are FactSaura AI, a specialized misinformation detection system. Analyze content systematically and respond with valid JSON only. Focus on step-by-step reasoning and crisis context awareness.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent analysis
        max_tokens: 1500, // Increased for detailed reasoning
        stream: false
      });

      const aiResponse = response.data.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      
      // Parse AI response with enhanced validation
      const analysisResult = this._parseEnhancedAnalysisResponse(aiResponse);
      
      // Add metadata
      analysisResult.processing_time_ms = processingTime;
      analysisResult.model_version = response.data.model || modelToUse;
      analysisResult.analysis_timestamp = new Date().toISOString();
      analysisResult.analysis_type = 'basic_content_analysis';
      
      return analysisResult;
      
    } catch (error) {
      console.error('Basic content analysis failed:', error.message);
      
      // Return enhanced fallback analysis
      return this._getFallbackAnalysis(content, error);
    }
  }

  /**
   * Analyze content for misinformation using Jan AI (legacy method)
   * @param {string} content - Content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeContent(content, options = {}) {
    try {
      const startTime = Date.now();
      
      // Prepare the analysis prompt
      const analysisPrompt = this._buildAnalysisPrompt(content, options);
      
      // Get available model dynamically
      const modelCheck = await this.checkModelAvailability();
      const modelToUse = modelCheck.available ? modelCheck.model_id : this.janAIModel;
      
      // Make request to Jan AI
      const response = await this.janAIClient.post('/v1/chat/completions', {
        model: options.model || modelToUse, // Use available Llama model
        messages: [
          {
            role: 'system',
            content: 'You are FactSaura AI, a specialized misinformation detection system. Analyze content and respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1000,
        stream: false
      });

      const aiResponse = response.data.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      
      // Parse AI response
      const analysisResult = this._parseAnalysisResponse(aiResponse);
      
      // Add metadata
      analysisResult.processing_time_ms = processingTime;
      analysisResult.model_version = response.data.model || 'jan-ai-local';
      analysisResult.analysis_timestamp = new Date().toISOString();
      
      return analysisResult;
      
    } catch (error) {
      console.error('AI analysis failed:', error.message);
      
      // Return fallback analysis
      return this._getFallbackAnalysis(content, error);
    }
  }

  /**
   * Generate chat response using Jan AI
   * @param {string} message - User message
   * @param {Object} context - Optional context (post content, etc.)
   * @returns {Promise<Object>} Chat response
   */
  async chatResponse(message, context = null) {
    try {
      const chatPrompt = this._buildChatPrompt(message, context);
      
      // Get available model dynamically
      const modelCheck = await this.checkModelAvailability();
      const modelToUse = modelCheck.available ? modelCheck.model_id : this.janAIModel;
      
      const response = await this.janAIClient.post('/v1/chat/completions', {
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: 'You are FactSaura AI, a helpful fact-checking assistant. Provide accurate, concise responses about information authenticity. If uncertain, say so clearly.'
          },
          {
            role: 'user',
            content: chatPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      });

      return {
        response: response.data.choices[0].message.content,
        confidence: 0.8, // Default confidence for chat responses
        model_version: response.data.model || 'jan-ai-local',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('AI chat failed:', error.message);
      
      return {
        response: "I'm sorry, I'm having trouble processing your question right now. Please try again later.",
        confidence: 0.0,
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get detailed confidence breakdown for analysis
   * @param {Object} analysis - Analysis result
   * @returns {Object} Detailed confidence breakdown
   */
  getConfidenceBreakdown(analysis) {
    if (!analysis || typeof analysis.confidence_score !== 'number') {
      return {
        overall_confidence: 0,
        breakdown: {
          source_credibility: 0,
          content_analysis: 0,
          pattern_matching: 0,
          linguistic_analysis: 0
        },
        explanation: 'No analysis data available'
      };
    }

    // Generate breakdown based on analysis results
    const baseConfidence = analysis.confidence_score;
    
    return {
      overall_confidence: baseConfidence,
      breakdown: {
        source_credibility: Math.min(baseConfidence + 0.1, 1.0),
        content_analysis: baseConfidence,
        pattern_matching: Math.max(baseConfidence - 0.1, 0.0),
        linguistic_analysis: baseConfidence
      },
      explanation: analysis.explanation || 'Analysis completed successfully',
      sources_checked: analysis.sources_checked || [],
      red_flags: analysis.red_flags || [],
      uncertainty_flags: analysis.uncertainty_flags || []
    };
  }

  /**
   * Build basic analysis prompt with enhanced misinformation detection
   * @private
   */
  _buildBasicAnalysisPrompt(content, options) {
    const crisisKeywords = process.env.CRISIS_KEYWORDS?.split(',') || [
      'flood', 'earthquake', 'emergency', 'breaking', 'urgent', 'alert', 
      'evacuation', 'disaster', 'crisis', 'outbreak', 'pandemic', 'lockdown',
      'scam', 'fraud', 'fake', 'hoax', 'conspiracy', 'miracle cure', 'government cover-up'
    ];
    
    const misinformationPatterns = [
      'unverified claims', 'emotional manipulation', 'urgency tactics',
      'missing sources', 'anecdotal evidence', 'correlation vs causation',
      'cherry-picked data', 'appeal to fear', 'false authority'
    ];
    
    return `You are FactSaura AI, an expert misinformation detection system. Analyze this content systematically for potential misinformation.

CONTENT TO ANALYZE:
"${content}"

DETECTION FRAMEWORK:
1. CLAIM IDENTIFICATION: What specific claims are being made?
2. SOURCE VERIFICATION: Are sources provided? Are they credible?
3. MISINFORMATION PATTERNS: Look for: ${misinformationPatterns.join(', ')}
4. CRISIS CONTEXT: Check for crisis keywords: ${crisisKeywords.join(', ')}
5. HARM ASSESSMENT: What damage could occur if this is false?

ANALYSIS STEPS:
Step 1: Identify main claims and check for supporting evidence
Step 2: Look for red flags and misinformation patterns
Step 3: Evaluate crisis context and urgency indicators  
Step 4: Assess potential harm and determine confidence level

Respond with valid JSON only:
{
  "is_misinformation": boolean,
  "confidence_score": 0.0-1.0,
  "explanation": "clear, specific explanation of analysis conclusion",
  "reasoning_steps": [
    "Step 1: [specific findings about claims and evidence]",
    "Step 2: [specific red flags or patterns identified]", 
    "Step 3: [crisis context and urgency evaluation]",
    "Step 4: [harm assessment and confidence reasoning]"
  ],
  "red_flags": ["specific concerning elements with explanations"],
  "sources_needed": ["specific types of sources that would verify these claims"],
  "crisis_context": {
    "urgency_level": "critical|high|medium|low",
    "harm_category": "health|safety|financial|general",
    "crisis_keywords_found": ["actual keywords detected"],
    "potential_harm": "specific description of potential consequences"
  },
  "uncertainty_flags": ["specific areas requiring expert review"]
}`;
  }

  /**
   * Build analysis prompt for Jan AI (legacy)
   * @private
   */
  _buildAnalysisPrompt(content, options) {
    const crisisKeywords = process.env.CRISIS_KEYWORDS?.split(',') || [
      'flood', 'earthquake', 'emergency', 'breaking', 'urgent', 'alert', 
      'evacuation', 'disaster', 'crisis', 'outbreak', 'pandemic', 'lockdown',
      'scam', 'fraud', 'fake', 'hoax', 'conspiracy', 'miracle cure'
    ];
    
    return `You are FactSaura AI, a specialized misinformation detection system. Analyze the following content step-by-step for potential misinformation, considering crisis context and potential harm.

CONTENT TO ANALYZE:
"${content}"

ANALYSIS FRAMEWORK:
1. CREDIBILITY CHECK: Look for unverified claims, missing sources, emotional language
2. CRISIS CONTEXT: Identify emergency/health/safety implications using keywords: ${crisisKeywords.join(', ')}
3. HARM ASSESSMENT: Evaluate potential damage if false information spreads
4. VERIFICATION NEEDS: Determine what sources would confirm or debunk claims

STEP-BY-STEP REASONING:
- First, identify the main claims being made
- Check for red flags: unverified sources, emotional manipulation, urgency tactics
- Assess crisis relevance and potential harm level
- Determine confidence based on available evidence patterns

Respond with valid JSON only:
{
  "is_misinformation": boolean,
  "confidence_score": 0.0-1.0,
  "explanation": "clear explanation of why this content is/isn't misinformation",
  "reasoning_steps": [
    "Step 1: Main claims identified",
    "Step 2: Red flags analysis", 
    "Step 3: Crisis context evaluation",
    "Step 4: Confidence assessment"
  ],
  "red_flags": ["specific concerning elements found"],
  "sources_needed": ["specific sources that would verify these claims"],
  "crisis_context": {
    "urgency_level": "critical|high|medium|low",
    "harm_category": "health|safety|financial|general",
    "crisis_keywords_found": ["actual keywords detected in content"],
    "potential_harm": "description of potential harm if false"
  },
  "uncertainty_flags": ["specific areas needing human expert review"]
}`;
  }

  /**
   * Build chat prompt for Jan AI
   * @private
   */
  _buildChatPrompt(message, context) {
    let prompt = `User question: "${message}"`;
    
    if (context && context.post_content) {
      prompt += `\n\nContext - User is asking about this post: "${context.post_content}"`;
    }
    
    prompt += '\n\nProvide a helpful, accurate response about the information\'s authenticity. Be concise but informative. If uncertain, say so clearly.';
    
    return prompt;
  }

  /**
   * Parse enhanced AI response with better validation
   * @private
   */
  _parseEnhancedAnalysisResponse(aiResponse) {
    try {
      // Try to extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      
      const parsed = JSON.parse(jsonStr);
      
      // Enhanced validation with defaults
      const result = {
        is_misinformation: Boolean(parsed.is_misinformation),
        confidence_score: Math.max(0, Math.min(1, parseFloat(parsed.confidence_score) || 0)),
        explanation: parsed.explanation || 'Analysis completed without specific explanation',
        reasoning_steps: this._validateReasoningSteps(parsed.reasoning_steps),
        red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
        sources_needed: Array.isArray(parsed.sources_needed) ? parsed.sources_needed : ['manual_verification'],
        crisis_context: {
          urgency_level: this._validateUrgencyLevel(parsed.crisis_context?.urgency_level),
          harm_category: this._validateHarmCategory(parsed.crisis_context?.harm_category),
          crisis_keywords_found: Array.isArray(parsed.crisis_context?.crisis_keywords_found) 
            ? parsed.crisis_context.crisis_keywords_found : [],
          potential_harm: parsed.crisis_context?.potential_harm || 'No specific harm identified'
        },
        uncertainty_flags: Array.isArray(parsed.uncertainty_flags) ? parsed.uncertainty_flags : []
      };
      
      // Add quality score based on completeness
      result.analysis_quality = this._calculateAnalysisQuality(result);
      
      return result;
      
    } catch (error) {
      console.error('Failed to parse enhanced AI response:', error.message);
      console.error('Raw AI response:', aiResponse);
      
      // Return structured fallback with reasoning
      return {
        is_misinformation: false,
        confidence_score: 0.3,
        explanation: 'AI response could not be parsed properly, manual review recommended',
        reasoning_steps: [
          'AI analysis attempted but response format was invalid',
          'Parsing failed, falling back to basic analysis',
          'Manual review strongly recommended for accuracy'
        ],
        red_flags: ['ai_response_parsing_failed', 'invalid_json_format'],
        sources_needed: ['manual_expert_review'],
        crisis_context: {
          urgency_level: 'medium',
          harm_category: 'general',
          crisis_keywords_found: [],
          potential_harm: 'Unknown due to parsing failure'
        },
        uncertainty_flags: ['ai_response_parsing_failed', 'needs_human_review'],
        analysis_quality: 0.2
      };
    }
  }

  /**
   * Parse AI response and ensure valid format (legacy)
   * @private
   */
  _parseAnalysisResponse(aiResponse) {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate required fields
      return {
        is_misinformation: Boolean(parsed.is_misinformation),
        confidence_score: Math.max(0, Math.min(1, parseFloat(parsed.confidence_score) || 0)),
        explanation: parsed.explanation || 'Analysis completed',
        reasoning_steps: Array.isArray(parsed.reasoning_steps) ? parsed.reasoning_steps : [
          'Content analyzed for misinformation patterns',
          'Crisis context evaluated',
          'Confidence score calculated'
        ],
        red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
        sources_needed: Array.isArray(parsed.sources_needed) ? parsed.sources_needed : [],
        crisis_context: {
          urgency_level: parsed.crisis_context?.urgency_level || 'medium',
          harm_category: parsed.crisis_context?.harm_category || 'general',
          crisis_keywords_found: Array.isArray(parsed.crisis_context?.crisis_keywords_found) 
            ? parsed.crisis_context.crisis_keywords_found : [],
          potential_harm: parsed.crisis_context?.potential_harm || 'No specific harm identified'
        },
        uncertainty_flags: Array.isArray(parsed.uncertainty_flags) ? parsed.uncertainty_flags : []
      };
      
    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      
      // Return basic analysis if parsing fails
      return {
        is_misinformation: false,
        confidence_score: 0.5,
        explanation: 'Unable to parse AI analysis response',
        red_flags: ['parsing_error'],
        sources_needed: ['manual_review'],
        crisis_context: {
          urgency_level: 'medium',
          harm_category: 'general',
          crisis_keywords_found: []
        },
        uncertainty_flags: ['ai_response_parsing_failed']
      };
    }
  }

  /**
   * Validate reasoning steps array
   * @private
   */
  _validateReasoningSteps(steps) {
    if (Array.isArray(steps) && steps.length > 0) {
      return steps;
    }
    return [
      'Content analyzed for misinformation indicators',
      'Crisis context and urgency evaluated',
      'Confidence score calculated based on available evidence',
      'Manual review recommended for final verification'
    ];
  }

  /**
   * Validate urgency level
   * @private
   */
  _validateUrgencyLevel(level) {
    const validLevels = ['critical', 'high', 'medium', 'low'];
    return validLevels.includes(level) ? level : 'medium';
  }

  /**
   * Validate harm category
   * @private
   */
  _validateHarmCategory(category) {
    const validCategories = ['health', 'safety', 'financial', 'general'];
    return validCategories.includes(category) ? category : 'general';
  }

  /**
   * Calculate analysis quality score
   * @private
   */
  _calculateAnalysisQuality(result) {
    let score = 0.5; // Base score
    
    // Add points for completeness
    if (result.explanation && result.explanation.length > 20) score += 0.1;
    if (result.reasoning_steps && result.reasoning_steps.length >= 3) score += 0.1;
    if (result.red_flags && result.red_flags.length > 0) score += 0.1;
    if (result.sources_needed && result.sources_needed.length > 0) score += 0.1;
    if (result.crisis_context.potential_harm && result.crisis_context.potential_harm !== 'No specific harm identified') score += 0.1;
    
    // Deduct points for uncertainty
    if (result.uncertainty_flags && result.uncertainty_flags.length > 2) score -= 0.1;
    if (result.confidence_score < 0.3) score -= 0.1;
    
    return Math.max(0.2, Math.min(1.0, score));
  }

  /**
   * Get fallback analysis when AI fails
   * @private
   */
  _getFallbackAnalysis(content, error) {
    const crisisKeywords = process.env.CRISIS_KEYWORDS?.split(',') || [];
    const foundKeywords = crisisKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const fallbackResult = {
      is_misinformation: false,
      confidence_score: 0.0,
      explanation: `AI analysis unavailable: ${error.message}`,
      reasoning_steps: [
        'AI service connection failed',
        'Performing basic keyword analysis',
        'Flagging for manual review'
      ],
      red_flags: ['ai_service_unavailable'],
      sources_needed: ['manual_verification_required'],
      crisis_context: {
        urgency_level: foundKeywords.length > 0 ? 'high' : 'medium',
        harm_category: 'general',
        crisis_keywords_found: foundKeywords,
        potential_harm: foundKeywords.length > 0 ? 'Potential crisis-related content requires verification' : 'No immediate harm detected'
      },
      uncertainty_flags: ['ai_analysis_failed', 'needs_human_review'],
      processing_time_ms: 0,
      model_version: 'fallback',
      analysis_timestamp: new Date().toISOString(),
      error: true
    };
    
    // Add quality score for fallback
    fallbackResult.analysis_quality = this._calculateAnalysisQuality(fallbackResult);
    
    return fallbackResult;
  }
}

module.exports = new AIService();