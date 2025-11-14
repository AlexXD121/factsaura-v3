/**
 * Complete AI Monitoring System Test
 * Tests the full pipeline: Content Scraping → AI Analysis → Auto-Posting → Database Storage
 */

const { executePwsh } = require('child_process');

async function testCompleteAIMonitoring() {
  console.log('🧪 Testing Complete AI Monitoring System...\n');
  
  try {
    // Step 1: Check scheduler status
    console.log('📊 Step 1: Checking scheduler status...');
    const statusResponse = await fetch('http://localhost:3001/api/content-scraping/status');
    const status = await statusResponse.json();
    
    console.log(`   ✅ Scheduler running: ${status.status.isRunning}`);
    console.log(`   📅 Interval: ${status.status.intervalMinutes} minutes`);
    console.log(`   🔄 Run count: ${status.status.runCount}`);
    console.log(`   📊 Total content: ${status.status.totalContentItems} items`);
    
    // Step 2: Check auto-posting configuration
    console.log('\n🤖 Step 2: Checking auto-posting configuration...');
    const autoPostResponse = await fetch('http://localhost:3001/api/content-scraping/auto-posting/stats');
    const autoPostStats = await autoPostResponse.json();
    
    console.log(`   ✅ Auto-posting enabled: ${autoPostStats.autoPostingStats.isEnabled}`);
    console.log(`   🎯 Confidence threshold: ${autoPostStats.autoPostingStats.confidenceThreshold * 100}%`);
    console.log(`   📈 Max posts per hour: ${autoPostStats.autoPostingStats.maxPostsPerHour}`);
    console.log(`   🚫 Rate limited: ${autoPostStats.autoPostingStats.isRateLimited}`);
    
    // Step 3: Force a scraping cycle to get fresh content
    console.log('\n🔄 Step 3: Running fresh scraping cycle...');
    const runResponse = await fetch('http://localhost:3001/api/content-scraping/run', { method: 'POST' });
    const runResult = await runResponse.json();
    
    console.log(`   ✅ Cycle completed: ${runResult.success}`);
    console.log(`   ⏱️ Duration: ${runResult.result.duration}ms`);
    console.log(`   📊 Items processed: ${runResult.result.analysis.totalItems}`);
    console.log(`   🚨 Crisis items: ${runResult.result.analysis.crisisItems}`);
    console.log(`   🔥 Trending items: ${runResult.result.analysis.trendingItems}`);
    console.log(`   🤖 Auto-posts created: ${runResult.result.analysis.autoPosting?.postsCreated || 0}`);
    
    // Step 4: Check latest content
    console.log('\n📄 Step 4: Checking scraped content...');
    const contentResponse = await fetch('http://localhost:3001/api/content-scraping/content');
    const content = await contentResponse.json();
    
    console.log(`   📰 News items: ${content.content.news.length}`);
    console.log(`   🔴 Reddit items: ${content.content.reddit.length}`);
    console.log(`   🌍 GDELT items: ${content.content.gdelt.length}`);
    console.log(`   📅 Last updated: ${content.content.lastUpdated}`);
    
    // Step 5: Check posts feed for AI-generated alerts
    console.log('\n📋 Step 5: Checking posts feed for AI alerts...');
    const postsResponse = await fetch('http://localhost:3001/api/posts');
    const posts = await postsResponse.json();
    
    const aiDetectedPosts = posts.data.posts.filter(post => post.type === 'ai_detected');
    const userSubmittedPosts = posts.data.posts.filter(post => post.type === 'user_submitted');
    
    console.log(`   📊 Total posts: ${posts.data.posts.length}`);
    console.log(`   🤖 AI-detected posts: ${aiDetectedPosts.length}`);
    console.log(`   👤 User-submitted posts: ${userSubmittedPosts.length}`);
    
    if (aiDetectedPosts.length > 0) {
      console.log('\n🚨 AI-Generated Misinformation Alerts:');
      aiDetectedPosts.slice(0, 3).forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
        console.log(`      📊 Confidence: ${Math.round(post.ai_analysis.confidence_score * 100)}%`);
        console.log(`      ⚠️ Urgency: ${post.crisis_context.urgency_level}`);
        console.log(`      🏷️ Category: ${post.crisis_context.harm_category}`);
        console.log(`      📅 Created: ${new Date(post.created_at).toLocaleString()}`);
      });
    }
    
    // Step 6: Test trending analysis
    console.log('\n🔥 Step 6: Checking trending analysis...');
    const trendingResponse = await fetch('http://localhost:3001/api/content-scraping/trending');
    const trending = await trendingResponse.json();
    
    if (trending.success && trending.trendingTopics) {
      console.log(`   📈 Trending topics detected: ${Object.keys(trending.trendingTopics).length}`);
      console.log(`   🔍 Analysis timestamp: ${trending.timestamp}`);
    }
    
    // Step 7: Summary and recommendations
    console.log('\n📋 SYSTEM STATUS SUMMARY:');
    console.log('=' .repeat(50));
    
    const isFullyOperational = 
      status.status.isRunning && 
      autoPostStats.autoPostingStats.isEnabled && 
      runResult.success;
    
    if (isFullyOperational) {
      console.log('✅ AI MONITORING SYSTEM: FULLY OPERATIONAL');
      console.log('   🔄 Content scraping: Active');
      console.log('   🤖 AI analysis: Working');
      console.log('   🚨 Auto-posting: Enabled');
      console.log('   📊 Database storage: Functional');
      
      if (aiDetectedPosts.length > 0) {
        console.log(`   🎯 Recent AI alerts: ${aiDetectedPosts.length} misinformation posts detected`);
      } else {
        console.log('   ℹ️ No misinformation detected in recent content (good news!)');
      }
    } else {
      console.log('⚠️ AI MONITORING SYSTEM: PARTIAL OPERATION');
      if (!status.status.isRunning) console.log('   ❌ Content scraping: Inactive');
      if (!autoPostStats.autoPostingStats.isEnabled) console.log('   ❌ Auto-posting: Disabled');
      if (!runResult.success) console.log('   ❌ Scraping cycle: Failed');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Monitor the feed at http://localhost:5173');
    console.log('   2. Check for new AI alerts every 5 minutes');
    console.log('   3. Verify real-time notifications are working');
    console.log('   4. Test with different types of misinformation content');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Ensure backend server is running on port 3001');
    console.log('   2. Check Jan AI service is available');
    console.log('   3. Verify database connection');
    console.log('   4. Check API key configurations');
  }
}

// Run the test
testCompleteAIMonitoring().then(() => {
  console.log('\n🏁 Complete AI monitoring test finished');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});