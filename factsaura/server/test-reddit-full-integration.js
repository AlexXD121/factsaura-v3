/**
 * Comprehensive Reddit Integration Test
 * Tests all aspects of Reddit integration including service, controller, and routes
 */

require('dotenv').config();
const axios = require('axios');
const RedditApiService = require('./services/redditApiService');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testFullRedditIntegration() {
  log(colors.bold + colors.blue, '🚀 COMPREHENSIVE REDDIT INTEGRATION TEST');
  log(colors.blue, '='.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Service Layer Tests
  log(colors.bold, '\n📋 PHASE 1: SERVICE LAYER TESTING');
  log(colors.blue, '-'.repeat(40));
  
  try {
    const redditService = new RedditApiService();
    
    // Test 1.1: Service Initialization
    totalTests++;
    log(colors.yellow, '1.1 Testing Service Initialization...');
    const status = redditService.getServiceStatus();
    if (status.service === 'Reddit API') {
      log(colors.green, '✅ Service initialized correctly');
      passedTests++;
    } else {
      log(colors.red, '❌ Service initialization failed');
      failedTests++;
    }
    
    // Test 1.2: Configuration Check
    totalTests++;
    log(colors.yellow, '1.2 Testing Configuration...');
    if (status.status === 'configured' && status.credentials === 'present') {
      log(colors.green, '✅ Reddit credentials configured');
      passedTests++;
    } else {
      log(colors.red, '❌ Reddit credentials not configured properly');
      log(colors.red, `   Status: ${status.status}, Credentials: ${status.credentials}`);
      failedTests++;
    }
    
    // Test 1.3: Rate Limiting
    totalTests++;
    log(colors.yellow, '1.3 Testing Rate Limiting...');
    const canMakeRequest = redditService.canMakeRequest();
    if (canMakeRequest) {
      log(colors.green, '✅ Rate limiting working correctly');
      passedTests++;
    } else {
      log(colors.red, '❌ Rate limiting issue');
      failedTests++;
    }
    
    // Test 1.4: Crisis Keywords
    totalTests++;
    log(colors.yellow, '1.4 Testing Crisis Keywords Configuration...');
    if (status.crisisKeywordsCount > 0) {
      log(colors.green, `✅ Crisis keywords configured (${status.crisisKeywordsCount} keywords)`);
      passedTests++;
    } else {
      log(colors.red, '❌ No crisis keywords configured');
      failedTests++;
    }
    
    // Test 1.5: Subreddit Configuration
    totalTests++;
    log(colors.yellow, '1.5 Testing Subreddit Configuration...');
    if (status.crisisSubredditsCount > 0 && status.trendingSubredditsCount > 0) {
      log(colors.green, `✅ Subreddits configured (Crisis: ${status.crisisSubredditsCount}, Trending: ${status.trendingSubredditsCount})`);
      passedTests++;
    } else {
      log(colors.red, '❌ Subreddit configuration incomplete');
      failedTests++;
    }
    
    // Test 1.6: Connection Test
    totalTests++;
    log(colors.yellow, '1.6 Testing Reddit API Connection...');
    try {
      const connectionTest = await redditService.testConnection();
      if (connectionTest.success) {
        log(colors.green, '✅ Reddit API connection successful');
        log(colors.green, `   Message: ${connectionTest.message}`);
        passedTests++;
      } else {
        log(colors.red, '❌ Reddit API connection failed');
        log(colors.red, `   Error: ${connectionTest.error}`);
        log(colors.red, `   Status: ${connectionTest.status}`);
        failedTests++;
      }
    } catch (error) {
      log(colors.red, '❌ Connection test threw error');
      log(colors.red, `   Error: ${error.message}`);
      failedTests++;
    }
    
  } catch (error) {
    log(colors.red, '❌ Service layer test failed');
    log(colors.red, `   Error: ${error.message}`);
    failedTests++;
  }

  // Test 2: API Endpoints Tests (if server is running)
  log(colors.bold, '\n🌐 PHASE 2: API ENDPOINTS TESTING');
  log(colors.blue, '-'.repeat(40));
  
  const baseUrl = 'http://localhost:3001/api/reddit';
  
  // Test 2.1: Status Endpoint
  totalTests++;
  log(colors.yellow, '2.1 Testing GET /api/reddit/status...');
  try {
    const response = await axios.get(`${baseUrl}/status`);
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✅ Status endpoint working');
      log(colors.green, `   Service Status: ${response.data.data.status}`);
      passedTests++;
    } else {
      log(colors.red, '❌ Status endpoint failed');
      failedTests++;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(colors.yellow, '⚠️  Server not running - skipping endpoint tests');
      log(colors.yellow, '   Start server with: npm run dev');
    } else {
      log(colors.red, '❌ Status endpoint error');
      log(colors.red, `   Error: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test 2.2: Test Connection Endpoint
  totalTests++;
  log(colors.yellow, '2.2 Testing GET /api/reddit/test...');
  try {
    const response = await axios.get(`${baseUrl}/test`);
    if (response.status === 200) {
      if (response.data.success) {
        log(colors.green, '✅ Test connection endpoint working');
        passedTests++;
      } else {
        log(colors.red, '❌ Test connection failed');
        log(colors.red, `   Error: ${response.data.error}`);
        failedTests++;
      }
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      log(colors.red, '❌ Test endpoint error');
      log(colors.red, `   Error: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test 2.3: Trending Posts Endpoint
  totalTests++;
  log(colors.yellow, '2.3 Testing GET /api/reddit/trending...');
  try {
    const response = await axios.get(`${baseUrl}/trending`, {
      params: { subreddit: 'test', limit: 1 }
    });
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✅ Trending posts endpoint working');
      log(colors.green, `   Retrieved ${response.data.data.posts.length} posts`);
      passedTests++;
    } else {
      log(colors.red, '❌ Trending posts endpoint failed');
      failedTests++;
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      log(colors.red, '❌ Trending posts endpoint error');
      log(colors.red, `   Error: ${error.response?.data?.error || error.message}`);
      failedTests++;
    }
  }
  
  // Test 2.4: Search Endpoint
  totalTests++;
  log(colors.yellow, '2.4 Testing GET /api/reddit/search...');
  try {
    const response = await axios.get(`${baseUrl}/search`, {
      params: { q: 'test', limit: 1 }
    });
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✅ Search endpoint working');
      log(colors.green, `   Found ${response.data.data.posts.length} posts`);
      passedTests++;
    } else {
      log(colors.red, '❌ Search endpoint failed');
      failedTests++;
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      log(colors.red, '❌ Search endpoint error');
      log(colors.red, `   Error: ${error.response?.data?.error || error.message}`);
      failedTests++;
    }
  }
  
  // Test 2.5: Crisis Monitoring Endpoint
  totalTests++;
  log(colors.yellow, '2.5 Testing GET /api/reddit/crisis...');
  try {
    const response = await axios.get(`${baseUrl}/crisis`);
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✅ Crisis monitoring endpoint working');
      log(colors.green, `   Found ${response.data.data.posts.length} crisis posts`);
      passedTests++;
    } else {
      log(colors.red, '❌ Crisis monitoring endpoint failed');
      failedTests++;
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      log(colors.red, '❌ Crisis monitoring endpoint error');
      log(colors.red, `   Error: ${error.response?.data?.error || error.message}`);
      failedTests++;
    }
  }
  
  // Test 2.6: Subreddit Endpoint
  totalTests++;
  log(colors.yellow, '2.6 Testing GET /api/reddit/subreddit/test...');
  try {
    const response = await axios.get(`${baseUrl}/subreddit/test`, {
      params: { limit: 1 }
    });
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✅ Subreddit endpoint working');
      log(colors.green, `   Retrieved ${response.data.data.posts.length} posts from r/test`);
      passedTests++;
    } else {
      log(colors.red, '❌ Subreddit endpoint failed');
      failedTests++;
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      log(colors.red, '❌ Subreddit endpoint error');
      log(colors.red, `   Error: ${error.response?.data?.error || error.message}`);
      failedTests++;
    }
  }

  // Test 3: Integration Tests
  log(colors.bold, '\n🔗 PHASE 3: INTEGRATION TESTING');
  log(colors.blue, '-'.repeat(40));
  
  // Test 3.1: Routes Integration
  totalTests++;
  log(colors.yellow, '3.1 Testing Routes Integration...');
  try {
    const routesFile = require('./routes/reddit');
    if (routesFile) {
      log(colors.green, '✅ Reddit routes properly exported');
      passedTests++;
    } else {
      log(colors.red, '❌ Reddit routes not found');
      failedTests++;
    }
  } catch (error) {
    log(colors.red, '❌ Routes integration error');
    log(colors.red, `   Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 3.2: Controller Integration
  totalTests++;
  log(colors.yellow, '3.2 Testing Controller Integration...');
  try {
    const controller = require('./controllers/redditApiController');
    if (controller && typeof controller.getTrendingPosts === 'function') {
      log(colors.green, '✅ Reddit controller properly exported');
      passedTests++;
    } else {
      log(colors.red, '❌ Reddit controller not properly configured');
      failedTests++;
    }
  } catch (error) {
    log(colors.red, '❌ Controller integration error');
    log(colors.red, `   Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 3.3: Service Integration
  totalTests++;
  log(colors.yellow, '3.3 Testing Service Integration...');
  try {
    const RedditService = require('./services/redditApiService');
    const service = new RedditService();
    if (service && typeof service.getTrendingPosts === 'function') {
      log(colors.green, '✅ Reddit service properly exported');
      passedTests++;
    } else {
      log(colors.red, '❌ Reddit service not properly configured');
      failedTests++;
    }
  } catch (error) {
    log(colors.red, '❌ Service integration error');
    log(colors.red, `   Error: ${error.message}`);
    failedTests++;
  }

  // Final Results
  log(colors.bold + colors.blue, '\n📊 TEST RESULTS SUMMARY');
  log(colors.blue, '='.repeat(60));
  log(colors.green, `✅ Passed: ${passedTests}/${totalTests}`);
  if (failedTests > 0) {
    log(colors.red, `❌ Failed: ${failedTests}/${totalTests}`);
  }
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(colors.bold, `📈 Success Rate: ${successRate}%`);
  
  if (successRate >= 90) {
    log(colors.green + colors.bold, '🎉 REDDIT INTEGRATION FULLY FUNCTIONAL!');
  } else if (successRate >= 70) {
    log(colors.yellow + colors.bold, '⚠️  REDDIT INTEGRATION MOSTLY WORKING - MINOR ISSUES');
  } else {
    log(colors.red + colors.bold, '❌ REDDIT INTEGRATION NEEDS ATTENTION');
  }
  
  // Recommendations
  log(colors.bold, '\n💡 RECOMMENDATIONS:');
  if (failedTests > 0) {
    log(colors.yellow, '• Check Reddit credentials in .env file');
    log(colors.yellow, '• Ensure server is running for endpoint tests');
    log(colors.yellow, '• Verify Reddit API rate limits');
    log(colors.yellow, '• Check network connectivity');
  } else {
    log(colors.green, '• Reddit integration is fully operational!');
    log(colors.green, '• Ready for production use');
    log(colors.green, '• All endpoints and services working correctly');
  }
  
  log(colors.blue, '\n' + '='.repeat(60));
  log(colors.bold, 'Reddit Integration Test Complete! 🚀');
}

// Run the test
if (require.main === module) {
  testFullRedditIntegration().catch(console.error);
}

module.exports = testFullRedditIntegration;