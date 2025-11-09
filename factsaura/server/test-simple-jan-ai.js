// Simple Jan AI test
const aiService = require('./services/aiService');

async function simpleTest() {
    console.log('🔍 Simple Jan AI Test...');

    try {
        // Test basic connection
        console.log('\n1. Testing basic connection...');
        const isConnected = await aiService.testConnection();
        console.log('Connection:', isConnected ? '✅ Success' : '❌ Failed');

        // Check models
        console.log('\n2. Checking available models...');
        const modelStatus = await aiService.checkModelAvailability();
        console.log('Available model:', modelStatus.model_id);

        if (modelStatus.available) {
            console.log('\n3. Testing simple chat request...');

            // Make a very simple request
            const response = await aiService.janAIClient.post('/v1/chat/completions', {
                model: modelStatus.model_id,
                messages: [
                    {
                        role: 'user',
                        content: 'Say hello in one word.'
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            });

            console.log('✅ Simple chat successful!');
            console.log('Response:', response.data.choices[0].message.content);

        } else {
            console.log('❌ No model available for testing');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

simpleTest().then(() => {
    console.log('\n✨ Simple test completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
});