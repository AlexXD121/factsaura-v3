#!/usr/bin/env node

// Integration test for basic content analysis with mock AI responses
require('dotenv').config();
const aiService = require('./services/aiService');

// Mock the Jan AI client for testing
const originalPost = aiService.janAIClient.post;

function mockAIResponse(mockResponse) {
  aiService.janAIClient.post = jest.fn().mockResolvedValue({
    data: {
      choices: [{ message: { content: mockResponse } }],
      model: 'test-model'
    }
  });
}

function restoreAIClient() {
  aiService.janAIClient.post = originalPost;
}

async function testBasicAnalysisIntegration() {
  console.log('🧪 Testing Basic Content Analysis Integration\n');
  
  // Test 1: Successful analysis with valid AI response
  console.log('📝 Test 1: Valid AI Response Integration');
  
  const mockValidResponse = JSON.stringify({
    is_misinformation: true,
    confidence_score: 0.85,
    explanation: "Content contains unverified claims about government cover-up with emotional urgency tactics",
    reasoning_steps: [
      "Step 1: Identified claims about government hiding death toll without sources",
      "Step 2: Detected emotional urgency language ('URGENT', 'Share immediately')",
      "Step 3: Found crisis keywords related to Mumbai floods",
      "Step 4: High confidence due to multiple misinformation patterns"
    ],
    red_flags: ["unverified_government_claims", "emotional_urgency", "no_sources"],
    sources_needed: ["official_government_reports", "verified_news_sources"],
    crisis_context: {
      urgency_level: "high",
      harm_category: "safety",
      crisis_keywords_found: ["floods", "urgent"],
      potential_harm: "Could cause panic or distrust in official emergency response"
    },
    uncertainty_flags: []
  });
  
  // Mock model availability check
  const originalCheck = aiService.checkModelAvailability;
  aiService.checkModelAvailability = () => Promise.resolve({ 
    available: true, 
    model_id: 'test-model' 
  });
  
  mockAIResponse(mockValidResponse);
  
  try {
    const result = await aiService.analyzeContentBasic('URGENT: Mumbai floods getting worse! Government hiding real death toll.');
    
    console.log('✅ Integration test successful');
    console.log(`   Misinformation detected: ${result.is_misinformation}`);
    console.log(`   Confidence: ${(result.confidence_score * 100).toFixed(1)}%`);
    console.log(`   Quality score: ${(result.analysis_quality * 100).toFixed(1)}%`);
    console.log(`   Reasoning steps: ${result.reasoning_steps.length}`);
    console.log(`   Crisis level: ${result.crisis_context.urgency_level}`);
    console.log(`   Processing time: ${result.processing_time_ms}ms`);
    console.log(`   Analysis type: ${result.analysis_type}`);
    
    // Validate expected fields
    if (result.is_misinformation && 
        result.confidence_score > 0.8 && 
        result.reasoning_steps.length === 4 &&
        result.crisis_context.urgency_level === 'high') {
      console.log('✅ All validation checks passed');
    } else {
      console.log('❌ Some validation checks failed');
    }
    
  } catch (error) {
    console.log(`❌ Integration test failed: ${error.message}`);
  }
  
  // Test 2: Invalid AI response handling
  console.log('\n📝 Test 2: Invalid AI Response Handling');
  
  mockAIResponse('This is not valid JSON response from AI');
  
  try {
    const result = await aiService.analyzeContentBasic('Test content for invalid response');
    
    console.log('✅ Invalid response handled gracefully');
    console.log(`   Fallback confidence: ${(result.confidence_score * 100).toFixed(1)}%`);
    console.log(`   Quality score: ${(result.analysis_quality * 100).toFixed(1)}%`);
    console.log(`   Has reasoning steps: ${result.reasoning_steps.length > 0 ? '✅' : '❌'}`);
    console.log(`   Contains parsing error flag: ${result.red_flags.includes('ai_response_parsing_failed') ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`❌ Invalid response test failed: ${error.message}`);
  }
  
  // Restore original functions
  restoreAIClient();
  aiService.checkModelAvailability = originalCheck;
  
  console.log('\n🏁 Integration testing completed!');
}

// Run integration tests
if (require.main === module) {
  // Setup Jest mock functions
  global.jest = {
    fn: () => {
      const mockFn = (...args) => mockFn.mockReturnValue;
      mockFn.mockResolvedValue = (value) => {
        mockFn.mockReturnValue = Promise.resolve(value);
        return mockFn;
      };
      return mockFn;
    }
  };
  
  testBasicAnalysisIntegration().catch(console.error);
}

module.exports = { testBasicAnalysisIntegration };