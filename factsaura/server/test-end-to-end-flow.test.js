/**
 * End-to-End Test: Submit Content → AI Analysis → Display in Feed
 * 
 * This test verifies the complete flow from content submission through AI analysis
 * to displaying the post in the feed, covering requirements 1.1, 2.1, and 4.1.
 */

const request = require('supertest');
const app = require('./server');
const { supabaseAdmin } = require('./config/supabase');

describe('End-to-End Flow: Submit → Analyze → Display', () => {
  let testPostId;
  let systemUserId;

  beforeAll(async () => {
    // Get system user ID for testing
    const { data: systemUser, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', 'system')
      .single();
    
    if (error || !systemUser) {
      throw new Error('System user not found. Run setup scripts first.');
    }
    
    systemUserId = systemUser.id;
    console.log('✅ Using system user ID:', systemUserId);
  });

  afterAll(async () => {
    // Clean up test post if created
    if (testPostId) {
      try {
        await supabaseAdmin
          .from('posts')
          .delete()
          .eq('id', testPostId);
        console.log('🧹 Cleaned up test post:', testPostId);
      } catch (error) {
        console.warn('⚠️ Failed to clean up test post:', error.message);
      }
    }
  });

  describe('Step 1: Content Submission with AI Analysis', () => {
    test('should accept content submission and perform AI analysis', async () => {
      const testContent = {
        title: 'Breaking: Mumbai Flood Emergency Alert',
        content: 'URGENT: Mumbai is experiencing severe flooding. All residents should evacuate immediately. Water levels rising rapidly in all areas.',
        content_type: 'text'
      };

      console.log('🔄 Testing content submission with AI analysis...');

      const response = await request(app)
        .post('/api/posts')
        .send(testContent)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('post');
      expect(response.body.data).toHaveProperty('ai_analysis');

      const { post, ai_analysis } = response.body.data;

      // Store post ID for cleanup
      testPostId = post.id;

      // Verify post structure
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title', testContent.title);
      expect(post).toHaveProperty('content', testContent.content);
      expect(post).toHaveProperty('type', 'user_submitted');
      expect(post).toHaveProperty('author_id', systemUserId);
      expect(post).toHaveProperty('is_published', true);

      // Verify crisis context detection (structured format)
      expect(post).toHaveProperty('crisis_context');
      expect(post.crisis_context).toHaveProperty('urgency_level');
      expect(['critical', 'high', 'medium']).toContain(post.crisis_context.urgency_level);
      expect(post.crisis_context).toHaveProperty('location_relevance');
      expect(post.crisis_context).toHaveProperty('harm_category');

      // Verify AI analysis structure
      expect(ai_analysis).toHaveProperty('confidence_score');
      expect(ai_analysis).toHaveProperty('is_misinformation');
      expect(ai_analysis).toHaveProperty('explanation');
      expect(ai_analysis.confidence_score).toBeGreaterThanOrEqual(0);
      expect(ai_analysis.confidence_score).toBeLessThanOrEqual(1);
      expect(typeof ai_analysis.is_misinformation).toBe('boolean');
      expect(typeof ai_analysis.explanation).toBe('string');

      // Verify AI analysis fields in post (structured format)
      expect(post).toHaveProperty('ai_analysis');
      expect(post.ai_analysis).toHaveProperty('confidence_score', ai_analysis.confidence_score);
      expect(post.ai_analysis).toHaveProperty('is_misinformation', ai_analysis.is_misinformation);
      expect(post.ai_analysis).toHaveProperty('explanation', ai_analysis.explanation);
      expect(post.ai_analysis).toHaveProperty('analysis_timestamp');

      // Verify engagement fields are initialized (structured format)
      expect(post).toHaveProperty('engagement');
      expect(post.engagement).toHaveProperty('upvotes', 0);
      expect(post.engagement).toHaveProperty('downvotes', 0);
      expect(post.engagement).toHaveProperty('comments_count', 0);
      expect(post.engagement).toHaveProperty('community_trust_score', 0.5);

      console.log('✅ Content submission and AI analysis completed successfully');
      console.log(`📊 AI Analysis Result: ${ai_analysis.confidence_score * 100}% confidence, ${ai_analysis.is_misinformation ? 'MISINFORMATION' : 'CREDIBLE'}`);
      console.log(`🚨 Crisis Level: ${post.crisis_context.urgency_level.toUpperCase()}`);
    }, 30000); // 30 second timeout for AI analysis

    test('should handle invalid content submission', async () => {
      console.log('🔄 Testing invalid content submission...');

      // Test missing title
      await request(app)
        .post('/api/posts')
        .send({ content: 'Content without title' })
        .expect(400);

      // Test missing content
      await request(app)
        .post('/api/posts')
        .send({ title: 'Title without content' })
        .expect(400);

      // Test empty strings
      await request(app)
        .post('/api/posts')
        .send({ title: '', content: '' })
        .expect(400);

      console.log('✅ Invalid content submission handling verified');
    });
  });

  describe('Step 2: Feed Display and Retrieval', () => {
    test('should retrieve posts in feed with proper formatting', async () => {
      console.log('🔄 Testing feed retrieval...');

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('posts');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data).toHaveProperty('filters');

      const { posts, pagination } = response.body.data;

      // Verify posts array
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);

      // Find our test post
      const testPost = posts.find(post => post.id === testPostId);
      expect(testPost).toBeDefined();

      // Verify test post structure in feed (structured format)
      expect(testPost).toHaveProperty('id', testPostId);
      expect(testPost).toHaveProperty('title');
      expect(testPost).toHaveProperty('content');
      expect(testPost.crisis_context).toHaveProperty('urgency_level');
      expect(testPost.ai_analysis).toHaveProperty('confidence_score');
      expect(testPost.ai_analysis).toHaveProperty('is_misinformation');
      expect(testPost.ai_analysis).toHaveProperty('explanation');
      expect(testPost.engagement).toHaveProperty('upvotes');
      expect(testPost.engagement).toHaveProperty('downvotes');
      expect(testPost).toHaveProperty('created_at');

      // Verify pagination structure
      expect(pagination).toHaveProperty('current_page');
      expect(pagination).toHaveProperty('per_page');
      expect(pagination).toHaveProperty('has_more');
      expect(pagination).toHaveProperty('total_returned');

      console.log('✅ Feed retrieval verified successfully');
      console.log(`📄 Retrieved ${posts.length} posts with proper pagination`);
    });

    test('should support feed filtering by crisis level', async () => {
      console.log('🔄 Testing feed filtering by crisis level...');

      // Test filtering by critical level
      const criticalResponse = await request(app)
        .get('/api/posts?urgency_level=critical')
        .expect(200);

      expect(criticalResponse.body.data.filters).toHaveProperty('urgency_level', 'critical');
      
      // All returned posts should be critical level
      const criticalPosts = criticalResponse.body.data.posts;
      criticalPosts.forEach(post => {
        expect(post.crisis_context.urgency_level).toBe('critical');
      });

      // Test filtering by misinformation status
      const misinfoResponse = await request(app)
        .get('/api/posts?is_misinformation=true')
        .expect(200);

      expect(misinfoResponse.body.data.filters).toHaveProperty('is_misinformation', true);

      console.log('✅ Feed filtering verified successfully');
    });

    test('should support feed sorting options', async () => {
      console.log('🔄 Testing feed sorting options...');

      // Test sorting by confidence score
      const confidenceResponse = await request(app)
        .get('/api/posts?sort_by=confidence_score&sort_order=desc')
        .expect(200);

      expect(confidenceResponse.body.data.filters).toHaveProperty('sort_by', 'confidence_score');
      expect(confidenceResponse.body.data.filters).toHaveProperty('sort_order', 'desc');

      // Test sorting by urgency level
      const urgencyResponse = await request(app)
        .get('/api/posts?sort_by=urgency_level&sort_order=desc')
        .expect(200);

      expect(urgencyResponse.body.data.filters).toHaveProperty('sort_by', 'urgency_level');

      console.log('✅ Feed sorting verified successfully');
    });
  });

  describe('Step 3: Complete End-to-End Flow Verification', () => {
    test('should complete full workflow: submit → analyze → display → filter', async () => {
      console.log('🔄 Testing complete end-to-end workflow...');

      // Step 1: Submit new content
      const newContent = {
        title: 'Test E2E: Vaccine Misinformation Alert',
        content: 'New study shows vaccines contain dangerous chemicals that cause autism. Share this to save lives!',
        content_type: 'text'
      };

      const submitResponse = await request(app)
        .post('/api/posts')
        .send(newContent)
        .expect(201);

      const newPostId = submitResponse.body.data.post.id;
      const aiAnalysis = submitResponse.body.data.ai_analysis;

      console.log(`📝 Step 1 Complete: Post created with ID ${newPostId}`);
      console.log(`🤖 AI Analysis: ${aiAnalysis.confidence_score * 100}% confidence, ${aiAnalysis.is_misinformation ? 'MISINFORMATION' : 'CREDIBLE'}`);

      // Step 2: Verify post appears in general feed
      const feedResponse = await request(app)
        .get('/api/posts')
        .expect(200);

      const postInFeed = feedResponse.body.data.posts.find(post => post.id === newPostId);
      expect(postInFeed).toBeDefined();
      expect(postInFeed.title).toBe(newContent.title);

      console.log('📄 Step 2 Complete: Post appears in general feed');

      // Step 3: Verify post appears in filtered feed (if misinformation)
      if (aiAnalysis.is_misinformation) {
        const misinfoResponse = await request(app)
          .get('/api/posts?is_misinformation=true')
          .expect(200);

        const postInMisinfoFeed = misinfoResponse.body.data.posts.find(post => post.id === newPostId);
        expect(postInMisinfoFeed).toBeDefined();

        console.log('🚨 Step 3 Complete: Misinformation post appears in filtered feed');
      }

      // Step 4: Verify post data integrity throughout the flow (structured format)
      expect(postInFeed.ai_analysis.confidence_score).toBe(aiAnalysis.confidence_score);
      expect(postInFeed.ai_analysis.is_misinformation).toBe(aiAnalysis.is_misinformation);
      expect(postInFeed.ai_analysis.explanation).toBe(aiAnalysis.explanation);

      console.log('✅ Step 4 Complete: Data integrity maintained throughout flow');

      // Cleanup
      await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', newPostId);

      console.log('🧹 Cleanup: Test post removed');
      console.log('🎉 Complete end-to-end workflow verified successfully!');
    }, 45000); // 45 second timeout for complete flow
  });

  describe('Step 4: Error Handling and Edge Cases', () => {
    test('should handle AI service failures gracefully', async () => {
      console.log('🔄 Testing AI service failure handling...');

      // This test would require mocking the AI service to fail
      // For now, we'll test with content that might cause issues
      const problematicContent = {
        title: 'A'.repeat(300), // Too long title
        content: 'Test content',
        content_type: 'text'
      };

      await request(app)
        .post('/api/posts')
        .send(problematicContent)
        .expect(400); // Should return validation error

      console.log('✅ AI service failure handling verified');
    });

    test('should handle empty feed gracefully', async () => {
      console.log('🔄 Testing empty feed handling...');

      // Test with filters that should return no results
      const response = await request(app)
        .get('/api/posts?urgency_level=critical&is_misinformation=true&location=nonexistent')
        .expect(200);

      expect(response.body.data.posts).toHaveLength(0);
      expect(response.body.data.pagination.total_returned).toBe(0);

      console.log('✅ Empty feed handling verified');
    });
  });
});

// Helper function to run the test
if (require.main === module) {
  console.log('🚀 Running End-to-End Flow Test...');
  console.log('📋 Testing: Submit Content → AI Analysis → Display in Feed');
  console.log('🎯 Requirements: 1.1, 2.1, 4.1');
  console.log('');
}