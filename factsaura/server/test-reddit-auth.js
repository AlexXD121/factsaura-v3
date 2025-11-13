/**
 * Reddit Authentication Debug Test
 */

require('dotenv').config();
const snoowrap = require('snoowrap');

async function testRedditAuth() {
  console.log('🔍 Testing Reddit Authentication...\n');
  
  const credentials = {
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  };
  
  console.log('Credentials Check:');
  console.log('- User Agent:', credentials.userAgent);
  console.log('- Client ID:', credentials.clientId ? credentials.clientId.substring(0, 5) + '...' : 'MISSING');
  console.log('- Client Secret:', credentials.clientSecret ? credentials.clientSecret.substring(0, 5) + '...' : 'MISSING');
  console.log('- Username:', credentials.username);
  console.log('- Password:', credentials.password ? credentials.password.substring(0, 3) + '...' : 'MISSING');
  
  console.log('\n🔗 Attempting Reddit Connection...');
  
  try {
    const reddit = new snoowrap(credentials);
    
    // Configure request delay
    reddit.config({ requestDelay: 1000 });
    
    console.log('✅ Reddit instance created successfully');
    
    // Test a simple API call
    console.log('📡 Testing API call...');
    const testPost = await reddit.getSubreddit('test').getHot({ limit: 1 });
    
    console.log('✅ Reddit API call successful!');
    console.log(`📊 Retrieved ${testPost.length} post(s) from r/test`);
    
    if (testPost.length > 0) {
      console.log(`📝 Sample post: "${testPost[0].title.substring(0, 50)}..."`);
    }
    
    return { success: true, message: 'Reddit authentication successful' };
    
  } catch (error) {
    console.log('❌ Reddit authentication failed');
    console.log('Error details:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Possible issues:');
      console.log('- Incorrect username or password');
      console.log('- Client ID or Client Secret mismatch');
      console.log('- Reddit account may need verification');
      console.log('- Two-factor authentication enabled (not supported by script apps)');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
testRedditAuth().then(result => {
  console.log('\n📊 Final Result:', result);
}).catch(console.error);