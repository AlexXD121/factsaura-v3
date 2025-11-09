// Test script to verify Jan AI connection
const aiService = require('./services/aiService');

async function testJanAIConnection() {
  console.log('🔍 Testing Jan AI connection...');
  console.log(`Host: ${aiService.janAIHost}`);
  console.log(`Port: ${aiService.janAIPort}`);
  console.log(`Endpoint: ${aiService.janAIEndpoint}`);
  console.log(`Model: ${aiService.janAIModel}`);
  console.log(`API Key: ${aiService.janAIApiKey ? '***configured***' : 'not set'}`);
  
  try {
    // Test connection
    console.log('\n1. Testing connection...');
    const isConnected = await aiService.testConnection();
    
    // Check model availability
    console.log('\n2. Checking model availability...');
    const modelStatus = await aiService.checkModelAvailability();
    console.log('📋 Model Status:');
    console.log(JSON.stringify(modelStatus, null, 2));
    
    if (isConnected && modelStatus.available) {
      console.log('✅ Jan AI connection successful!');
      console.log('✅ Model is available and ready!');
      
      // Test content analysis
      console.log('\n3. Testing content analysis...');
      const testContent = 'Breaking: Scientists discover that drinking water prevents dehydration. This is a major breakthrough in health research.';
      
      const analysis = await aiService.analyzeContent(testContent);
      console.log('📊 Analysis result:');
      console.log(JSON.stringify(analysis, null, 2));
      
      // Test confidence breakdown
      console.log('\n4. Testing confidence breakdown...');
      const breakdown = aiService.getConfidenceBreakdown(analysis);
      console.log('📈 Confidence breakdown:');
      console.log(JSON.stringify(breakdown, null, 2));
      
      // Test chat response
      console.log('\n5. Testing chat response...');
      const chatResponse = await aiService.chatResponse('Is this information reliable?', {
        post_content: testContent
      });
      console.log('💬 Chat response:');
      console.log(JSON.stringify(chatResponse, null, 2));
      
      console.log('\n🎉 All tests completed successfully!');
      
    } else {
      if (!isConnected) {
        console.log('❌ Jan AI connection failed');
        console.log('💡 Make sure Jan AI is running on 127.0.0.1:1337');
        console.log('💡 Check if the API server is started in Jan AI settings');
      } else if (!modelStatus.available) {
        console.log('⚠️  Jan AI connected but model not available');
        console.log(`💡 Make sure the model "${aiService.janAIModel}" is loaded`);
        console.log('💡 Available models:', modelStatus.all_models.join(', ') || 'none');
        console.log('💡 The model is currently downloading - wait for it to complete');
      }
      
      // Test fallback functionality
      console.log('\n🔄 Testing fallback functionality...');
      const testContent = 'Emergency flood warning for Mumbai - evacuate immediately!';
      const analysis = await aiService.analyzeContent(testContent);
      console.log('📊 Fallback analysis result:');
      console.log(JSON.stringify(analysis, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔄 Testing fallback functionality...');
    const testContent = 'Emergency flood warning for Mumbai - evacuate immediately!';
    const analysis = await aiService.analyzeContent(testContent);
    console.log('📊 Fallback analysis result:');
    console.log(JSON.stringify(analysis, null, 2));
  }
}

// Run the test
testJanAIConnection().then(() => {
  console.log('\n✨ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});