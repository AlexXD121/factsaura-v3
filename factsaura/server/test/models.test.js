const User = require('../models/User');
const Post = require('../models/Post');

describe('Model Classes', () => {
  describe('User Model', () => {
    test('should create User instance with correct properties', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        reputation_score: 100,
        badges: [{ type: 'truth_detective', level: 1 }],
        expertise_areas: ['medical'],
        location: 'Mumbai',
        is_verified: true,
        created_at: new Date().toISOString()
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.reputation_score).toBe(userData.reputation_score);
      expect(user.badges).toEqual(userData.badges);
      expect(user.is_verified).toBe(true);
    });

    test('should serialize user data correctly', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        reputation_score: 50,
        badges: [],
        expertise_areas: [],
        location: 'Mumbai'
      };

      const user = new User(userData);
      const serialized = user.toJSON();

      expect(serialized).toHaveProperty('id');
      expect(serialized).toHaveProperty('username');
      expect(serialized).toHaveProperty('reputation_score');
      expect(serialized).not.toHaveProperty('email'); // Should not expose email in public API
    });
  });

  describe('Post Model', () => {
    test('should create Post instance with correct properties', () => {
      const postData = {
        id: 'post-id',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'author-id',
        urgency_level: 'high',
        location_relevance: 'Mumbai',
        crisis_keywords: ['flood', 'emergency'],
        confidence_score: 0.85,
        is_misinformation: true,
        upvotes: 10,
        downvotes: 2,
        created_at: new Date().toISOString()
      };

      const post = new Post(postData);

      expect(post.id).toBe(postData.id);
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.urgency_level).toBe(postData.urgency_level);
      expect(post.confidence_score).toBe(postData.confidence_score);
      expect(post.is_misinformation).toBe(true);
      expect(post.upvotes).toBe(10);
      expect(post.downvotes).toBe(2);
    });

    test('should serialize post data correctly', () => {
      const postData = {
        id: 'post-id',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'author-id',
        urgency_level: 'medium',
        ai_analysis: { confidence: 0.8 },
        upvotes: 5,
        downvotes: 1
      };

      const post = new Post(postData);
      const serialized = post.toJSON();

      expect(serialized).toHaveProperty('id');
      expect(serialized).toHaveProperty('title');
      expect(serialized).toHaveProperty('content');
      expect(serialized).toHaveProperty('urgency_level');
      expect(serialized).toHaveProperty('upvotes');
      expect(serialized).toHaveProperty('downvotes');
    });

    test('should handle default values correctly', () => {
      const minimalPostData = {
        title: 'Minimal Post',
        content: 'Minimal content'
      };

      const post = new Post(minimalPostData);

      expect(post.content_type).toBe('text');
      expect(post.post_type).toBe('user_submitted');
      expect(post.urgency_level).toBe('medium');
      expect(post.upvotes).toBe(0);
      expect(post.downvotes).toBe(0);
      expect(post.confidence_score).toBe(0.000);
      expect(post.is_misinformation).toBe(false);
      expect(post.is_published).toBe(true);
    });
  });
});