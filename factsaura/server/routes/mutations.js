// Mutation Routes - API endpoints for mutation detection and genealogy
const express = require('express');
const router = express.Router();
const mutationController = require('../controllers/mutationController');

/**
 * @route POST /api/mutations/analyze
 * @desc Analyze content for mutations
 * @access Public (for now)
 */
router.post('/analyze', mutationController.analyzeMutation);

/**
 * @route GET /api/mutations/family/:identifier
 * @desc Get mutation family tree by family ID or content hash
 * @access Public (for now)
 */
router.get('/family/:identifier', mutationController.getMutationFamily);

/**
 * @route GET /api/mutations/predict/:familyId
 * @desc Predict future mutations for a family
 * @access Public (for now)
 */
router.get('/predict/:familyId', mutationController.predictMutations);

/**
 * @route GET /api/mutations/statistics
 * @desc Get overall mutation statistics
 * @access Public (for now)
 */
router.get('/statistics', mutationController.getMutationStatistics);

/**
 * @route GET /api/mutations/trends
 * @desc Get mutation trends and patterns
 * @access Public (for now)
 */
router.get('/trends', mutationController.getMutationTrends);

module.exports = router;