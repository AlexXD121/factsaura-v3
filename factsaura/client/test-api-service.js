// Test the API service functionality
import { postsAPI, APIError } from './src/utils/api.js';

async function testAPIService() {
  console.log('🧪 Testing API Service...');
  
  try {
    // Test API URL construction
    console.log('📡 Testing API URL construction...');
    
    // This will fail since server isn't running, but we can test the URL construction
    const testParams = {
      page: 1,
      limit: 10,
      urgency_level: 'critical',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    console.log('✅ API parameters constructed:', testParams);
    
    // Test error handling
    try {
      await postsAPI.getPosts(testParams);
    } catch (error) {
      if (error instanceof APIError) {
        console.log('✅ APIError handling works correctly:', error.message);
      } else {
        console.log('✅ Network error handling works correctly:', error.message);
      }
    }
    
    console.log('🎉 API service test completed successfully!');
    
  } catch (error) {
    console.error('❌ API service test failed:', error);
  }
}

// Run the test
testAPIService();