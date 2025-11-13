/**
 * Basic Reddit API Test (without user authentication)
 */

require('dotenv').config();
const axios = require('axios');

async function testBasicRedditAPI() {
  console.log('🔍 Testing Basic Reddit API Access...\n');
  
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  
  console.log('Client ID:', clientId ? clientId.substring(0, 5) + '...' : 'MISSING');
  console.log('Client Secret:', clientSecret ? clientSecret.substring(0, 5) + '...' : 'MISSING');
  
  try {
    // Test 1: Get OAuth token
    console.log('\n📡 Step 1: Getting OAuth token...');
    
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'User-Agent': process.env.REDDIT_USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ OAuth token received');
    console.log('Token type:', tokenResponse.data.token_type);
    console.log('Expires in:', tokenResponse.data.expires_in, 'seconds');
    
    // Test 2: Make API call with token
    console.log('\n📡 Step 2: Testing API call with token...');
    
    const apiResponse = await axios.get('https://oauth.reddit.com/r/test/hot', {
      headers: {
        'Authorization': `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT
      },
      params: {
        limit: 1
      }
    });
    
    console.log('✅ API call successful!');
    console.log('Posts retrieved:', apiResponse.data.data.children.length);
    
    if (apiResponse.data.data.children.length > 0) {
      const post = apiResponse.data.data.children[0].data;
      console.log(`📝 Sample post: "${post.title.substring(0, 50)}..."`);
    }
    
    return { success: true, message: 'Basic Reddit API access working' };
    
  } catch (error) {
    console.log('❌ Basic Reddit API test failed');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Client credentials are incorrect');
      console.log('- Check Client ID and Client Secret');
      console.log('- Verify app is created correctly on Reddit');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
testBasicRedditAPI().then(result => {
  console.log('\n📊 Final Result:', result);
}).catch(console.error);