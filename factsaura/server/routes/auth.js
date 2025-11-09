const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh', AuthController.refreshSession);
router.get('/check-username/:username', AuthController.checkUsername);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);

module.exports = router;