const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const aiRoutes = require('./ai');
const usersRoutes = require('./users');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/ai', aiRoutes);
router.use('/users', usersRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'FactSaura API v1.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      ai: '/api/ai',
      users: '/api/users'
    }
  });
});

module.exports = router;