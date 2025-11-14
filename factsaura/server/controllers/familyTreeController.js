// Family Tree Controller
// Handles HTTP requests for misinformation genealogy operations
const serviceRegistry = require('../services/serviceRegistry');

class FamilyTreeController {
  constructor() {
    this.familyTreeService = serviceRegistry.getFamilyTreeService();
  }

  /**
   * Create a new family tree
   * POST /api/family-tree
   */
  async createFamilyTree(req, res) {
    try {
      const { content, metadata } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required to create family tree'
        });
      }
      
      const result = this.familyTreeService.createFamilyTree(content, metadata);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Family tree created successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Create family tree error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while creating family tree'
      });
    }
  }

  /**
   * Add mutation to existing family tree
   * POST /api/family-tree/:familyId/mutations
   */
  async addMutation(req, res) {
    try {
      const { familyId } = req.params;
      const { parentNodeId, content, mutationData } = req.body;
      
      if (!parentNodeId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Parent node ID and content are required'
        });
      }
      
      const result = this.familyTreeService.addMutationNode(
        familyId, 
        parentNodeId, 
        content, 
        mutationData
      );
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Mutation added successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Add mutation error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while adding mutation'
      });
    }
  }

  /**
   * Get complete family tree
   * GET /api/family-tree/:familyId
   */
  async getFamilyTree(req, res) {
    try {
      const { familyId } = req.params;
      const options = {
        includeContent: req.query.includeContent !== 'false',
        maxDepth: parseInt(req.query.maxDepth) || undefined,
        includeMetrics: req.query.includeMetrics !== 'false'
      };
      
      const result = this.familyTreeService.getFamilyTree(familyId, options);
      
      if (result.found) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error || 'Family tree not found'
        });
      }
      
    } catch (error) {
      console.error('Get family tree error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving family tree'
      });
    }
  }

  /**
   * Get genealogy path for a node
   * GET /api/family-tree/node/:nodeId/genealogy
   */
  async getGenealogyPath(req, res) {
    try {
      const { nodeId } = req.params;
      
      const path = this.familyTreeService.getGenealogyPath(nodeId);
      
      res.json({
        success: true,
        data: {
          nodeId: nodeId,
          genealogyPath: path,
          pathLength: path.length
        }
      });
      
    } catch (error) {
      console.error('Get genealogy path error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving genealogy path'
      });
    }
  }

  /**
   * Get descendants of a node
   * GET /api/family-tree/node/:nodeId/descendants
   */
  async getDescendants(req, res) {
    try {
      const { nodeId } = req.params;
      const options = {
        maxDepth: parseInt(req.query.maxDepth) || undefined,
        includeContent: req.query.includeContent !== 'false',
        filterByType: req.query.filterByType || undefined
      };
      
      const descendants = this.familyTreeService.getDescendants(nodeId, options);
      
      res.json({
        success: true,
        data: {
          nodeId: nodeId,
          descendants: descendants,
          totalDescendants: descendants.length
        }
      });
      
    } catch (error) {
      console.error('Get descendants error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving descendants'
      });
    }
  }

  /**
   * Find common ancestors between two nodes
   * GET /api/family-tree/common-ancestors/:nodeId1/:nodeId2
   */
  async findCommonAncestors(req, res) {
    try {
      const { nodeId1, nodeId2 } = req.params;
      
      const result = this.familyTreeService.findCommonAncestors(nodeId1, nodeId2);
      
      if (result.found) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error || result.reason || 'No common ancestors found'
        });
      }
      
    } catch (error) {
      console.error('Find common ancestors error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while finding common ancestors'
      });
    }
  }

  /**
   * Analyze mutation patterns in family tree
   * GET /api/family-tree/:familyId/patterns
   */
  async analyzeMutationPatterns(req, res) {
    try {
      const { familyId } = req.params;
      
      const result = this.familyTreeService.analyzeMutationPatterns(familyId);
      
      if (result.found) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error || 'Family tree not found'
        });
      }
      
    } catch (error) {
      console.error('Analyze mutation patterns error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while analyzing mutation patterns'
      });
    }
  }

  /**
   * Get visualization data for family tree
   * GET /api/family-tree/:familyId/visualization
   */
  async getVisualizationData(req, res) {
    try {
      const { familyId } = req.params;
      
      const familyTree = this.familyTreeService.getFamilyTree(familyId, { 
        includeContent: false, 
        includeMetrics: false 
      });
      
      if (!familyTree.found) {
        return res.status(404).json({
          success: false,
          error: 'Family tree not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          familyId: familyId,
          visualizationData: familyTree.visualizationData
        }
      });
      
    } catch (error) {
      console.error('Get visualization data error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving visualization data'
      });
    }
  }

  /**
   * Get global genealogy statistics
   * GET /api/family-tree/statistics
   */
  async getGenealogyStatistics(req, res) {
    try {
      const statistics = {
        globalMetrics: this.familyTreeService.genealogyMetrics,
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: statistics
      });
      
    } catch (error) {
      console.error('Get genealogy statistics error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving statistics'
      });
    }
  }

  /**
   * Search family trees by content similarity
   * POST /api/family-tree/search
   */
  async searchFamilyTrees(req, res) {
    try {
      const { content, options = {} } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required for search'
        });
      }
      
      // This would integrate with the mutation detection service
      // to find similar content across family trees
      const searchResults = {
        query: content,
        results: [],
        message: 'Family tree search functionality requires integration with mutation detection service'
      };
      
      res.json({
        success: true,
        data: searchResults
      });
      
    } catch (error) {
      console.error('Search family trees error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error while searching family trees'
      });
    }
  }
}

module.exports = FamilyTreeController;