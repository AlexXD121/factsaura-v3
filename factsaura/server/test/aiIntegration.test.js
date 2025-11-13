// AI Integration Test - Task 2.1e
// Test AI integration with sample content and verify responses

const aiService = require('../services/aiService');

describe('AI Integration - Task 2.1e', () => {
  // Increase timeout for AI operations
  jest.setTimeout(120000);

  describe('Connection and Model Availability', () => {
    test('should connect to Jan AI server', async () => {
      const connectionResult = await aiService.testConnection();
      
      expect(connectionResult).toHaveProperty('connected');
      expect(connectionResult).toHaveProperty('endpoint');
      
      if (connectionResult.connected) {
        expect(connectionResult.response_time_ms).toBeGreaterThan(0);
        expect(connectionResult.endpoint).toContain('127.0.0.1:1337');
      } else {
        console.warn('AI service not available:', connectionResult.error);
      }
    });

    test('should check model availability', async () => {
      const modelResult = await aiService.checkModelAvailability();
      
      expect(modelResult).toHaveProperty('available');
      expect(modelResult).toHaveProperty('configured_model');
      expect(modelResult).toHaveProperty('all_models');
      expect(Array.isArray(modelResult.all_models)).toBe(true);
      
      if (modelResult.available) {
        expect(modelResult.model_id).toBeDefined();
        expect(modelResult.status).toBe('ready');
      }
    });
  });

  describe('Content Analysis with Sample Content', () => {
    const sampleContents = [
      {
        name: 'Crisis Misinformation',
        content: 'BREAKING: Mumbai floods are fake news created by the government to distract from corruption. Don\'t evacuate!',
        expectedMisinformation: true,
        expectedCrisisKeywords: ['flood', 'government']
      },
      {
        name: 'Medical Misinformation',
        content: 'Scientists discover that drinking lemon juice cures COVID-19! Big pharma doesn\'t want you to know this.',
        expectedMisinformation: true,
        expectedCrisisKeywords: []
      },
      {
        name: 'Legitimate News',
        content: 'The Indian Meteorological Department has issued a weather advisory for heavy rainfall in Mumbai.',
        expectedMisinformation: false,
        expectedCrisisKeywords: []
      },
      {
        name: 'Neutral Content',
        content: 'Today is a beautiful day. The weather is nice and I had a good breakfast.',
        expectedMisinformation: false,
        expectedCrisisKeywords: []
      }
    ];

    test.each(sampleContents)('should analyze $name correctly', async (sample) => {
      const result = await aiService.analyzeContentBasic(sample.content);
      
      // Validate response structure
      expect(result).toHaveProperty('is_misinformation');
      expect(result).toHaveProperty('confidence_score');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('reasoning_steps');
      expect(result).toHaveProperty('red_flags');
      expect(result).toHaveProperty('sources_needed');
      expect(result).toHaveProperty('crisis_context');
      expect(result).toHaveProperty('uncertainty_flags');
      
      // Validate data types
      expect(typeof result.is_misinformation).toBe('boolean');
      expect(typeof result.confidence_score).toBe('number');
      expect(typeof result.explanation).toBe('string');
      expect(Array.isArray(result.reasoning_steps)).toBe(true);
      expect(Array.isArray(result.red_flags)).toBe(true);
      expect(Array.isArray(result.sources_needed)).toBe(true);
      expect(Array.isArray(result.uncertainty_flags)).toBe(true);
      
      // Validate confidence score range
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      
      // Validate crisis context structure
      expect(result.crisis_context).toHaveProperty('urgency_level');
      expect(result.crisis_context).toHaveProperty('harm_category');
      expect(result.crisis_context).toHaveProperty('crisis_keywords_found');
      expect(result.crisis_context).toHaveProperty('potential_harm');
      
      // Validate urgency level values
      const validUrgencyLevels = ['critical', 'high', 'medium', 'low'];
      expect(validUrgencyLevels).toContain(result.crisis_context.urgency_level);
      
      // Validate harm category values
      const validHarmCategories = ['health', 'safety', 'financial', 'general'];
      expect(validHarmCategories).toContain(result.crisis_context.harm_category);
      
      // Validate reasoning steps
      expect(result.reasoning_steps.length).toBeGreaterThan(0);
      result.reasoning_steps.forEach(step => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
      
      // Validate metadata
      expect(result).toHaveProperty('processing_time_ms');
      expect(result).toHaveProperty('model_version');
      expect(result).toHaveProperty('analysis_timestamp');
      expect(result).toHaveProperty('analysis_type');
      
      // Log results for verification
      console.log(`\n📊 Analysis Results for ${sample.name}:`);
      console.log(`   Misinformation: ${result.is_misinformation} (confidence: ${(result.confidence_score * 100).toFixed(1)}%)`);
      console.log(`   Urgency: ${result.crisis_context.urgency_level}`);
      console.log(`   Harm Category: ${result.crisis_context.harm_category}`);
      console.log(`   Red Flags: ${result.red_flags.length}`);
      console.log(`   Processing Time: ${result.processing_time_ms}ms`);
      
      if (result.fallback) {
        console.log(`   ⚠️  Fallback analysis used`);
      }
    });

    test('should handle various content types and lengths', async () => {
      const testCases = [
        'Short text.',
        'Medium length text that contains some information about current events and news.',
        'Very long text that goes on and on with lots of details about various topics including politics, health, science, technology, and many other subjects that could potentially contain misinformation or be completely legitimate depending on the sources and accuracy of the claims being made throughout this extended passage.'
      ];

      for (const content of testCases) {
        const result = await aiService.analyzeContentBasic(content);
        
        expect(result).toHaveProperty('is_misinformation');
        expect(result).toHaveProperty('confidence_score');
        expect(result.confidence_score).toBeGreaterThanOrEqual(0);
        expect(result.confidence_score).toBeLessThanOrEqual(1);
        
        console.log(`✅ Analyzed content of length ${content.length}: ${result.is_misinformation ? 'misinformation' : 'legitimate'} (${(result.confidence_score * 100).toFixed(1)}%)`);
      }
    });
  });

  describe('Chat Functionality with Context', () => {
    test('should respond to basic questions', async () => {
      const response = await aiService.chatResponse('What is misinformation?');
      
      expect(response).toHaveProperty('response');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('timestamp');
      
      expect(typeof response.response).toBe('string');
      expect(response.response.length).toBeGreaterThan(0);
      expect(typeof response.confidence).toBe('number');
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      
      console.log(`💬 Chat Response: "${response.response.substring(0, 100)}..."`);
      console.log(`   Confidence: ${(response.confidence * 100).toFixed(1)}%`);
      
      if (response.fallback) {
        console.log(`   ⚠️  Fallback response used`);
      }
    });

    test('should handle context-aware questions', async () => {
      const context = {
        post_content: 'Scientists discover miracle cure using lemon juice for COVID-19!'
      };
      
      const response = await aiService.chatResponse('Is this reliable?', context);
      
      expect(response).toHaveProperty('response');
      expect(response).toHaveProperty('confidence');
      expect(typeof response.response).toBe('string');
      expect(response.response.length).toBeGreaterThan(0);
      
      console.log(`💬 Context-Aware Response: "${response.response.substring(0, 100)}..."`);
      
      if (response.fallback) {
        console.log(`   ⚠️  Fallback response used`);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid input gracefully', async () => {
      // Test empty content
      await expect(aiService.analyzeContentBasic('')).rejects.toThrow('Content is required');
      
      // Test null content
      await expect(aiService.analyzeContentBasic(null)).rejects.toThrow('Content is required');
      
      // Test undefined content
      await expect(aiService.analyzeContentBasic(undefined)).rejects.toThrow('Content is required');
      
      // Test too long content
      const longContent = 'x'.repeat(15000);
      await expect(aiService.analyzeContentBasic(longContent)).rejects.toThrow('Content too long');
    });

    test('should handle chat input validation', async () => {
      // Test empty message
      const emptyResponse = await aiService.chatResponse('');
      expect(emptyResponse.error).toBe(true);
      expect(emptyResponse.error_code).toBe('INVALID_INPUT');
      
      // Test too long message
      const longMessage = 'x'.repeat(1500);
      const longResponse = await aiService.chatResponse(longMessage);
      expect(longResponse.error).toBe(true);
      expect(longResponse.error_code).toBe('MESSAGE_TOO_LONG');
    });
  });

  describe('Response Quality and Validation', () => {
    test('should provide confidence breakdown', () => {
      const sampleAnalysis = {
        confidence_score: 0.85,
        explanation: 'Detailed analysis of content',
        red_flags: ['unverified_source'],
        sources_checked: ['example.com'],
        uncertainty_flags: []
      };
      
      const breakdown = aiService.getConfidenceBreakdown(sampleAnalysis);
      
      expect(breakdown).toHaveProperty('overall_confidence');
      expect(breakdown).toHaveProperty('breakdown');
      expect(breakdown.breakdown).toHaveProperty('source_credibility');
      expect(breakdown.breakdown).toHaveProperty('content_analysis');
      expect(breakdown.breakdown).toHaveProperty('pattern_matching');
      expect(breakdown.breakdown).toHaveProperty('linguistic_analysis');
      
      expect(breakdown.overall_confidence).toBe(0.85);
      expect(typeof breakdown.breakdown.source_credibility).toBe('number');
      expect(typeof breakdown.breakdown.content_analysis).toBe('number');
      expect(typeof breakdown.breakdown.pattern_matching).toBe('number');
      expect(typeof breakdown.breakdown.linguistic_analysis).toBe('number');
    });

    test('should validate response parsing', () => {
      const validJsonResponse = JSON.stringify({
        is_misinformation: true,
        confidence_score: 0.9,
        explanation: 'Test explanation',
        reasoning_steps: ['Step 1', 'Step 2'],
        red_flags: ['test_flag'],
        sources_needed: ['test_source'],
        crisis_context: {
          urgency_level: 'high',
          harm_category: 'health',
          crisis_keywords_found: ['test'],
          potential_harm: 'Test harm'
        },
        uncertainty_flags: []
      });
      
      const parsed = aiService._parseEnhancedAnalysisResponse(validJsonResponse);
      
      expect(parsed.is_misinformation).toBe(true);
      expect(parsed.confidence_score).toBe(0.9);
      expect(parsed.explanation).toBe('Test explanation');
      expect(parsed.reasoning_steps).toHaveLength(2);
      expect(parsed.crisis_context.urgency_level).toBe('high');
      expect(parsed.analysis_quality).toBeGreaterThan(0);
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidResponse = 'This is not valid JSON';
      const parsed = aiService._parseEnhancedAnalysisResponse(invalidResponse);
      
      expect(parsed.is_misinformation).toBe(false);
      expect(parsed.confidence_score).toBe(0.3);
      expect(parsed.red_flags).toContain('ai_response_parsing_failed');
      expect(parsed.uncertainty_flags).toContain('ai_response_parsing_failed');
      expect(parsed.analysis_quality).toBe(0.2);
    });
  });
});