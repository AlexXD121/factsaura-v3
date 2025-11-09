const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

// Posts routes (to be implemented in later tasks)
router.get('/', postsController.getPosts);
router.post('/', postsController.createPost);
router.get('/:id', postsController.getPostById);
router.put('/:id/vote', postsController.voteOnPost);
router.get('/:id/comments', postsController.getPostComments);

module.exports = router;