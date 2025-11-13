/**
 * NewsAPI Integration Test Script
 * Manual testing script for NewsAPI.org integration
 */

require('dotenv').config();
const NewsApiService = require('../services/newsApiService');

async function testNewsApiIntegration() {
  console.log('🧪 Testing NewsAPI Integration...\n');
  
  const newsApiService = new NewsApiService();
  
  // Test 1: Service Status
  console.log('1️⃣ Testing Service Status:');
  const status = newsApiService.getServiceStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');
  
  // Test 2: Connection Test
  console.log('2️⃣ Testing API Connection:');
  try {
    const connectionTest = await newsApiService.testConnection();
    console.log(JSON.stringify(connectionTest, null, 2));
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
  console.log('');
  
  // Only proceed with API calls if we have a valid API key
  if (!process.env.NEWSAPI_KEY || process.env.NEWSAPI_KEY === 'your_newsapi_key_here') {
    console.log('⚠️  NewsAPI key not configured. Please set NEWSAPI_KEY in .env file');
    console.log('   Get your free API key from: https://newsapi.org/register');
    return;
  }
  
  try {
    // Test 3: Trending News
    console.log('3️⃣ Testing Trending News (limited to 2 articles):');
    const trendingNews = await newsApiService.getTrendingNews({ pageSize: 2 });
    console.log(`Found ${trendingNews.articles.length} trending articles:`);
    trendingNews.articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     Source: ${article.source.name} (Trusted: ${article.source.credibility.isTrusted})`);
      console.log(`     Published: ${article.publishedAt}`);
    });
    console.log('');
    
    // Test 4: Crisis Content Monitoring
    console.log('4️⃣ Testing Crisis Content Monitoring:');
    const crisisContent = await newsApiService.monitorCrisisContent();
    console.log(`Found ${crisisContent.articles.length} crisis-related articles:`);
    crisisContent.articles.slice(0, 3).forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     Crisis Score: ${article.crisisScore.toFixed(2)}`);
      console.log(`     Urgency: ${article.urgencyLevel}`);
      console.log(`     Source: ${article.source.name}`);
    });
    console.log('');
    
    // Test 5: Search Functionality
    console.log('5️⃣ Testing Search Functionality:');
    const searchResults = await newsApiService.searchNews('artificial intelligence', { pageSize: 2 });
    console.log(`Found ${searchResults.articles.length} AI-related articles:`);
    searchResults.articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     Source: ${article.source.name}`);
    });
    console.log('');
    
    // Test 6: Rate Limiting Status
    console.log('6️⃣ Final Rate Limiting Status:');
    const finalStatus = newsApiService.getServiceStatus();
    console.log(`Requests used: ${finalStatus.requestsUsed}/${newsApiService.maxRequestsPerHour}`);
    console.log(`Requests remaining: ${finalStatus.requestsRemaining}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('rate limit')) {
      console.log('💡 This is expected behavior - the free tier has strict rate limits');
    } else if (error.message.includes('API key')) {
      console.log('💡 Please check your NewsAPI key configuration');
    }
  }
  
  console.log('\n✅ NewsAPI Integration Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Get a free NewsAPI key from https://newsapi.org/register');
  console.log('   2. Add it to your .env file as NEWSAPI_KEY=your_actual_key');
  console.log('   3. Run this test again to verify full functionality');
}

// Run the test
if (require.main === module) {
  testNewsApiIntegration().catch(console.error);
}

module.exports = testNewsApiIntegration;