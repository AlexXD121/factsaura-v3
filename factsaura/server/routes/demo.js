// Demo Routes
// API endpoints for creating demo data
const express = require('express');
const serviceRegistry = require('../services/serviceRegistry');
const FamilyTreeDemoData = require('../demo-data/family-tree-demo-data');
const DemoPostsData = require('../demo-data/demo-posts-data');
const DemoPostsCreator = require('../scripts/create-demo-posts');

const router = express.Router();
const familyTreeService = serviceRegistry.getFamilyTreeService();

// Initialize demo data generators
const demoPostsData = new DemoPostsData();
const demoPostsCreator = new DemoPostsCreator();

// Create demo family tree
router.post('/family-tree', async (req, res) => {
  try {
    console.log('🌳 Creating demo family tree via API...');
    
    // Generate demo data
    const demoData = new FamilyTreeDemoData();
    const familyTreeData = demoData.generateTurmericCovidFamilyTree();
    
    // Create root family tree using the shared service
    const rootNode = familyTreeData.nodes.find(n => n.nodeType === 'original');
    const createResult = familyTreeService.createFamilyTree(rootNode.content, {
      source: 'Demo',
      category: 'medical_misinformation',
      severity: 'high'
    });

    if (!createResult.success) {
      throw new Error(`Failed to create family tree: ${createResult.error}`);
    }

    const actualFamilyId = createResult.familyId;
    const actualRootNodeId = createResult.rootNodeId;

    console.log(`✅ Root family tree created with ID: ${actualFamilyId}`);

    // Add mutations using the shared service
    const mutationNodes = familyTreeData.nodes.filter(n => n.nodeType !== 'original');
    let addedMutations = 0;

    // Sort mutations by generation to add them in order
    mutationNodes.sort((a, b) => a.generation - b.generation);

    // Map old node IDs to new node IDs
    const nodeIdMap = new Map();
    nodeIdMap.set(rootNode.nodeId, actualRootNodeId);

    for (const mutation of mutationNodes) {
      try {
        // Find the actual parent ID
        const actualParentId = nodeIdMap.get(mutation.parentId);
        if (!actualParentId) {
          console.log(`⚠️ Skipping mutation ${mutation.nodeId} - parent not found`);
          continue;
        }

        const mutationResult = familyTreeService.addMutationNode(
          actualFamilyId,
          actualParentId,
          mutation.content,
          {
            mutationType: mutation.mutationType,
            confidence: mutation.confidence,
            metadata: {
              generation: mutation.generation,
              depth: mutation.depth,
              createdAt: mutation.createdAt
            }
          }
        );

        if (mutationResult.success) {
          nodeIdMap.set(mutation.nodeId, mutationResult.mutationNodeId);
          addedMutations++;
        } else {
          console.log(`⚠️ Failed to add mutation: ${mutationResult.error}`);
        }
      } catch (error) {
        console.log(`⚠️ Error adding mutation ${mutation.nodeId}: ${error.message}`);
      }
    }

    console.log(`✅ Added ${addedMutations} mutations to family tree`);
    
    res.json({
      success: true,
      message: 'Demo family tree created successfully',
      data: {
        familyId: actualFamilyId,
        totalNodes: addedMutations + 1, // +1 for root
        maxDepth: familyTreeData.treeMetrics.maxDepth,
        addedMutations: addedMutations
      }
    });
    
  } catch (error) {
    console.error('Error creating demo family tree:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating demo family tree'
    });
  }
});

/**
 * GET /api/demo/posts
 * Returns demo posts data for presentation
 */
