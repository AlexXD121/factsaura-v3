const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const aiRoutes = require('./ai');
const usersRoutes = require('./users');
const mutationRoutes = require('./mutations');
const semanticRoutes = require('./semantic');
const familyTreeRoutes = require('./familyTree');
const communityImmunityRoutes = require('./communityImmunity');
const newsApiRoutes = require('./newsApi');
const redditRoutes = require('./reddit');
const gdeltRoutes = require('./gdelt');
const serviceHealthRoutes = require('./serviceHealth');
const contentScrapingRoutes = require('./contentScraping');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/ai', aiRoutes);
router.use('/users', usersRoutes);
router.use('/mutations', mutationRoutes);
router.use('/semantic', semanticRoutes);
router.use('/family-tree', familyTreeRoutes);
router.use('/community-immunity', communityImmunityRoutes);
router.use('/news', newsApiRoutes);
router.use('/reddit', redditRoutes);
router.use('/gdelt', gdeltRoutes);
router.use('/health', serviceHealthRoutes);
router.use('/content-scraping', contentScrapingRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'FactSaura API v1.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      ai: '/api/ai',
      users: '/api/users',
      mutations: '/api/mutations',
      semantic: '/api/semantic',
      familyTree: '/api/family-tree',
      communityImmunity: '/api/community-immunity',
      news: '/api/news',
      reddit: '/api/reddit',
      gdelt: '/api/gdelt',
      health: '/api/health',
      contentScraping: '/api/content-scraping'
    }
  });
});

module.exports = router;