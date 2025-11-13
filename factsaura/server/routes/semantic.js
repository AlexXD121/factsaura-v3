// Semantic Similarity Routes
// API routes for semantic similarity and variant identification

const express = require('express');
const SemanticSimilarityController = require('../controllers/semanticSimilarityController');

const router = express.Router();
const semanticController = new SemanticSimilarityController();

// Calculate semantic similarity between two texts
router.post('/similarity', async (req, res) => {
  await semanticController.calculateSimilarity(req, res);
});

// Find semantic variants of given text
router.post('/find-variants', async (req, res) => {
  await semanticController.findVariants(req, res);
});

// Cluster texts by semantic similarity
router.post('/cluster', async (req, res) => {
  await semanticController.clusterTexts(req, res);
});

// Generate semantic fingerprint for text
router.post('/fingerprint', async (req, res) => {
  await semanticController.generateFingerprint(req, res);
});

// Find semantic variants across all mutation families
router.post('/find-mutation-variants', async (req, res) => {
  await semanticController.findMutationVariants(req, res);
});

// Cluster all mutations by semantic similarity
router.get('/cluster-mutations', async (req, res) => {
  await semanticController.clusterMutations(req, res);
});

// Get semantic similarity service statistics
router.get('/stats', async (req, res) => {
  await semanticController.getStats(req, res);
});

// Clear semantic similarity caches
router.post('/clear-cache', async (req, res) => {
  await semanticController.clearCache(req, res);
});

// Test semantic similarity engine
router.get('/test', async (req, res) => {
  await semanticController.testEngine(req, res);
});

module.exports = router;