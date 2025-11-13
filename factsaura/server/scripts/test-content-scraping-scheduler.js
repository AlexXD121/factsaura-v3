/**
 * Test Content Scraping Scheduler
 * Tests the content scraping scheduler functionality
 */

require('dotenv').config();
const ContentScrapingScheduler = require('../services/contentScrapingScheduler');

async function testScheduler() {
  console.log('🧪 Testing Content Scraping Scheduler\n');

  try {
    // Create scheduler instance
    const scheduler = new ContentScrapingScheduler();
    
    console.log('✅ Scheduler instance created');
    console.log('📊 Initial status:', scheduler.getStatus());
    
    // Test manual scraping cycle
    console.log('\n🔄 Running manual scraping cycle...');
    const result = await scheduler.forceRun();
    
    console.log('✅ Manual scraping cycle completed');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    // Get latest content
    console.log('\n📰 Getting latest content...');
    const content = scheduler.getLatestContent();
    
    console.log('📊 Content summary:');
    console.log(`  - Total items: ${content.totalItems}`);
    console.log(`  - News articles: ${content.news.length}`);
    console.log(`  - Reddit posts: ${content.reddit.length}`);
    console.log(`  - GDELT events: ${content.gdelt.length}`);
    console.log(`  - Last updated: ${content.lastUpdated}`);
    
    // Test scheduler start/stop
    console.log('\n⏰ Testing scheduler start/stop...');
    scheduler.start(1); // 1 minute interval for testing
    
    console.log('✅ Scheduler started');
    console.log('📊 Status after start:', scheduler.getStatus());
    
    // Wait a bit then stop
    setTimeout(() => {
      scheduler.stop();
      console.log('🛑 Scheduler stopped');
      console.log('📊 Final status:', scheduler.getStatus());
      
      // Show any errors
      const errors = scheduler.getErrors();
      if (errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.timestamp}: ${error.message}`);
        });
      } else {
        console.log('\n✅ No errors encountered');
      }
      
      console.log('\n🎉 Scheduler test completed successfully!');
    }, 5000); // Stop after 5 seconds
    
  } catch (error) {
    console.error('❌ Scheduler test failed:', error);
    process.exit(1);
  }
}

// Run the test
testScheduler();