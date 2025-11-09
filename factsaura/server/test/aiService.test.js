// Test file for AI Service
const aiService = require('../services/aiService');

describe('AIService', () => {
  describe('Connection Test', () => {
    test('should have correct Jan AI endpoint configuration', () => {
      expect(aiService.janAIEndpoint).toBeDefined();
      expect(aiService.janAIEndpoint).toContain('127.0.0.1:1337');
      expect(aiService.janAIHost).toBe('127.0.0.1');
      expect(aiService.janAIPort).toBe('1337');
      expect(aiService.janAIModel).toBe('Meta-Llama-3_1-8B-Instruct-IQ4_XS');
    });

    test('should have timeout configuration', () => {
      expect(aiService.timeout).toBeDefined();
      expect(typeof aiService.timeout).toBe('number');
    });

    test('should have confidence threshold configuration', () => {
      expect(aiService.confidenceThreshold).toBeDefined();
      expect(typeof aiService.confidenceThreshold).toBe('number');
    });
  });

  describe('Fallback Analysis', () => {
    test('should return fallback analysis when AI fails', async () => {
      const testContent = 'This is test content with flood emergency keywords';
      
      // Mock a failed AI call by testing the fallback directly
      const fallback = aiService._getFallbackAnalysis(testContent, new Error('Connection failed'));
      
      expect(fallback).toHaveProperty('is_misinformation', false);
      expect(fallback).toHaveProperty('confidence_score', 0.0);
      expect(fallback).toHaveProperty('explanation');
      expect(fallback).toHaveProperty('red_flags');
      expect(fallback).toHaveProperty('crisis_context');
      expect(fallback.crisis_context).toHaveProperty('urgency_level');
      expect(fallback.crisis_context).toHaveProperty('harm_category');
      expect(fallback.crisis_context).toHaveProperty('crisis_keywords_found');
    });
  });

  describe('Confidence Breakdown', () => {
    test('should generate confidence breakdown from analysis', () => {
      const mockAnalysis = {
        confidence_score: 0.8,
        explanation: 'Test analysis',
        red_flags: ['test_flag'],
        sources_checked: ['test_source']
      };
      
      const breakdown = aiService.getConfidenceBreakdown(mockAnalysis);
      
      expect(breakdown).toHaveProperty('overall_confidence', 0.8);
      expect(breakdown).toHaveProperty('breakdown');
      expect(breakdown.breakdown).toHaveProperty('source_credibility');
      expect(breakdown.breakdown).toHaveProperty('content_analysis');
      expect(breakdown.breakdown).toHaveProperty('pattern_matching');
      expect(breakdown.breakdown).toHaveProperty('linguistic_analysis');
    });

    test('should handle missing analysis data', () => {
      const breakdown = aiService.getConfidenceBreakdown(null);
      
      expect(breakdown.overall_confidence).toBe(0);
      expect(breakdown.explanation).toBe('No analysis data available');
    });
  });

  describe('Basic Content Analysis', () => {
    test('should validate input content', async () => {
      await expect(aiService.analyzeContentBasic('')).rejects.toThrow('Content is required and must be a non-empty string');
      await expect(aiService.analyzeContentBasic(null)).rejects.toThrow('Content is required and must be a non-empty string');
      await expect(aiService.analyzeContentBasic(undefined)).rejects.toThrow('Content is required and must be a non-empty string');
    });

    test('should return fallback analysis when model unavailable', async () => {
      // Mock checkModelAvailability to return unavailable
      const originalCheck = aiService.checkModelAvailability;
      aiService.checkModelAvailability = jest.fn().mockResolvedValue({ available: false });
      
      const result = await aiService.analyzeContentBasic('Test content');
      
      expect(result.error).toBe(true);
      expect(result.model_version).toBe('fallback');
      expect(result.analysis_quality).toBeDefined();
      expect(result.reasoning_steps).toHaveLength(3);
      
      // Restore original method
      aiService.checkModelAvailability = originalCheck;
    });
  });

  describe('Validation Helpers', () => {
    test('should validate urgency levels', () => {
      expect(aiService._validateUrgencyLevel('critical')).toBe('critical');
      expect(aiService._validateUrgencyLevel('high')).toBe('high');
      expect(aiService._validateUrgencyLevel('medium')).toBe('medium');
      expect(aiService._validateUrgencyLevel('low')).toBe('low');
      expect(aiService._validateUrgencyLevel('invalid')).toBe('medium');
      expect(aiService._validateUrgencyLevel(null)).toBe('medium');
    });

    test('should validate harm categories', () => {
      expect(aiService._validateHarmCategory('health')).toBe('health');
      expect(aiService._validateHarmCategory('safety')).toBe('safety');
      expect(aiService._validateHarmCategory('financial')).toBe('financial');
      expect(aiService._validateHarmCategory('general')).toBe('general');
      expect(aiService._validateHarmCategory('invalid')).toBe('general');
      expect(aiService._validateHarmCategory(null)).toBe('general');
    });

    test('should validate reasoning steps', () => {
      const validSteps = ['Step 1', 'Step 2', 'Step 3'];
      expect(aiService._validateReasoningSteps(validSteps)).toEqual(validSteps);
      
      const defaultSteps = aiService._validateReasoningSteps([]);
      expect(defaultSteps).toHaveLength(4);
      expect(defaultSteps[0]).toContain('Content analyzed');
      
      const nullSteps = aiService._validateReasoningSteps(null);
      expect(nullSteps).toHaveLength(4);
    });

    test('should calculate analysis quality', () => {
      const highQualityAnalysis = {
        explanation: 'Detailed explanation with more than 20 characters',
        reasoning_steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
        red_flags: ['flag1', 'flag2'],
        sources_needed: ['source1'],
        crisis_context: { potential_harm: 'Specific harm description' },
        uncertainty_flags: [],
        confidence_score: 0.8
      };
      
      const quality = aiService._calculateAnalysisQuality(highQualityAnalysis);
      expect(quality).toBeGreaterThan(0.8);
      
      const lowQualityAnalysis = {
        explanation: 'Short',
        reasoning_steps: [],
        red_flags: [],
        sources_needed: [],
        crisis_context: { potential_harm: 'No specific harm identified' },
        uncertainty_flags: ['flag1', 'flag2', 'flag3'],
        confidence_score: 0.2
      };
      
      const lowQuality = aiService._calculateAnalysisQuality(lowQualityAnalysis);
      expect(lowQuality).toBeLessThan(0.5);
    });
  });

  describe('Prompt Building', () => {
    test('should build basic analysis prompt correctly', () => {
      const content = 'Test content with emergency keywords';
      const prompt = aiService._buildBasicAnalysisPrompt(content, {});
      
      expect(prompt).toContain(content);
      expect(prompt).toContain('FactSaura AI');
      expect(prompt).toContain('DETECTION FRAMEWORK');
      expect(prompt).toContain('reasoning_steps');
      expect(prompt).toContain('crisis_context');
      expect(prompt).toContain('potential_harm');
    });

    test('should build analysis prompt correctly (legacy)', () => {
      const content = 'Test content';
      const prompt = aiService._buildAnalysisPrompt(content, {});
      
      expect(prompt).toContain(content);
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('is_misinformation');
      expect(prompt).toContain('confidence_score');
    });

    test('should build chat prompt correctly', () => {
      const message = 'Is this true?';
      const context = { post_content: 'Test post content' };
      const prompt = aiService._buildChatPrompt(message, context);
      
      expect(prompt).toContain(message);
      expect(prompt).toContain(context.post_content);
    });
  });

  describe('Enhanced Response Parsing', () => {
    test('should parse enhanced JSON response with reasoning steps', () => {
      const validResponse = JSON.stringify({
        is_misinformation: true,
        confidence_score: 0.9,
        explanation: 'Test explanation with detailed analysis',
        reasoning_steps: [
          'Step 1: Analyzed claims',
          'Step 2: Checked sources',
          'Step 3: Evaluated crisis context'
        ],
        red_flags: ['test_flag'],
        sources_needed: ['test_source'],
        crisis_context: {
          urgency_level: 'high',
          harm_category: 'health',
          crisis_keywords_found: ['emergency'],
          potential_harm: 'Could cause public panic'
        },
        uncertainty_flags: []
      });
      
      const parsed = aiService._parseEnhancedAnalysisResponse(validResponse);
      
      expect(parsed.is_misinformation).toBe(true);
      expect(parsed.confidence_score).toBe(0.9);
      expect(parsed.explanation).toBe('Test explanation with detailed analysis');
      expect(parsed.reasoning_steps).toHaveLength(3);
      expect(parsed.crisis_context.urgency_level).toBe('high');
      expect(parsed.crisis_context.potential_harm).toBe('Could cause public panic');
      expect(parsed.analysis_quality).toBeGreaterThan(0.8);
    });

    test('should handle invalid JSON response with enhanced fallback', () => {
      const invalidResponse = 'This is not valid JSON';
      const parsed = aiService._parseEnhancedAnalysisResponse(invalidResponse);
      
      expect(parsed.is_misinformation).toBe(false);
      expect(parsed.confidence_score).toBe(0.3);
      expect(parsed.red_flags).toContain('ai_response_parsing_failed');
      expect(parsed.uncertainty_flags).toContain('ai_response_parsing_failed');
      expect(parsed.reasoning_steps).toHaveLength(3);
      expect(parsed.analysis_quality).toBe(0.2);
    });
  });

  describe('Response Parsing (Legacy)', () => {
    test('should parse valid JSON response', () => {
      const validResponse = JSON.stringify({
        is_misinformation: true,
        confidence_score: 0.9,
        explanation: 'Test explanation',
        red_flags: ['test_flag'],
        sources_needed: ['test_source'],
        crisis_context: {
          urgency_level: 'high',
          harm_category: 'health',
          crisis_keywords_found: ['emergency']
        },
        uncertainty_flags: []
      });
      
      const parsed = aiService._parseAnalysisResponse(validResponse);
      
      expect(parsed.is_misinformation).toBe(true);
      expect(parsed.confidence_score).toBe(0.9);
      expect(parsed.explanation).toBe('Test explanation');
      expect(parsed.crisis_context.urgency_level).toBe('high');
    });

    test('should handle invalid JSON response', () => {
      const invalidResponse = 'This is not valid JSON';
      const parsed = aiService._parseAnalysisResponse(invalidResponse);
      
      expect(parsed.is_misinformation).toBe(false);
      expect(parsed.confidence_score).toBe(0.5);
      expect(parsed.red_flags).toContain('parsing_error');
      expect(parsed.uncertainty_flags).toContain('ai_response_parsing_failed');
    });
  });
});