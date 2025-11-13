/**
 * Reddit API Integration Test Script
 * Tests Reddit API service functionality
 */

require('dotenv').config();
const RedditApiService = require('../services/redditApiService');

async function testRedditIntegration() {
  console.log('🔍 Testing Reddit API Integration...\n');
  
  const redditService = new RedditApiService();
  
  // Test 1: Service Status
  console.log('1. Testing Service Status...');
  try {
    const status = redditService.getServiceStatus();
    console.log('✅ Service Status:', JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('❌ Service Status Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Connection Test
  console.log('2. Testing Reddit API Connection...');
  try {
    const connectionTest = await redditService.testConnection();
    console.log('✅ Connection Test:', JSON.stringify(connectionTest, null, 2));
    
    if (!connectionTest.success) {
      console.log('\n⚠️  Reddit API not configured. Please set up Reddit credentials in .env file:');
      console.log('REDDIT_CLIENT_ID=your_reddit_client_id');
      console.log('REDDIT_CLIENT_SECRET=your_reddit_client_secret');
      console.log('REDDIT_USERNAME=your_reddit_username');
      console.log('REDDIT_PASSWORD=your_reddit_password');
      console.log('\nTo get Reddit API credentials:');
      console.log('1. Go to https://www.reddit.com/prefs/apps');
      console.log('2. Create a new app (script type)');
      console.log('3. Use the client ID and secret in your .env file');
      return;
    }
  } catch (error) {
    console.error('❌ Connection Test Error:', error.message);
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Get Trending Posts
  console.log('3. Testing Trending Posts...');
  try {
    const trending = await redditService.getTrendingPosts({
      subreddit: 'news',
      sort: 'hot',
      limit: 5
    });
    
    console.log('✅ Trending Posts Retrieved:');
    console.log(`   Total Posts: ${trending.posts.length}`);
    console.log(`   Source: ${trending.metadata.source}`);
    console.log(`   Type: ${trending.metadata.type}`);
    
    if (trending.posts.length > 0) {
      console.log('\n   Sample Post:');
      const samplePost = trending.posts[0];
      console.log(`   - Title: ${samplePost.title.substring(0, 80)}...`);
      console.log(`   - Subreddit: r/${samplePost.subreddit}`);
      console.log(`   - Score: ${samplePost.score}`);
      console.log(`   - Comments: ${samplePost.numComments}`);
      console.log(`   - Author: u/${samplePost.author}`);
    }
  } catch (error) {
    console.error('❌ Trending Posts Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Search Posts
  console.log('4. Testing Reddit Search...');
  try {
    const searchResults = await redditService.searchPosts('misinformation', {
      subreddit: 'all',
      sort: 'relevance',
      limit: 3
    });
    
    console.log('✅ Search Results Retrieved:');
    console.log(`   Total Posts: ${searchResults.posts.length}`);
    console.log(`   Query: misinformation`);
    
    if (searchResults.posts.length > 0) {
      console.log('\n   Sample Search Result:');
      const samplePost = searchResults.posts[0];
      console.log(`   - Title: ${samplePost.title.substring(0, 80)}...`);
      console.log(`   - Subreddit: r/${samplePost.subreddit}`);
      console.log(`   - Score: ${samplePost.score}`);
    }
  } catch (error) {
    console.error('❌ Search Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Crisis Content Monitoring
  console.log('5. Testing Crisis Content Monitoring...');
  try {
    const crisisContent = await redditService.monitorCrisisContent();
    
    console.log('✅ Crisis Content Monitoring:');
    console.log(`   Total Crisis Posts: ${crisisContent.posts.length}`);
    console.log(`   Source: ${crisisContent.metadata.source}`);
    console.log(`   Subreddits Monitored: ${crisisContent.metadata.subredditsMonitored?.join(', ') || 'N/A'}`);
    
    if (crisisContent.posts.length > 0) {
      console.log('\n   Top Crisis Post:');
      const topPost = crisisContent.posts[0];
      console.log(`   - Title: ${topPost.title.substring(0, 80)}...`);
      console.log(`   - Crisis Score: ${topPost.crisisScore}`);
      console.log(`   - Urgency Level: ${topPost.urgencyLevel}`);
      console.log(`   - Subreddit: r/${topPost.subreddit}`);
    }
  } catch (error) {
    console.error('❌ Crisis Monitoring Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 6: Specific Subreddit
  console.log('6. Testing Specific Subreddit...');
  try {
    const subredditPosts = await redditService.getSubredditPosts('technology', {
      sort: 'hot',
      limit: 3
    });
    
    console.log('✅ Subreddit Posts Retrieved:');
    console.log(`   Subreddit: r/technology`);
    console.log(`   Total Posts: ${subredditPosts.posts.length}`);
    
    if (subredditPosts.posts.length > 0) {
      console.log('\n   Sample Post:');
      const samplePost = subredditPosts.posts[0];
      console.log(`   - Title: ${samplePost.title.substring(0, 80)}...`);
      console.log(`   - Score: ${samplePost.score}`);
      console.log(`   - Comments: ${samplePost.numComments}`);
    }
  } catch (error) {
    console.error('❌ Subreddit Posts Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 Reddit API Integration Test Complete!');
  
  // Final status
  const finalStatus = redditService.getServiceStatus();
  console.log('\n📊 Final Service Status:');
  console.log(`   Status: ${finalStatus.status}`);
  console.log(`   Requests Used: ${finalStatus.requestsUsed}/${redditService.maxRequestsPerMinute}`);
  console.log(`   Requests Remaining: ${finalStatus.requestsRemaining}`);
}

// Run the test
if (require.main === module) {
  testRedditIntegration().catch(console.error);
}

module.exports = testRedditIntegration;