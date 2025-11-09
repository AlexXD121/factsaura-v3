#!/usr/bin/env node

// Test script for basic content analysis function
require('dotenv').config();
const aiService = require('./services/aiService');

async function testBasicAnalysis() {
  console.log('🧪 Testing Basic Content Analysis Function\n');
  
  // Test cases with different types of content
  const testCases = [
    {
      name: 'Crisis-related content',
      content: 'URGENT: Mumbai floods getting worse! Government hiding real death toll. Share immediately to save lives!'
    },
    {
      name: 'Medical misinformation',
      content: 'Drinking hot water with lemon cures COVID-19. Doctors don\'t want you to know this simple trick!'
    },
    {
      name: 'Normal news content',
      content: 'The weather forecast for tomorrow shows partly cloudy skies with a high of 25°C according to the meteorological department.'
    },
    {
      name: 'Empty content test',
      content: ''
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Content: "${testCase.content}"`);
    console.log('─'.repeat(50));
    
    try {
      const result = await aiService.analyzeContentBasic(testCase.content);
      
      console.log(`✅ Analysis Result:`);
      console.log(`   Misinformation: ${result.is_misinformation}`);
      console.log(`   Confidence: ${(result.confidence_score * 100).toFixed(1)}%`);
      console.log(`   Quality Score: ${(result.analysis_quality * 100).toFixed(1)}%`);
      console.log(`   Explanation: ${result.explanation}`);
      
      if (result.reasoning_steps && result.reasoning_steps.length > 0) {
        console.log(`   Reasoning Steps:`);
        result.reasoning_steps.forEach((step, index) => {
          console.log(`     ${index + 1}. ${step}`);
        });
      }
      
      if (result.red_flags && result.red_flags.length > 0) {
        console.log(`   Red Flags: ${result.red_flags.join(', ')}`);
      }
      
      if (result.crisis_context) {
        console.log(`   Crisis Context:`);
        console.log(`     Urgency: ${result.crisis_context.urgency_level}`);
        console.log(`     Category: ${result.crisis_context.harm_category}`);
        if (result.crisis_context.crisis_keywords_found.length > 0) {
          console.log(`     Keywords: ${result.crisis_context.crisis_keywords_found.join(', ')}`);
        }
      }
      
      console.log(`   Processing Time: ${result.processing_time_ms}ms`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Basic analysis testing completed!');
}

// Test connection first
async function testConnection() {
  console.log('🔌 Testing Jan AI Connection...');
  
  const isConnected = await aiService.testConnection();
  console.log(`Connection Status: ${isConnected ? '✅ Connected' : '❌ Failed'}`);
  
  const modelCheck = await aiService.checkModelAvailability();
  console.log(`Model Status: ${modelCheck.available ? '✅ Available' : '❌ Not Available'}`);
  
  if (modelCheck.available) {
    console.log(`Using Model: ${modelCheck.model_id}`);
  } else {
    console.log('Available Models:', modelCheck.all_models);
    console.log('⚠️  Will use fallback analysis');
  }
  
  return isConnected && modelCheck.available;
}

// Run tests
async function runTests() {
  try {
    await testConnection();
    console.log('\n' + '='.repeat(60));
    await testBasicAnalysis();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testBasicAnalysis, testConnection };