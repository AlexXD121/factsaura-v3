/**
 * Frontend End-to-End Test: Submit Content → AI Analysis → Display in Feed
 * 
 * This test script verifies the frontend components work together properly
 * for the complete user flow from submission to feed display.
 */

import { postsAPI, aiAPI } from './src/utils/api.js';

class FrontendE2ETest {
  constructor() {
    this.testResults = [];
    this.testPostIds = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async runTest(testName, testFn) {
    try {
      this.log(`Starting test: ${testName}`, 'test');
      await testFn();
      this.log(`✅ PASSED: ${testName}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
      console.error(error);
      return false;
    }
  }

  async cleanup() {
    this.log('🧹 Starting cleanup...', 'info');
    
    for (const postId of this.testPostIds) {
      try {
        // Note: We don't have a delete endpoint, so we'll just log
        this.log(`Would clean up post: ${postId}`, 'info');
      } catch (error) {
        this.log(`Failed to cleanup post ${postId}: ${error.message}`, 'warn');
      }
    }
    
    this.log('🧹 Cleanup completed', 'info');
  }

  async testAPIConnectivity() {
    this.log('Testing API connectivity...', 'info');
    
    // Test basic API connection
    const response = await postsAPI.getPosts({ limit: 1 });
    
    if (!response.success) {
      throw new Error('API not responding correctly');
    }
    
    this.log('API connectivity verified', 'success');
  }

  async testContentSubmission() {
    this.log('Testing content submission with AI analysis...', 'info');
    
    const testContent = {
      title: 'E2E Test: Breaking News Alert',
      content: 'This is a test post for end-to-end verification. Scientists have discovered that drinking water prevents dehydration.',
      content_type: 'text'
    };

    // Submit content
    const response = await postsAPI.createPost(testContent);
    
    if (!response.success) {
      throw new Error(`Post creation failed: ${response.error?.message || 'Unknown error'}`);
    }

    const { post, ai_analysis } = response.data;
    this.testPostIds.push(post.id);

    // Verify post structure
    if (!post.id || !post.title || !post.content) {
      throw new Error('Post missing required fields');
    }

    if (post.title !== testContent.title) {
      throw new Error('Post title mismatch');
    }

    if (post.content !== testContent.content) {
      throw new Error('Post content mismatch');
    }

    // Verify AI analysis
    if (typeof ai_analysis.confidence_score !== 'number') {
      throw new Error('AI analysis missing confidence score');
    }

    if (typeof ai_analysis.is_misinformation !== 'boolean') {
      throw new Error('AI analysis missing misinformation flag');
    }

    if (!ai_analysis.explanation) {
      throw new Error('AI analysis missing explanation');
    }

    // Verify crisis context
    if (!post.urgency_level || !['critical', 'high', 'medium'].includes(post.urgency_level)) {
      throw new Error('Post missing or invalid urgency level');
    }

    this.log(`Post created successfully: ${post.id}`, 'success');
    this.log(`AI Analysis: ${(ai_analysis.confidence_score * 100).toFixed(1)}% confidence`, 'info');
    this.log(`Classification: ${ai_analysis.is_misinformation ? 'MISINFORMATION' : 'CREDIBLE'}`, 'info');
    this.log(`Crisis Level: ${post.urgency_level.toUpperCase()}`, 'info');

    return { post, ai_analysis };
  }

  async testFeedRetrieval() {
    this.log('Testing feed retrieval and display...', 'info');
    
    // Test basic feed retrieval
    const feedResponse = await postsAPI.getPosts();
    
    if (!feedResponse.success) {
      throw new Error(`Feed retrieval failed: ${feedResponse.error?.message || 'Unknown error'}`);
    }

    const { posts, pagination, filters } = feedResponse.data;

    // Verify response structure
    if (!Array.isArray(posts)) {
      throw new Error('Posts is not an array');
    }

    if (!pagination || typeof pagination.current_page !== 'number') {
      throw new Error('Invalid pagination structure');
    }

    if (!filters) {
      throw new Error('Missing filters in response');
    }

    // Verify posts have required fields for display
    for (const post of posts.slice(0, 5)) { // Check first 5 posts
      const requiredFields = [
        'id', 'title', 'content', 'created_at', 'urgency_level',
        'confidence_score', 'is_misinformation', 'upvotes', 'downvotes'
      ];

      for (const field of requiredFields) {
        if (post[field] === undefined) {
          throw new Error(`Post missing required field: ${field}`);
        }
      }

      // Verify data types
      if (typeof post.confidence_score !== 'number' || post.confidence_score < 0 || post.confidence_score > 1) {
        throw new Error(`Invalid confidence score: ${post.confidence_score}`);
      }

      if (typeof post.is_misinformation !== 'boolean') {
        throw new Error(`Invalid misinformation flag: ${post.is_misinformation}`);
      }

      if (!['critical', 'high', 'medium'].includes(post.urgency_level)) {
        throw new Error(`Invalid urgency level: ${post.urgency_level}`);
      }
    }

    this.log(`Feed retrieved successfully: ${posts.length} posts`, 'success');
    this.log(`Pagination: Page ${pagination.current_page}, ${pagination.total_returned} returned`, 'info');

    return { posts, pagination, filters };
  }

  async testFeedFiltering() {
    this.log('Testing feed filtering functionality...', 'info');
    
    // Test urgency level filtering
    const criticalResponse = await postsAPI.getPosts({ urgency_level: 'critical' });
    
    if (!criticalResponse.success) {
      throw new Error('Critical level filtering failed');
    }

    // Verify all returned posts are critical
    const criticalPosts = criticalResponse.data.posts;
    for (const post of criticalPosts) {
      if (post.urgency_level !== 'critical') {
        throw new Error(`Non-critical post in critical filter: ${post.urgency_level}`);
      }
    }

    // Test misinformation filtering
    const misinfoResponse = await postsAPI.getPosts({ is_misinformation: true });
    
    if (!misinfoResponse.success) {
      throw new Error('Misinformation filtering failed');
    }

    // Verify all returned posts are misinformation
    const misinfoPosts = misinfoResponse.data.posts;
    for (const post of misinfoPosts) {
      if (!post.is_misinformation) {
        throw new Error('Non-misinformation post in misinformation filter');
      }
    }

    this.log(`Filtering verified: ${criticalPosts.length} critical, ${misinfoPosts.length} misinformation`, 'success');
  }

  async testFeedSorting() {
    this.log('Testing feed sorting functionality...', 'info');
    
    // Test sorting by confidence score
    const confidenceResponse = await postsAPI.getPosts({ 
      sort_by: 'confidence_score', 
      sort_order: 'desc',
      limit: 10
    });
    
    if (!confidenceResponse.success) {
      throw new Error('Confidence sorting failed');
    }

    const confidencePosts = confidenceResponse.data.posts;
    
    // Verify posts are sorted by confidence (descending)
    for (let i = 1; i < confidencePosts.length; i++) {
      if (confidencePosts[i].confidence_score > confidencePosts[i - 1].confidence_score) {
        throw new Error('Posts not sorted by confidence score correctly');
      }
    }

    // Test sorting by creation date
    const dateResponse = await postsAPI.getPosts({ 
      sort_by: 'created_at', 
      sort_order: 'desc',
      limit: 10
    });
    
    if (!dateResponse.success) {
      throw new Error('Date sorting failed');
    }

    const datePosts = dateResponse.data.posts;
    
    // Verify posts are sorted by date (descending)
    for (let i = 1; i < datePosts.length; i++) {
      const currentDate = new Date(datePosts[i].created_at);
      const previousDate = new Date(datePosts[i - 1].created_at);
      
      if (currentDate > previousDate) {
        throw new Error('Posts not sorted by date correctly');
      }
    }

    this.log('Sorting verified: confidence and date sorting working', 'success');
  }

  async testCompleteWorkflow() {
    this.log('Testing complete workflow integration...', 'info');
    
    // Step 1: Submit content
    const { post } = await this.testContentSubmission();
    
    // Step 2: Verify it appears in feed
    const { posts } = await this.testFeedRetrieval();
    
    const postInFeed = posts.find(p => p.id === post.id);
    if (!postInFeed) {
      throw new Error('Submitted post not found in feed');
    }

    // Step 3: Verify data consistency
    if (postInFeed.title !== post.title) {
      throw new Error('Post title inconsistent between submission and feed');
    }

    if (postInFeed.content !== post.content) {
      throw new Error('Post content inconsistent between submission and feed');
    }

    if (postInFeed.confidence_score !== post.confidence_score) {
      throw new Error('Confidence score inconsistent between submission and feed');
    }

    if (postInFeed.is_misinformation !== post.is_misinformation) {
      throw new Error('Misinformation flag inconsistent between submission and feed');
    }

    // Step 4: Test filtering with our post
    if (post.is_misinformation) {
      const misinfoFeed = await postsAPI.getPosts({ is_misinformation: true });
      const postInMisinfoFeed = misinfoFeed.data.posts.find(p => p.id === post.id);
      
      if (!postInMisinfoFeed) {
        throw new Error('Misinformation post not found in misinformation filter');
      }
    }

    this.log('Complete workflow integration verified successfully', 'success');
  }

  async runAllTests() {
    this.log('🚀 Starting Frontend End-to-End Tests', 'info');
    this.log('📋 Testing: Submit Content → AI Analysis → Display in Feed', 'info');
    this.log('🎯 Requirements: 1.1, 2.1, 4.1', 'info');
    this.log('', 'info');

    const tests = [
      ['API Connectivity', () => this.testAPIConnectivity()],
      ['Content Submission', () => this.testContentSubmission()],
      ['Feed Retrieval', () => this.testFeedRetrieval()],
      ['Feed Filtering', () => this.testFeedFiltering()],
      ['Feed Sorting', () => this.testFeedSorting()],
      ['Complete Workflow', () => this.testCompleteWorkflow()]
    ];

    let passed = 0;
    let failed = 0;

    for (const [testName, testFn] of tests) {
      const success = await this.runTest(testName, testFn);
      if (success) {
        passed++;
      } else {
        failed++;
      }
    }

    await this.cleanup();

    this.log('', 'info');
    this.log('📊 Test Results Summary:', 'info');
    this.log(`✅ Passed: ${passed}`, 'success');
    this.log(`❌ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'info');

    if (failed === 0) {
      this.log('🎉 All tests passed! End-to-end flow is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check the logs above.', 'error');
    }

    return { passed, failed, total: passed + failed };
  }
}

// Export for use in other files
export default FrontendE2ETest;

// Run tests if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FrontendE2ETest();
  tester.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}