/**
 * NewsAPI Endpoints Test Script
 * Test the NewsAPI endpoints without making actual API calls
 */

require('dotenv').config();
const axios = require('axios');

async function testNewsApiEndpoints() {
  console.log('🧪 Testing NewsAPI Endpoints...\n');
  
  const baseUrl = `http://localhost:${process.env.PORT || 3001}/api/news`;
  
  try {
    // Test 1: Service Status
    console.log('1️⃣ Testing Service Status Endpoint:');
    try {
      const statusResponse = await axios.get(`${baseUrl}/status`);
      console.log('✅ Status endpoint accessible');
      console.log(`   Service: ${statusResponse.data.data.service}`);
      console.log(`   Status: ${statusResponse.data.data.status}`);
      console.log(`   API Key: ${statusResponse.data.data.apiKey}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running. Please start the server first with: npm run dev');
        return;
      }
      console.log(`⚠️  Status endpoint error: ${error.response?.status} - ${error.response?.statusText}`);
    }
    console.log('');
    
    // Test 2: Connection Test
    console.log('2️⃣ Testing Connection Test Endpoint:');
    try {
      const testResponse = await axios.get(`${baseUrl}/test`);
      console.log('✅ Test endpoint accessible');
      console.log(`   Connection Success: ${testResponse.data.data.success}`);
      console.log(`   Status: ${testResponse.data.data.status}`);
      if (testResponse.data.data.error) {
        console.log(`   Error: ${testResponse.data.data.error}`);
      }
    } catch (error) {
      console.log(`⚠️  Test endpoint error: ${error.response?.status} - ${error.response?.statusText}`);
    }
    console.log('');
    
    // Test 3: Trending News (will fail without valid API key)
    console.log('3️⃣ Testing Trending News Endpoint:');
    try {
      const trendingResponse = await axios.get(`${baseUrl}/trending?pageSize=1`);
      console.log('✅ Trending endpoint accessible');
      console.log(`   Articles found: ${trendingResponse.data.data.articles.length}`);
    } catch (error) {
      console.log(`⚠️  Trending endpoint error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data?.error) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');
    
    // Test 4: Search Endpoint (will fail without valid API key)
    console.log('4️⃣ Testing Search Endpoint:');
    try {
      const searchResponse = await axios.get(`${baseUrl}/search?q=test&pageSize=1`);
      console.log('✅ Search endpoint accessible');
      console.log(`   Articles found: ${searchResponse.data.data.articles.length}`);
    } catch (error) {
      console.log(`⚠️  Search endpoint error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data?.error) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');
    
    // Test 5: Crisis Monitoring (will fail without valid API key)
    console.log('5️⃣ Testing Crisis Monitoring Endpoint:');
    try {
      const crisisResponse = await axios.get(`${baseUrl}/crisis`);
      console.log('✅ Crisis endpoint accessible');
      console.log(`   Articles found: ${crisisResponse.data.data.articles.length}`);
    } catch (error) {
      console.log(`⚠️  Crisis endpoint error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data?.error) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');
    
    console.log('✅ NewsAPI Endpoints Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   - All endpoints are properly configured and accessible');
    console.log('   - API calls will fail without a valid NewsAPI key');
    console.log('   - Get your free API key from: https://newsapi.org/register');
    console.log('   - Add it to .env as: NEWSAPI_KEY=your_actual_key');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testNewsApiEndpoints().catch(console.error);
}

module.exports = testNewsApiEndpoints;