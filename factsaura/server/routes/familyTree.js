// Family Tree Routes
// API endpoints for misinformation genealogy operations
const express = require('express');
const FamilyTreeController = require('../controllers/familyTreeController');

const router = express.Router();
const familyTreeController = new FamilyTreeController();

// Get global genealogy statistics (must be before /:familyId route)
router.get('/statistics', async (req, res) => {
  await familyTreeController.getGenealogyStatistics(req, res);
});

// Create new family tree
router.post('/', async (req, res) => {
  await familyTreeController.createFamilyTree(req, res);
});

// Add mutation to existing family tree
router.post('/:familyId/mutations', async (req, res) => {
  await familyTreeController.addMutation(req, res);
});

// Get complete family tree
router.get('/:familyId', async (req, res) => {
  await familyTreeController.getFamilyTree(req, res);
});

// Get genealogy path for a specific node
router.get('/node/:nodeId/genealogy', async (req, res) => {
  await familyTreeController.getGenealogyPath(req, res);
});

// Get descendants of a specific node
router.get('/node/:nodeId/descendants', async (req, res) => {
  await familyTreeController.getDescendants(req, res);
});

// Find common ancestors between two nodes
router.get('/common-ancestors/:nodeId1/:nodeId2', async (req, res) => {
  await familyTreeController.findCommonAncestors(req, res);
});

// Analyze mutation patterns in family tree
router.get('/:familyId/patterns', async (req, res) => {
  await familyTreeController.analyzeMutationPatterns(req, res);
});

// Get visualization data for family tree
router.get('/:familyId/visualization', async (req, res) => {
  await familyTreeController.getVisualizationData(req, res);
});

// This route is now moved above to avoid conflict with /:familyId

// Search family trees by content similarity
router.post('/search', async (req, res) => {
  await familyTreeController.searchFamilyTrees(req, res);
});

module.exports = router;