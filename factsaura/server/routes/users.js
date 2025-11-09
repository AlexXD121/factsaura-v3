const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// User routes (to be implemented in later tasks)
router.post('/auth/login', usersController.login);
router.post('/auth/signup', usersController.signup);
router.get('/profile', usersController.getProfile);
router.put('/preferences', usersController.updatePreferences);

module.exports = router;