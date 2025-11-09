#!/usr/bin/env node

// Simple test for basic content analysis function components
require('dotenv').config();
const aiService = require('./services/aiService');

async function testAnalysisComponents() {
  console.log('🧪 Testing Analysis Function Components\n');
  
  // Test 1: Prompt building
  console.log('📝 Test 1: Prompt Building');
  const testContent = 'URGENT: Mumbai floods getting worse! Government hiding real death toll.';
  const prompt = aiService._buildBasicAnalysisPrompt(testContent, {});
  console.log('✅ Prompt generated successfully');
  console.log(`   Length: ${prompt.length} characters`);
  console.log(`   Contains content: ${prompt.includes(testContent) ? '✅' : '❌'}`);
  console.log(`   Contains JSON format: ${prompt.includes('is_misinformation') ? '✅' : '❌'}`);
  console.log(`   Contains reasoning steps: ${prompt.includes('reasoning_steps') ? '✅' : '❌'}`);
  
  // Test 2: Response parsing with valid JSON
  console.log('\n📝 Test 2: Response Parsing (Valid JSON)');
  const validResponse = JSON.stringify({
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
  
  const parsed = aiService._parseEnhancedAnalysisResponse(validResponse);
  console.log('✅ Valid JSON parsed successfully');
  console.log(`   Misinformation detected: ${parsed.is_misinformation}`);
  console.log(`   Confidence: ${(parsed.confidence_score * 100).toFixed(1)}%`);
  console.log(`   Quality score: ${(parsed.analysis_quality * 100).toFixed(1)}%`);
  console.log(`   Reasoning steps: ${parsed.reasoning_steps.length}`);
  console.log(`   Crisis level: ${parsed.crisis_context.urgency_level}`);
  
  // Test 3: Response parsing with invalid JSON
  console.log('\n📝 Test 3: Response Parsing (Invalid JSON)');
  const invalidResponse = 'This is not valid JSON but contains some analysis text';
  const parsedInvalid = aiService._parseEnhancedAnalysisResponse(invalidResponse);
  console.log('✅ Invalid JSON handled gracefully');
  console.log(`   Fallback confidence: ${(parsedInvalid.confidence_score * 100).toFixed(1)}%`);
  console.log(`   Quality score: ${(parsedInvalid.analysis_quality * 100).toFixed(1)}%`);
  console.log(`   Has reasoning steps: ${parsedInvalid.reasoning_steps.length > 0 ? '✅' : '❌'}`);
  
  // Test 4: Fallback analysis
  console.log('\n📝 Test 4: Fallback Analysis');
  const fallback = aiService._getFallbackAnalysis(testContent, new Error('Test error'));
  console.log('✅ Fallback analysis generated');
  console.log(`   Crisis keywords detected: ${fallback.crisis_context.crisis_keywords_found.length}`);
  console.log(`   Quality score: ${(fallback.analysis_quality * 100).toFixed(1)}%`);
  console.log(`   Has reasoning: ${fallback.reasoning_steps.length > 0 ? '✅' : '❌'}`);
  
  // Test 5: Input validation
  console.log('\n📝 Test 5: Input Validation');
  try {
    await aiService.analyzeContentBasic('');
    console.log('❌ Empty content should throw error');
  } catch (error) {
    console.log('✅ Empty content validation works');
    console.log(`   Error message: ${error.message}`);
  }
  
  try {
    await aiService.analyzeContentBasic(null);
    console.log('❌ Null content should throw error');
  } catch (error) {
    console.log('✅ Null content validation works');
  }
  
  // Test 6: Validation helpers
  console.log('\n📝 Test 6: Validation Helpers');
  console.log(`   Valid urgency level: ${aiService._validateUrgencyLevel('high')}`);
  console.log(`   Invalid urgency level: ${aiService._validateUrgencyLevel('invalid')}`);
  console.log(`   Valid harm category: ${aiService._validateHarmCategory('health')}`);
  console.log(`   Invalid harm category: ${aiService._validateHarmCategory('invalid')}`);
  
  const testSteps = ['Step 1', 'Step 2', 'Step 3'];
  const validatedSteps = aiService._validateReasoningSteps(testSteps);
  console.log(`   Reasoning steps validation: ${validatedSteps.length === 3 ? '✅' : '❌'}`);
  
  console.log('\n🏁 Component testing completed successfully!');
}

// Run component tests
if (require.main === module) {
  testAnalysisComponents().catch(console.error);
}

module.exports = { testAnalysisComponents };