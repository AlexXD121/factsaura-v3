// AI Service - handles AI integration and analysis with Jan AI
const axios = require('axios');
const { apiKeyManager } = require('../config/apiKeys');
const { circuitBreakerManager } = require('../middleware/circuitBreaker');

class AIService {
  constructor() {
    // Jan AI Configuration from settings
    this.janAIHost = process.env.JAN_AI_HOST || '127.0.0.1';
    this.janAIPort = process.env.JAN_AI_PORT || '1337';
    this.janAIEndpoint = `http://${this.janAIHost}:${this.janAIPort}`;
    this.janAIApiKey = process.env.JAN_AI_API_KEY || 'factsaura-key';
    this.janAIModel = process.env.JAN_AI_MODEL || 'Meta-Llama-3_1-8B-Instruct-IQ4_XS';
    
    // Timeout configurations
    this.timeout = parseInt(process.env.AI_ANALYSIS_TIMEOUT) || 30000; // 30 seconds default
    this.connectionTimeout = parseInt(process.env.AI_CONNECTION_TIMEOUT) || 5000; // 5 seconds for connection
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7;
    
    // Retry configurations
    this.maxRetries = parseInt(process.env.AI_MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.AI_RETRY_DELAY) || 1000; // 1 second
    
    // Circuit breaker configuration
    this.circuitBreakerThreshold = parseInt(process.env.AI_CIRCUIT_BREAKER_THRESHOLD) || 5;
    this.circuitBreakerResetTime = parseInt(process.env.AI_CIRCUIT_BREAKER_RESET_TIME) || 60000; // 1 minute
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.circuitBreakerOpen = false;
    
    // Configure axios instance for Jan AI with enhanced error handling
    this.janAIClient = axios.create({
      baseURL: this.janAIEndpoint,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.janAIApiKey}`,
      }
    });

    // Add request interceptor for timeout handling
    this.janAIClient.interceptors.request.use(
      (config) => {
        // Add connection timeout
        config.timeout = this.timeout;
        return config;
      },
      (error) => {
        return Promise.reject(this._enhanceError(error, 'REQUEST_INTERCEPTOR'));
      }
    );

    // Add response interceptor for error handling
    this.janAIClient.interceptors.response.use(
      (response) => {
        // Reset failure count on successful response
        this.failureCount = 0;
        this.circuitBreakerOpen = false;
        // Update rate limit tracking
        apiKeyManager.incrementRateLimit('janAi');
        return response;
      },
      (error) => {
        this._recordFailure();
        return Promise.reject(this._enhanceError(error, 'RESPONSE_INTERCEPTOR'));
      }
    );
  }

  /**
   * Test connection to Jan AI server with enhanced error handling
   * @returns {Promise<Object>} Connection status with details
   */
  async testConnection() {
    try {
      // Check circuit breaker first
      if (this._isCircuitBreakerOpen()) {
        return {
          connected: false,
          error: 'CIRCUIT_BREAKER_OPEN',
          message: 'Circuit breaker is open, service temporarily unavailable',
          retry_after: this._getCircuitBreakerResetTime()
        };
      }

      const startTime = Date.now();
      const response = await this._executeWithTimeout(
        () => this.janAIClient.get('/v1/models'),
        this.connectionTimeout,
        'CONNECTION_TEST'
      );
      
      const responseTime = Date.now() - startTime;
      
      return {
        connected: response.status === 200,
        response_time_ms: responseTime,
        endpoint: this.janAIEndpoint,
        status: 'healthy'
      };
    } catch (error) {
      console.error('Jan AI connection test failed:', error.message);
      
      return {
        connected: false,
        error: error.code || 'CONNECTION_FAILED',
        message: error.message,
        endpoint: this.janAIEndpoint,
        status: 'unhealthy',
        failure_count: this.failureCount
      };
    }
  }

  /**
   * Check if the configured model is available with enhanced error handling
   * @returns {Promise<Object>} Model availability status
   */
  async checkModelAvailability() {
    try {
      // Check circuit breaker
      if (this._isCircuitBreakerOpen()) {
        return {
          available: false,
          model_id: null,
          configured_model: this.janAIModel,
          all_models: [],
          status: 'circuit_breaker_open',
          error: 'Service temporarily unavailable due to repeated failures',
          retry_after: this._getCircuitBreakerResetTime()
        };
      }

      const response = await this._executeWithRetry(
        () => this.janAIClient.get('/v1/models'),
        'MODEL_AVAILABILITY_CHECK'
      );
      
      const models = response.data.data || [];
      
      const targetModel = models.find(model => 
        model.id === this.janAIModel || 
        model.id.includes('Meta-Llama-3_1-8B-Instruct')
      );
      
      return {
        available: !!targetModel,
        model_id: targetModel?.id || null,
        configured_model: this.janAIModel,
        all_models: models.map(m => m.id),
        status: targetModel ? 'ready' : 'not_loaded',
        last_checked: new Date().toISOString()
      };
    } catch (error) {
      console.error('Model availability check failed:', error.message);
      
      return {
        available: false,
        model_id: null,
        configured_model: this.janAIModel,
        all_models: [],
        status: 'connection_failed',
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        last_checked: new Date().toISOString(),
        failure_count: this.failureCount
      };
    }
  }

  /**
   * Basic content analysis with enhanced error handling, timeouts, and fallbacks
   * @param {string} content - Content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result with step-by-step reasoning
   */
  async analyzeContentBasic(content, options = {}) {
    // Input validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Content is required and must be a non-empty string');
    }

    if (content.length > 10000) {
      throw new Error('Content too long. Maximum 10,000 characters allowed');
    }

    try {
      const startTime = Date.now();
      
      // Check circuit breaker
      if (this._isCircuitBreakerOpen()) {
        console.warn('Circuit breaker open, using fallback analysis');
        return this._getFallbackAnalysis(content, new Error('Circuit breaker open - service temporarily unavailable'));
      }
      
      // Prepare the enhanced analysis prompt
      const analysisPrompt = this._buildBasicAnalysisPrompt(content, options);
      
      // Get available model with retry
      const modelCheck = await this._executeWithRetry(
        () => this.checkModelAvailability(),
        'MODEL_CHECK'
      );
      
      if (!modelCheck.available) {
        console.warn('No suitable model available, using fallback analysis');
        return this._getFallbackAnalysis(content, new Error(`No AI model available: ${modelCheck.error || 'Unknown error'}`));
      }
      
      const modelToUse = modelCheck.model_id;
      
      // Make request to Jan AI with enhanced error handling and timeout
      const response = await this._executeWithRetry(async () => {
        return await this._executeWithTimeout(
          () => this.janAIClient.post('/v1/chat/completions', {
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
          }),
          this.timeout,
          'AI_ANALYSIS_REQUEST'
        );
      }, 'CONTENT_ANALYSIS');

      // Validate response structure
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid AI response structure');
      }

      const aiResponse = response.data.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      
      // Parse AI response with enhanced validation
      const analysisResult = this._parseEnhancedAnalysisResponse(aiResponse);
      
      // Add metadata
      analysisResult.processing_time_ms = processingTime;
      analysisResult.model_version = response.data.model || modelToUse;
      analysisResult.analysis_timestamp = new Date().toISOString();
      analysisResult.analysis_type = 'basic_content_analysis';
      analysisResult.success = true;
      
      return analysisResult;
      
    } catch (error) {
      console.error('Basic content analysis failed:', error.message);
      
      // Return enhanced fallback analysis with error details
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
   * Generate chat response using Jan AI with enhanced error handling
   * @param {string} message - User message
   * @param {Object} context - Optional context (post content, etc.)
   * @returns {Promise<Object>} Chat response
   */
  async chatResponse(message, context = null) {
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        response: "I need a message to respond to. Please ask me a question about the content.",
        confidence: 0.0,
        error: true,
        error_code: 'INVALID_INPUT',
        timestamp: new Date().toISOString()
      };
    }

    if (message.length > 1000) {
      return {
        response: "Your message is too long. Please keep it under 1000 characters.",
        confidence: 0.0,
        error: true,
        error_code: 'MESSAGE_TOO_LONG',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const startTime = Date.now();
      
      // Check circuit breaker
      if (this._isCircuitBreakerOpen()) {
        return this._getChatFallbackResponse(message, new Error('Circuit breaker open'));
      }

      const chatPrompt = this._buildChatPrompt(message, context);
      
      // Get available model with retry
      const modelCheck = await this._executeWithRetry(
        () => this.checkModelAvailability(),
        'CHAT_MODEL_CHECK'
      );
      
      if (!modelCheck.available) {
        return this._getChatFallbackResponse(message, new Error('No AI model available'));
      }
      
      const modelToUse = modelCheck.model_id;
      
      // Make chat request with timeout and retry
      const response = await this._executeWithRetry(async () => {
        return await this._executeWithTimeout(
          () => this.janAIClient.post('/v1/chat/completions', {
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
          }),
          this.timeout,
          'AI_CHAT_REQUEST'
        );
      }, 'CHAT_RESPONSE');

      // Validate response
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid AI chat response structure');
      }

      const processingTime = Date.now() - startTime;

      return {
        response: response.data.choices[0].message.content,
        confidence: 0.8, // Default confidence for chat responses
        model_version: response.data.model || modelToUse,
        timestamp: new Date().toISOString(),
        processing_time_ms: processingTime,
        success: true
      };
      
    } catch (error) {
      console.error('AI chat failed:', error.message);
      return this._getChatFallbackResponse(message, error);
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
   * Execute function with timeout
   * @private
   */
  async _executeWithTimeout(fn, timeoutMs, operation) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const result = await fn();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(this._enhanceError(error, operation));
      }
    });
  }

  /**
   * Execute function with retry logic
   * @private
   */
  async _executeWithRetry(fn, operation, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this._enhanceError(error, operation);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry on certain errors
        if (this._isNonRetryableError(error)) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`${operation} attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await this._sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Handle API errors with proper error types
   */
  handleApiError(error, operation) {
    const { handleExternalServiceError } = require('../middleware/apiServiceErrorHandler');
    throw handleExternalServiceError(error, 'Jan AI', operation);
  }

  /**
   * Check if we can make more API requests (rate limiting)
   */
  canMakeRequest() {
    return apiKeyManager.checkRateLimit('janAi');
  }

  /**
   * Increment request counter
   */
  incrementRequestCount() {
    apiKeyManager.incrementRateLimit('janAi');
  }

  /**
   * Check if error should not be retried
   * @private
   */
  _isNonRetryableError(error) {
    const nonRetryableCodes = [
      'INVALID_INPUT',
      'MESSAGE_TOO_LONG',
      'CONTENT_TOO_LONG',
      'ENOTFOUND', // DNS resolution failed
      'ECONNREFUSED' // Connection refused
    ];
    
    return nonRetryableCodes.includes(error.code) || 
           (error.response && error.response.status >= 400 && error.response.status < 500);
  }

  /**
   * Enhance error with additional context
   * @private
   */
  _enhanceError(error, operation) {
    const enhancedError = new Error(error.message);
    enhancedError.code = error.code || 'UNKNOWN_ERROR';
    enhancedError.operation = operation;
    enhancedError.timestamp = new Date().toISOString();
    
    if (error.response) {
      enhancedError.status = error.response.status;
      enhancedError.statusText = error.response.statusText;
    }
    
    if (error.request) {
      enhancedError.request_timeout = error.timeout;
    }
    
    return enhancedError;
  }

  /**
   * Record failure for circuit breaker
   * @private
   */
  _recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerOpen = true;
      console.warn(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Check if circuit breaker is open
   * @private
   */
  _isCircuitBreakerOpen() {
    if (!this.circuitBreakerOpen) {
      return false;
    }
    
    // Check if reset time has passed
    if (Date.now() - this.lastFailureTime > this.circuitBreakerResetTime) {
      this.circuitBreakerOpen = false;
      this.failureCount = 0;
      console.info('Circuit breaker reset');
      return false;
    }
    
    return true;
  }

  /**
   * Get circuit breaker reset time
   * @private
   */
  _getCircuitBreakerResetTime() {
    if (!this.lastFailureTime) return 0;
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.circuitBreakerResetTime - elapsed);
  }

  /**
   * Sleep for specified milliseconds
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get chat fallback response
   * @private
   */
  _getChatFallbackResponse(message, error) {
    const fallbackResponses = [
      "I'm currently experiencing technical difficulties. Please try again in a few moments.",
      "I'm having trouble connecting to my analysis systems right now. Please check back shortly.",
      "My AI systems are temporarily unavailable. I recommend consulting official sources for fact-checking.",
      "I'm unable to process your request at the moment due to technical issues. Please try again later."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      response: randomResponse,
      confidence: 0.0,
      error: true,
      error_code: error.code || 'AI_SERVICE_UNAVAILABLE',
      error_message: error.message,
      model_version: 'fallback',
      timestamp: new Date().toISOString(),
      processing_time_ms: 0,
      fallback: true
    };
  }

  /**
   * Get fallback analysis when AI fails with enhanced error details
   * @private
   */
  _getFallbackAnalysis(content, error) {
    const crisisKeywords = process.env.CRISIS_KEYWORDS?.split(',') || [
      'flood', 'earthquake', 'emergency', 'breaking', 'urgent', 'alert', 
      'evacuation', 'disaster', 'crisis', 'outbreak', 'pandemic', 'lockdown',
      'scam', 'fraud', 'fake', 'hoax', 'conspiracy', 'miracle cure'
    ];
    
    const foundKeywords = crisisKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Basic pattern detection for fallback
    const suspiciousPatterns = [
      'BREAKING:', 'URGENT:', 'SHARE IMMEDIATELY', 'DOCTORS HATE THIS',
      'GOVERNMENT DOESN\'T WANT YOU TO KNOW', 'MIRACLE CURE', 'SHOCKING TRUTH'
    ];
    
    const foundPatterns = suspiciousPatterns.filter(pattern =>
      content.toUpperCase().includes(pattern)
    );
    
    const fallbackResult = {
      is_misinformation: foundPatterns.length > 0,
      confidence_score: foundPatterns.length > 0 ? 0.6 : 0.0,
      explanation: `AI analysis unavailable (${error.code || 'UNKNOWN_ERROR'}): ${error.message}. Basic pattern analysis performed.`,
      reasoning_steps: [
        'AI service connection failed - performing basic analysis',
        `Checked for ${crisisKeywords.length} crisis keywords, found: ${foundKeywords.length}`,
        `Checked for ${suspiciousPatterns.length} suspicious patterns, found: ${foundPatterns.length}`,
        'Flagging for manual expert review due to AI unavailability'
      ],
      red_flags: [
        'ai_service_unavailable',
        ...foundPatterns.map(pattern => `suspicious_pattern: ${pattern}`),
        ...(foundKeywords.length > 2 ? ['multiple_crisis_keywords'] : [])
      ],
      sources_needed: ['manual_verification_required', 'expert_review', 'official_sources'],
      crisis_context: {
        urgency_level: foundKeywords.length > 2 ? 'high' : foundKeywords.length > 0 ? 'medium' : 'low',
        harm_category: foundKeywords.some(k => ['health', 'medical', 'cure'].includes(k)) ? 'health' : 
                      foundKeywords.some(k => ['emergency', 'disaster', 'evacuation'].includes(k)) ? 'safety' :
                      foundKeywords.some(k => ['scam', 'fraud'].includes(k)) ? 'financial' : 'general',
        crisis_keywords_found: foundKeywords,
        potential_harm: foundKeywords.length > 0 ? 
          'Potential crisis-related content requires immediate verification' : 
          'No immediate harm detected in basic analysis'
      },
      uncertainty_flags: [
        'ai_analysis_failed', 
        'needs_human_review', 
        'basic_pattern_analysis_only',
        error.code || 'unknown_error'
      ],
      processing_time_ms: 0,
      model_version: 'fallback',
      analysis_timestamp: new Date().toISOString(),
      error: true,
      error_code: error.code || 'AI_SERVICE_UNAVAILABLE',
      error_message: error.message,
      fallback: true
    };
    
    // Add quality score for fallback
    fallbackResult.analysis_quality = this._calculateAnalysisQuality(fallbackResult);
    
    return fallbackResult;
  }
}

module.exports = new AIService();