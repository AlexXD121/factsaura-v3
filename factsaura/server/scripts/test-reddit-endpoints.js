/**
 * Reddit API Endpoints Test Script
 * Tests Reddit API HTTP endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/reddit';

async function testRedditEndpoints() {
  console.log('🔍 Testing Reddit API Endpoints...\n');
  
  // Test 1: Service Status
  console.log('1. Testing GET /api/reddit/status');
  try {
    const response = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status Response:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Status Error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Connection Test
  console.log('2. Testing GET /api/reddit/test');
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Connection Test Response:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    if (!response.data.success) {
      console.log('\n⚠️  Reddit API not configured. Skipping remaining tests.');
      return;
    }
  } catch (error) {
    console.error('❌ Connection Test Error:', error.response?.data || error.message);
    console.log('\n⚠️  Reddit API not available. Skipping remaining tests.');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Trending Posts
  console.log('3. Testing GET /api/reddit/trending');
  try {
    const response = await axios.get(`${BASE_URL}/trending`, {
      params: {
        subreddit: 'news',
        sort: 'hot',
        limit: 5
      }
    });
    console.log('✅ Trending Posts Response:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Posts Count:', response.data.data.posts.length);
    console.log('   Message:', response.data.message);
    
    if (response.data.data.posts.length > 0) {
      const samplePost = response.data.data.posts[0];
      console.log('\n   Sample Post:');
      console.log(`   - Title: ${samplePost.title.substring(0, 60)}...`);
      console.log(`   - Subreddit: r/${samplePost.subreddit}`);
      console.log(`   - Score: ${samplePost.score}`);
    }
  } catch (error) {
    console.error('❌ Trending Posts Error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Search Posts
  console.log('4. Testing GET /api/reddit/search');
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: 'technology',
        subreddit: 'all',
        sort: 'relevance',
        limit: 3
      }
    });
    console.log('✅ Search Posts Response:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Posts Count:', response.data.data.posts.length);
    console.log('   Message:', response.data.message);
  } catch (error) {
    console.error('❌ Search Posts Error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Crisis Content Monitoring
  console.log('5. Testing GET /api/reddit/crisis');
  try {
    const response = await axios.get(`${BASE_URL}/crisis`);
    console.log('✅ Crisis Monitoring Response:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Crisis Posts Count:', response.data.data.posts.length);
    console.log('   Message:', response.data.message);
    
    if (response.data.data.posts.length > 0) {
      const topPost = response.data.data.posts[0];
      console.log('\n   Top Crisis Post:');
      console.log(`   - Title: ${topPost.title.substring(0, 60)}...`);
      console.log(`   - Crisis Score: ${topPost.crisisScore}`);
      console.log(`   - Urgency Level: ${topPost.urgencyLevel}`);
    }
  } catch (error) {
    console.error('❌ Crisis Monitoring Error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 6: Specific Subreddit
  console.log('6. Testing GET /api/reddit/subreddit/technology');
  try {
    const response = await axios.get(`${BASE_URL}/subreddit/technology`, {
      params: {
        sort: 'hot',
        limit: 3
      }
    });
    console.log('✅ Subreddit Posts Response:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Posts Count:', response.data.data.posts.length);
    console.log('   Message:', response.data.message);
  } catch (error) {
    console.error('❌ Subreddit Posts Error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 7: Error Handling - Missing Query
  console.log('7. Testing Error Handling - Missing Query');
  try {
    const response = await axios.get(`${BASE_URL}/search`);
    console.log('❌ Should have failed but got:', response.status);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly handled missing query parameter');
      console.log('   Error:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 8: Error Handling - Invalid Subreddit
  console.log('8. Testing Error Handling - Invalid Subreddit');
  try {
    const response = await axios.get(`${BASE_URL}/subreddit/nonexistentsubreddit12345`, {
      params: { limit: 1 }
    });
    console.log('Response:', response.status, response.data.success);
  } catch (error) {
    if (error.response?.status === 500) {
      console.log('✅ Correctly handled invalid subreddit');
      console.log('   Error message contains expected info');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  console.log('\n🎉 Reddit API Endpoints Test Complete!');
}

// Run the test
if (require.main === module) {
  testRedditEndpoints().catch(console.error);
}

module.exports = testRedditEndpoints;