router.get('/posts', async (req, res) => {
  try {
    console.log('📝 Generating demo posts data...');
    
    const demoPosts = demoPostsData.generateDemoPosts();
    const statistics = demoPostsData.getDemoStatistics(demoPosts);
    
    // Apply filters if provided
    const { urgency_level, is_misinformation, harm_category, confidence_min } = req.query;
    const filters = {};
    
    if (urgency_level) filters.urgency_level = urgency_level;
    if (is_misinformation !== undefined) filters.is_misinformation = is_misinformation === 'true';
    if (harm_category) filters.harm_category = harm_category;
    if (confidence_min) filters.confidence_min = parseFloat(confidence_min);
    
    const filteredPosts = Object.keys(filters).length > 0 
      ? demoPostsData.getFilteredPosts(demoPosts, filters)
      : demoPosts;
    
    console.log('✅ Demo posts data generated:', {
      totalPosts: demoPosts.length,
      filteredPosts: filteredPosts.length,
      misinformationDetected: statistics.misinformation_detected,
      averageConfidence: statistics.average_confidence
    });

    res.status(200).json({
      success: true,
      message: 'Demo posts data generated successfully',
      data: {
        posts: filteredPosts,
        statistics,
        filters: filters
      }
    });

  } catch (error) {
    console.error('❌ Error generating demo posts data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_POSTS_ERROR',
        message: 'Failed to generate demo posts data',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/demo/posts/create
 * Creates demo posts in the database
 */
router.post('/posts/create', async (req, res) => {
  try {
    console.log('🚀 Creating demo posts in database...');
    
    const result = await demoPostsCreator.createDemoPosts();
    
    console.log('✅ Demo posts created successfully:', {
      created: result.created_count,
      total: result.total_count
    });

    res.status(201).json({
      success: true,
      message: 'Demo posts created successfully in database',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating demo posts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_CREATION_ERROR',
        message: 'Failed to create demo posts in database',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/demo/posts/scenarios
 * Returns demo posts grouped by presentation scenarios
 */
router.get('/posts/scenarios', async (req, res) => {
  try {
    console.log('🎭 Generating demo presentation scenarios...');
    
    const scenarios = await demoPostsCreator.getDemoPostsForPresentation();
    
    res.status(200).json({
      success: true,
      message: 'Demo presentation scenarios generated',
      data: scenarios
    });

  } catch (error) {
    console.error('❌ Error generating demo scenarios:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_SCENARIOS_ERROR',
        message: 'Failed to generate demo scenarios',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/demo/statistics
 * Returns comprehensive demo statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    console.log('📊 Generating comprehensive demo statistics...');
    
    const demoPosts = demoPostsData.generateDemoPosts();
    const postsStats = demoPostsData.getDemoStatistics(demoPosts);
    
    const familyTreeData = new FamilyTreeDemoData().generateTurmericCovidFamilyTree();
    const familyStats = {
      totalNodes: familyTreeData.treeMetrics.totalNodes,
      maxDepth: familyTreeData.treeMetrics.maxDepth,
      mutationTypes: familyTreeData.genealogyAnalysis.dominantMutationTypes.length,
      spreadAnalysis: familyTreeData.genealogyAnalysis.spreadAnalysis
    };
    
    const comprehensiveStats = {
      posts: postsStats,
      familyTree: familyStats,
      demoReadiness: {
        totalDemoContent: demoPosts.length + familyTreeData.treeMetrics.totalNodes,
        misinformationCoverage: postsStats.detection_rate,
        confidenceSpectrum: {
          high: demoPosts.filter(p => p.confidence >= 0.8).length,
          medium: demoPosts.filter(p => p.confidence >= 0.5 && p.confidence < 0.8).length,
          low: demoPosts.filter(p => p.confidence < 0.5).length
        },
        crisisScenarios: demoPosts.filter(p => p.urgency_level === 'critical').length,
        aiGeneratedWarnings: postsStats.ai_generated_warnings
      }
    };
    
    console.log('✅ Comprehensive demo statistics generated');

    res.status(200).json({
      success: true,
      message: 'Comprehensive demo statistics generated',
      data: comprehensiveStats
    });

  } catch (error) {
    console.error('❌ Error generating comprehensive statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_STATS_ERROR',
        message: 'Failed to generate comprehensive statistics',
        details: error.message
      }
    });
  }
});

module.exports = router;