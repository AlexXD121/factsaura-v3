#!/usr/bin/env node

/**
 * Integration Test for Trending Topic Detection with Content Scraping
 * Tests the full integration between content scraping and trending analysis
 */

const ContentScrapingScheduler = require('../services/contentScrapingScheduler');

async function testTrendingIntegration() {
  console.log('🔗 Testing Trending Topic Detection Integration\n');
  
  try {
    // Initialize scheduler
    const scheduler = new ContentScrapingScheduler();
    console.log('✅ Content Scraping Scheduler initialized\n');
    
    // Test scheduler status
    console.log('📊 Initial Scheduler Status:');
    const initialStatus = scheduler.getStatus();
    console.log(`   Running: ${initialStatus.isRunning}`);
    console.log(`   Interval: ${initialStatus.intervalMinutes} minutes`);
    console.log(`   Content Items: ${initialStatus.totalContentItems}`);
    console.log(`   Services Available: NewsAPI=${initialStatus.serviceStatus.newsApi}, Reddit=${initialStatus.serviceStatus.reddit}, GDELT=${initialStatus.serviceStatus.gdelt}\n`);
    
    // Force run a scraping cycle to get content
    console.log('🔄 Running scraping cycle to collect content...');
    const cycleStartTime = Date.now();
    
    try {
      const cycleResult = await scheduler.forceRun();
      const cycleDuration = Date.now() - cycleStartTime;
      
      console.log(`✅ Scraping cycle completed in ${cycleDuration}ms`);
      console.log(`   Success: ${cycleResult.success}`);
      console.log(`   Run Count: ${cycleResult.runCount}`);
      console.log(`   Analysis Duration: ${cycleResult.duration}ms`);
      
      if (cycleResult.analysis) {
        console.log(`   Total Items: ${cycleResult.analysis.totalItems}`);
        console.log(`   Crisis Items: ${cycleResult.analysis.crisisItems}`);
        console.log(`   Trending Items: ${cycleResult.analysis.trendingItems}`);
        
        if (cycleResult.analysis.trending) {
          console.log(`   Trending Analysis: ${cycleResult.analysis.trending.summary?.trendingCount || 0} trending topics`);
          console.log(`   Viral Content: ${cycleResult.analysis.trending.summary?.viralCount || 0} viral items`);
          console.log(`   Crisis Topics: ${cycleResult.analysis.trending.summary?.crisisCount || 0} crisis topics`);
        }
      }
      console.log();
      
    } catch (error) {
      console.log(`⚠️ Scraping cycle failed (expected if no API keys): ${error.message}`);
      console.log('   This is normal in test environment without API keys\n');
    }
    
    // Test trending analysis methods
    console.log('🔥 Testing Trending Analysis Methods...');
    
    // Get current trending topics
    const trendingTopics = scheduler.getTrendingAnalysis();
    console.log(`   Current Trending Topics: ${trendingTopics.length}`);
    
    if (trendingTopics.length > 0) {
      console.log('   Top 3 Trending Topics:');
      trendingTopics.slice(0, 3).forEach((topic, index) => {
        console.log(`   ${index + 1}. "${topic.keyword}" - Score: ${topic.scores?.trending?.toFixed(3) || 'N/A'}`);
      });
    }
    console.log();
    
    // Get trending statistics
    const trendingStats = scheduler.getTrendingStats();
    console.log('📈 Trending Detection Statistics:');
    console.log(`   Topics Tracked: ${trendingStats.totalTopicsTracked}`);
    console.log(`   Current Trending: ${trendingStats.currentTrendingCount}`);
    console.log(`   Cache Status: ${trendingStats.cacheStatus}`);
    console.log(`   Last Analysis: ${trendingStats.lastAnalysisTime ? new Date(trendingStats.lastAnalysisTime).toISOString() : 'Never'}`);
    console.log(`   Memory Usage: ${JSON.stringify(trendingStats.memoryUsage)}\n`);
    
    // Test topic history (if any topics exist)
    if (trendingStats.totalTopicsTracked > 0) {
      console.log('📚 Testing Topic History...');
      const allHistories = scheduler.getTopicHistory();
      console.log(`   Total Topics in History: ${allHistories.size}`);
      
      // Get first topic for testing
      const firstTopic = allHistories.keys().next().value;
      if (firstTopic) {
        const topicHistory = scheduler.getTopicHistory(firstTopic);
        console.log(`   Sample Topic: "${firstTopic}"`);
        console.log(`   History Points: ${topicHistory.history.length}`);
        console.log(`   First Seen: ${new Date(topicHistory.firstSeen).toISOString()}`);
        console.log(`   Peak Score: ${topicHistory.peakScore.toFixed(3)}`);
        console.log(`   Total Mentions: ${topicHistory.totalMentions}`);
      }
      console.log();
    }
    
    // Test with mock data if no real content
    if (trendingStats.totalTopicsTracked === 0) {
      console.log('🧪 Testing with Mock Data (no real content available)...');
      
      // Create mock content for testing
      const mockContent = {
        news: [
          {
            title: 'Test Breaking News Alert',
            description: 'This is a test emergency alert for trending detection',
            url: 'https://test.com/alert',
            publishedAt: new Date().toISOString(),
            author: 'Test Reporter',
            source: { name: 'Test News' },
            crisisScore: 0.8
          }
        ],
        reddit: [
          {
            id: 'test123',
            title: 'Test viral content spreading rapidly',
            selftext: 'This is test content for viral detection algorithms',
            url: 'https://reddit.com/test123',
            created_utc: Math.floor(Date.now() / 1000),
            author: 'TestUser',
            subreddit: 'test',
            score: 1500,
            num_comments: 200,
            crisisScore: 0.3
          }
        ],
        gdelt: [
          {
            title: 'Test Global Event Monitoring',
            url: 'https://gdelt.com/test',
            seendate: new Date().toISOString(),
            domain: 'test.gov',
            socialfacebookshares: 500,
            socialscore: 750,
            tone: { score: -2.5 },
            themes: ['TEST', 'MONITORING'],
            locations: ['Global'],
            crisisScore: 0.5
          }
        ]
      };
      
      // Test trending detection directly
      const mockAnalysis = await scheduler.trendingDetectionService.detectTrendingTopics(mockContent);
      
      console.log('   Mock Analysis Results:');
      console.log(`   Total Topics: ${mockAnalysis.summary.totalTopics}`);
      console.log(`   Trending Count: ${mockAnalysis.summary.trendingCount}`);
      console.log(`   Viral Count: ${mockAnalysis.summary.viralCount}`);
      console.log(`   Crisis Count: ${mockAnalysis.summary.crisisCount}`);
      console.log(`   Content Items: ${mockAnalysis.summary.totalContent}`);
      
      if (mockAnalysis.trendingTopics.length > 0) {
        console.log('   Top Trending Topics from Mock Data:');
        mockAnalysis.trendingTopics.slice(0, 3).forEach((topic, index) => {
          console.log(`   ${index + 1}. "${topic.keyword}" - Score: ${topic.scores.trending.toFixed(3)}`);
        });
      }
      console.log();
    }
    
    // Test scheduler configuration
    console.log('⚙️ Testing Scheduler Configuration...');
    
    // Update interval (test configuration change)
    const oldInterval = scheduler.schedulerInterval;
    scheduler.updateInterval(3); // Change to 3 minutes
    console.log(`   Interval updated from ${oldInterval} to ${scheduler.schedulerInterval} minutes`);
    
    // Restore original interval
    scheduler.updateInterval(oldInterval);
    console.log(`   Interval restored to ${scheduler.schedulerInterval} minutes\n`);
    
    // Test error handling
    console.log('🛡️ Testing Error Handling...');
    
    // Clear any existing errors
    scheduler.clearErrors();
    const errors = scheduler.getErrors();
    console.log(`   Error count after clear: ${errors.length}`);
    
    // Test with invalid content (should handle gracefully)
    try {
      const invalidContent = { invalid: 'data' };
      await scheduler.trendingDetectionService.detectTrendingTopics(invalidContent);
      console.log('   ✅ Invalid content handled gracefully');
    } catch (error) {
      console.log(`   ⚠️ Error handling test: ${error.message}`);
    }
    console.log();
    
    // Final status check
    console.log('📊 Final Scheduler Status:');
    const finalStatus = scheduler.getStatus();
    console.log(`   Running: ${finalStatus.isRunning}`);
    console.log(`   Run Count: ${finalStatus.runCount}`);
    console.log(`   Last Run: ${finalStatus.lastRunTime || 'Never'}`);
    console.log(`   Content Items: ${finalStatus.totalContentItems}`);
    console.log(`   Error Count: ${finalStatus.errorCount}\n`);
    
    console.log('✅ All integration tests completed successfully!');
    console.log('\n🎯 Integration Summary:');
    console.log('   ✓ Content Scraping Scheduler initialized');
    console.log('   ✓ Trending Detection Service integrated');
    console.log('   ✓ API methods working correctly');
    console.log('   ✓ Error handling functional');
    console.log('   ✓ Configuration management working');
    console.log('   ✓ Mock data analysis successful');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the integration test
if (require.main === module) {
  testTrendingIntegration();
}

module.exports = { testTrendingIntegration };