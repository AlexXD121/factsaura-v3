// Misinformation Family Tree Data Structure Service
// Implements genealogy tracking for misinformation mutations with tree visualization
const crypto = require('crypto');

class MisinformationFamilyTreeService {
  constructor() {
    // Family tree configuration
    this.maxTreeDepth = parseInt(process.env.MAX_TREE_DEPTH) || 15;
    this.maxChildrenPerNode = parseInt(process.env.MAX_CHILDREN_PER_NODE) || 50;
    this.treeIndexingEnabled = process.env.TREE_INDEXING_ENABLED !== 'false';
    
    // Core data structures for family tree
    this.familyTrees = new Map(); // familyId -> FamilyTree
    this.nodeIndex = new Map(); // nodeId -> TreeNode
    this.contentToNode = new Map(); // contentHash -> nodeId
    this.parentChildIndex = new Map(); // parentId -> Set(childIds)
    this.childParentIndex = new Map(); // childId -> parentId
    
    // Tree traversal and analysis caches
    this.pathCache = new Map(); // nodeId -> paths to root
    this.depthCache = new Map(); // nodeId -> depth from root
    this.subtreeCache = new Map(); // nodeId -> subtree structure
    
    // Genealogy analysis metrics
    this.genealogyMetrics = {
      totalFamilies: 0,
      totalNodes: 0,
      averageDepth: 0,
      maxDepth: 0,
      averageBranchingFactor: 0,
      mostMutatedFamily: null
    };
  }

  /**
   * Create a new family tree with original misinformation as root
   * @param {string} originalContent - Original misinformation content
   * @param {Object} metadata - Additional metadata for the original content
   * @returns {Object} Created family tree information
   */
  createFamilyTree(originalContent, metadata = {}) {
    try {
      const familyId = crypto.randomUUID();
      const rootNodeId = crypto.randomUUID();
      const contentHash = this._generateContentHash(originalContent);
      const timestamp = new Date().toISOString();
      
      // Create root node (original misinformation)
      const rootNode = {
        nodeId: rootNodeId,
        familyId: familyId,
        content: originalContent,
        contentHash: contentHash,
        nodeType: 'original',
        generation: 0,
        depth: 0,
        parentId: null,
        children: new Set(),
        metadata: {
          ...metadata,
          createdAt: timestamp,
          lastUpdated: timestamp
        },
        genealogyData: {
          totalDescendants: 0,
          directChildren: 0,
          maxDescendantDepth: 0,
          mutationPatterns: [],
          spreadMetrics: {
            totalSpread: 0,
            spreadRate: 0,
            peakSpreadTime: null
          }
        }
      };
      
      // Create family tree structure
      const familyTree = {
        familyId: familyId,
        rootNodeId: rootNodeId,
        createdAt: timestamp,
        lastUpdated: timestamp,
        treeMetrics: {
          totalNodes: 1,
          maxDepth: 0,
          totalBranches: 0,
          averageBranchingFactor: 0,
          leafNodes: 1,
          activeNodes: 1
        },
        genealogyAnalysis: {
          dominantMutationTypes: [],
          evolutionPatterns: [],
          spreadAnalysis: {
            totalReach: 1,
            spreadVelocity: 0,
            viralityScore: 0
          }
        },
        treeStructure: {
          levels: new Map([[0, new Set([rootNodeId])]]),
          branches: new Map(),
          paths: new Map()
        }
      };
      
      // Store in data structures
      this.familyTrees.set(familyId, familyTree);
      this.nodeIndex.set(rootNodeId, rootNode);
      this.contentToNode.set(contentHash, rootNodeId);
      this.parentChildIndex.set(rootNodeId, new Set());
      
      // Update genealogy metrics
      this._updateGenealogyMetrics();
      
      return {
        success: true,
        familyId: familyId,
        rootNodeId: rootNodeId,
        treeCreated: true,
        initialMetrics: familyTree.treeMetrics
      };
      
    } catch (error) {
      console.error('Failed to create family tree:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add a mutation node to an existing family tree
   * @param {string} familyId - Target family tree ID
   * @param {string} parentNodeId - Parent node ID for the mutation
   * @param {string} mutationContent - Content of the mutation
   * @param {Object} mutationData - Mutation analysis data
   * @returns {Object} Added mutation node information
   */
  addMutationNode(familyId, parentNodeId, mutationContent, mutationData = {}) {
    try {
      const familyTree = this.familyTrees.get(familyId);
      const parentNode = this.nodeIndex.get(parentNodeId);
      
      if (!familyTree) {
        throw new Error(`Family tree ${familyId} not found`);
      }
      
      if (!parentNode) {
        throw new Error(`Parent node ${parentNodeId} not found`);
      }
      
      // Check tree depth limits
      if (parentNode.depth >= this.maxTreeDepth - 1) {
        throw new Error(`Maximum tree depth (${this.maxTreeDepth}) would be exceeded`);
      }
      
      // Check children limits
      if (parentNode.children.size >= this.maxChildrenPerNode) {
        throw new Error(`Maximum children per node (${this.maxChildrenPerNode}) exceeded`);
      }
      
      const mutationNodeId = crypto.randomUUID();
      const contentHash = this._generateContentHash(mutationContent);
      const timestamp = new Date().toISOString();
      const generation = parentNode.generation + 1;
      const depth = parentNode.depth + 1;
      
      // Create mutation node
      const mutationNode = {
        nodeId: mutationNodeId,
        familyId: familyId,
        content: mutationContent,
        contentHash: contentHash,
        nodeType: 'mutation',
        generation: generation,
        depth: depth,
        parentId: parentNodeId,
        children: new Set(),
        metadata: {
          ...mutationData.metadata || {},
          createdAt: timestamp,
          lastUpdated: timestamp,
          mutationType: mutationData.mutationType || 'unknown',
          similarityScore: mutationData.similarityScore || 0,
          mutationConfidence: mutationData.confidence || 0
        },
        genealogyData: {
          totalDescendants: 0,
          directChildren: 0,
          maxDescendantDepth: 0,
          mutationPatterns: mutationData.mutationPatterns || [],
          spreadMetrics: {
            totalSpread: 0,
            spreadRate: 0,
            peakSpreadTime: null
          },
          ancestryPath: this._buildAncestryPath(parentNodeId)
        }
      };
      
      // Update parent-child relationships
      parentNode.children.add(mutationNodeId);
      parentNode.genealogyData.directChildren++;
      parentNode.genealogyData.totalDescendants++;
      parentNode.metadata.lastUpdated = timestamp;
      
      // Update family tree structure
      this._updateFamilyTreeStructure(familyTree, mutationNode);
      
      // Store in indexes
      this.nodeIndex.set(mutationNodeId, mutationNode);
      this.contentToNode.set(contentHash, mutationNodeId);
      this.parentChildIndex.set(mutationNodeId, new Set());
      this.childParentIndex.set(mutationNodeId, parentNodeId);
      
      // Update parent's children index
      if (!this.parentChildIndex.has(parentNodeId)) {
        this.parentChildIndex.set(parentNodeId, new Set());
      }
      this.parentChildIndex.get(parentNodeId).add(mutationNodeId);
      
      // Update ancestor descendant counts
      this._updateAncestorDescendantCounts(parentNodeId);
      
      // Update family tree metrics
      this._updateFamilyTreeMetrics(familyTree);
      
      // Clear relevant caches
      this._clearCachesForNode(mutationNodeId);
      
      return {
        success: true,
        mutationNodeId: mutationNodeId,
        familyId: familyId,
        parentNodeId: parentNodeId,
        generation: generation,
        depth: depth,
        treeMetrics: familyTree.treeMetrics
      };
      
    } catch (error) {
      console.error('Failed to add mutation node:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get complete family tree structure with genealogy data
   * @param {string} familyId - Family tree ID
   * @param {Object} options - Tree retrieval options
   * @returns {Object} Complete family tree structure
   */
  getFamilyTree(familyId, options = {}) {
    try {
      const familyTree = this.familyTrees.get(familyId);
      if (!familyTree) {
        return {
          found: false,
          error: 'Family tree not found'
        };
      }
      
      const includeContent = options.includeContent !== false;
      const maxDepth = options.maxDepth || this.maxTreeDepth;
      const includeMetrics = options.includeMetrics !== false;
      
      // Build tree structure
      const treeStructure = this._buildTreeStructure(familyTree.rootNodeId, maxDepth, includeContent);
      
      // Get genealogy analysis
      const genealogyAnalysis = includeMetrics ? this._analyzeTreeGenealogy(familyTree) : null;
      
      return {
        found: true,
        familyId: familyId,
        rootNodeId: familyTree.rootNodeId,
        createdAt: familyTree.createdAt,
        lastUpdated: familyTree.lastUpdated,
        treeMetrics: familyTree.treeMetrics,
        treeStructure: treeStructure,
        genealogyAnalysis: genealogyAnalysis,
        visualizationData: this._generateVisualizationData(familyTree)
      };
      
    } catch (error) {
      console.error('Failed to get family tree:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Get genealogy path from any node to the root
   * @param {string} nodeId - Starting node ID
   * @returns {Array} Array of nodes from target to root
   */
  getGenealogyPath(nodeId) {
    try {
      // Check cache first
      if (this.pathCache.has(nodeId)) {
        return this.pathCache.get(nodeId);
      }
      
      const path = [];
      let currentNodeId = nodeId;
      const visited = new Set();
      
      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const node = this.nodeIndex.get(currentNodeId);
        
        if (!node) {
          break;
        }
        
        path.push({
          nodeId: currentNodeId,
          content: node.content,
          nodeType: node.nodeType,
          generation: node.generation,
          depth: node.depth,
          mutationType: node.metadata.mutationType,
          createdAt: node.metadata.createdAt
        });
        
        currentNodeId = node.parentId;
      }
      
      // Cache the result
      this.pathCache.set(nodeId, path);
      
      return path;
      
    } catch (error) {
      console.error('Failed to get genealogy path:', error.message);
      return [];
    }
  }

  /**
   * Find all descendants of a given node
   * @param {string} nodeId - Parent node ID
   * @param {Object} options - Search options
   * @returns {Array} Array of descendant nodes
   */
  getDescendants(nodeId, options = {}) {
    try {
      const maxDepth = options.maxDepth || this.maxTreeDepth;
      const includeContent = options.includeContent !== false;
      const filterByType = options.filterByType;
      
      const descendants = [];
      const queue = [{nodeId: nodeId, currentDepth: 0}];
      const visited = new Set();
      
      while (queue.length > 0) {
        const {nodeId: currentNodeId, currentDepth} = queue.shift();
        
        if (visited.has(currentNodeId) || currentDepth >= maxDepth) {
          continue;
        }
        
        visited.add(currentNodeId);
        const node = this.nodeIndex.get(currentNodeId);
        
        if (!node) {
          continue;
        }
        
        // Skip the starting node itself
        if (currentNodeId !== nodeId) {
          if (!filterByType || node.nodeType === filterByType) {
            descendants.push({
              nodeId: currentNodeId,
              content: includeContent ? node.content : null,
              nodeType: node.nodeType,
              generation: node.generation,
              depth: node.depth,
              parentId: node.parentId,
              childrenCount: node.children.size,
              mutationType: node.metadata.mutationType,
              createdAt: node.metadata.createdAt
            });
          }
        }
        
        // Add children to queue
        for (const childId of node.children) {
          queue.push({nodeId: childId, currentDepth: currentDepth + 1});
        }
      }
      
      return descendants;
      
    } catch (error) {
      console.error('Failed to get descendants:', error.message);
      return [];
    }
  }

  /**
   * Find common ancestors between two nodes
   * @param {string} nodeId1 - First node ID
   * @param {string} nodeId2 - Second node ID
   * @returns {Object} Common ancestor analysis
   */
  findCommonAncestors(nodeId1, nodeId2) {
    try {
      const path1 = this.getGenealogyPath(nodeId1);
      const path2 = this.getGenealogyPath(nodeId2);
      
      if (path1.length === 0 || path2.length === 0) {
        return {
          found: false,
          error: 'Could not trace genealogy paths'
        };
      }
      
      // Find common ancestors
      const ancestors1 = new Set(path1.map(node => node.nodeId));
      const commonAncestors = path2.filter(node => ancestors1.has(node.nodeId));
      
      if (commonAncestors.length === 0) {
        return {
          found: false,
          reason: 'No common ancestors found (different families)'
        };
      }
      
      // Most recent common ancestor is the first in the list
      const mostRecentCommonAncestor = commonAncestors[0];
      
      return {
        found: true,
        mostRecentCommonAncestor: mostRecentCommonAncestor,
        allCommonAncestors: commonAncestors,
        relationshipAnalysis: {
          generationDistance1: path1.findIndex(node => node.nodeId === mostRecentCommonAncestor.nodeId),
          generationDistance2: path2.findIndex(node => node.nodeId === mostRecentCommonAncestor.nodeId),
          relationshipType: this._determineRelationshipType(path1, path2, mostRecentCommonAncestor)
        }
      };
      
    } catch (error) {
      console.error('Failed to find common ancestors:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze mutation patterns across the entire family tree
   * @param {string} familyId - Family tree ID
   * @returns {Object} Comprehensive mutation pattern analysis
   */
  analyzeMutationPatterns(familyId) {
    try {
      const familyTree = this.familyTrees.get(familyId);
      if (!familyTree) {
        return {
          found: false,
          error: 'Family tree not found'
        };
      }
      
      const allNodes = this._getAllNodesInFamily(familyId);
      const mutationNodes = allNodes.filter(node => node.nodeType === 'mutation');
      
      // Analyze mutation types
      const mutationTypeAnalysis = this._analyzeMutationTypes(mutationNodes);
      
      // Analyze generation patterns
      const generationAnalysis = this._analyzeGenerationPatterns(mutationNodes);
      
      // Analyze branching patterns
      const branchingAnalysis = this._analyzeBranchingPatterns(familyTree);
      
      // Analyze temporal patterns
      const temporalAnalysis = this._analyzeTemporalPatterns(mutationNodes);
      
      return {
        found: true,
        familyId: familyId,
        totalMutations: mutationNodes.length,
        analysisTimestamp: new Date().toISOString(),
        mutationTypeAnalysis: mutationTypeAnalysis,
        generationAnalysis: generationAnalysis,
        branchingAnalysis: branchingAnalysis,
        temporalAnalysis: temporalAnalysis,
        evolutionInsights: this._generateEvolutionInsights(mutationNodes, familyTree)
      };
      
    } catch (error) {
      console.error('Failed to analyze mutation patterns:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Generate visualization data for family tree rendering
   * @param {Object} familyTree - Family tree object
   * @returns {Object} Visualization-ready data structure
   */
  _generateVisualizationData(familyTree) {
    try {
      const nodes = [];
      const edges = [];
      const levels = new Map();
      
      // Traverse tree and collect visualization data
      const queue = [familyTree.rootNodeId];
      const visited = new Set();
      
      while (queue.length > 0) {
        const nodeId = queue.shift();
        
        if (visited.has(nodeId)) {
          continue;
        }
        
        visited.add(nodeId);
        const node = this.nodeIndex.get(nodeId);
        
        if (!node) {
          continue;
        }
        
        // Add node for visualization
        nodes.push({
          id: nodeId,
          label: this._generateNodeLabel(node),
          type: node.nodeType,
          generation: node.generation,
          depth: node.depth,
          childrenCount: node.children.size,
          mutationType: node.metadata.mutationType,
          confidence: node.metadata.mutationConfidence,
          size: this._calculateNodeSize(node),
          color: this._getNodeColor(node)
        });
        
        // Track levels for layout
        if (!levels.has(node.depth)) {
          levels.set(node.depth, []);
        }
        levels.get(node.depth).push(nodeId);
        
        // Add edges to children
        for (const childId of node.children) {
          edges.push({
            from: nodeId,
            to: childId,
            type: 'mutation',
            weight: this._calculateEdgeWeight(nodeId, childId)
          });
          
          queue.push(childId);
        }
      }
      
      return {
        nodes: nodes,
        edges: edges,
        levels: Object.fromEntries(levels),
        layout: {
          type: 'hierarchical',
          direction: 'top-down',
          levelSeparation: 100,
          nodeSeparation: 80
        },
        statistics: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          maxDepth: Math.max(...nodes.map(n => n.depth)),
          leafNodes: nodes.filter(n => n.childrenCount === 0).length
        }
      };
      
    } catch (error) {
      console.error('Failed to generate visualization data:', error.message);
      return {
        nodes: [],
        edges: [],
        error: error.message
      };
    }
  }

  // Private helper methods

  /**
   * Generate content hash for duplicate detection
   * @private
   */
  _generateContentHash(content) {
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Build ancestry path for a node
   * @private
   */
  _buildAncestryPath(nodeId) {
    const path = [];
    let currentId = nodeId;
    const visited = new Set();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = this.nodeIndex.get(currentId);
      if (node) {
        path.unshift({
          nodeId: currentId,
          generation: node.generation,
          mutationType: node.metadata.mutationType
        });
        currentId = node.parentId;
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Update family tree structure when adding new node
   * @private
   */
  _updateFamilyTreeStructure(familyTree, newNode) {
    // Update levels
    if (!familyTree.treeStructure.levels.has(newNode.depth)) {
      familyTree.treeStructure.levels.set(newNode.depth, new Set());
    }
    familyTree.treeStructure.levels.get(newNode.depth).add(newNode.nodeId);
    
    // Update max depth
    familyTree.treeMetrics.maxDepth = Math.max(familyTree.treeMetrics.maxDepth, newNode.depth);
    
    // Update total nodes
    familyTree.treeMetrics.totalNodes++;
    
    // Update timestamp
    familyTree.lastUpdated = newNode.metadata.createdAt;
  }

  /**
   * Update ancestor descendant counts
   * @private
   */
  _updateAncestorDescendantCounts(nodeId) {
    let currentId = nodeId;
    const visited = new Set();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = this.nodeIndex.get(currentId);
      if (node) {
        node.genealogyData.totalDescendants++;
        currentId = node.parentId;
      } else {
        break;
      }
    }
  }

  /**
   * Update family tree metrics
   * @private
   */
  _updateFamilyTreeMetrics(familyTree) {
    const allNodes = this._getAllNodesInFamily(familyTree.familyId);
    
    // Calculate branching factor
    const nodesWithChildren = allNodes.filter(node => node.children.size > 0);
    const totalChildren = nodesWithChildren.reduce((sum, node) => sum + node.children.size, 0);
    familyTree.treeMetrics.averageBranchingFactor = nodesWithChildren.length > 0 ? 
      totalChildren / nodesWithChildren.length : 0;
    
    // Count leaf nodes
    familyTree.treeMetrics.leafNodes = allNodes.filter(node => node.children.size === 0).length;
    
    // Count active nodes (nodes with recent activity)
    const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    familyTree.treeMetrics.activeNodes = allNodes.filter(node => 
      new Date(node.metadata.lastUpdated).getTime() > recentThreshold
    ).length;
  }

  /**
   * Get all nodes in a family
   * @private
   */
  _getAllNodesInFamily(familyId) {
    const nodes = [];
    for (const [nodeId, node] of this.nodeIndex) {
      if (node.familyId === familyId) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Build tree structure recursively
   * @private
   */
  _buildTreeStructure(nodeId, maxDepth, includeContent, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      return null;
    }
    
    const node = this.nodeIndex.get(nodeId);
    if (!node) {
      return null;
    }
    
    const children = [];
    for (const childId of node.children) {
      const childStructure = this._buildTreeStructure(childId, maxDepth, includeContent, currentDepth + 1);
      if (childStructure) {
        children.push(childStructure);
      }
    }
    
    return {
      nodeId: nodeId,
      content: includeContent ? node.content : null,
      nodeType: node.nodeType,
      generation: node.generation,
      depth: node.depth,
      childrenCount: node.children.size,
      metadata: node.metadata,
      genealogyData: node.genealogyData,
      children: children
    };
  }

  /**
   * Clear caches for a node and its ancestors
   * @private
   */
  _clearCachesForNode(nodeId) {
    // Clear path cache for this node and descendants
    this.pathCache.delete(nodeId);
    this.depthCache.delete(nodeId);
    this.subtreeCache.delete(nodeId);
    
    // Clear ancestor caches
    let currentId = nodeId;
    const visited = new Set();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      this.pathCache.delete(currentId);
      this.subtreeCache.delete(currentId);
      
      const node = this.nodeIndex.get(currentId);
      currentId = node ? node.parentId : null;
    }
  }

  /**
   * Update global genealogy metrics
   * @private
   */
  _updateGenealogyMetrics() {
    this.genealogyMetrics.totalFamilies = this.familyTrees.size;
    this.genealogyMetrics.totalNodes = this.nodeIndex.size;
    
    // Calculate average depth and max depth
    let totalDepth = 0;
    let maxDepth = 0;
    
    for (const [nodeId, node] of this.nodeIndex) {
      totalDepth += node.depth;
      maxDepth = Math.max(maxDepth, node.depth);
    }
    
    this.genealogyMetrics.averageDepth = this.nodeIndex.size > 0 ? totalDepth / this.nodeIndex.size : 0;
    this.genealogyMetrics.maxDepth = maxDepth;
    
    // Find most mutated family
    let mostMutatedFamily = null;
    let maxMutations = 0;
    
    for (const [familyId, familyTree] of this.familyTrees) {
      const mutationCount = familyTree.treeMetrics.totalNodes - 1; // Exclude root
      if (mutationCount > maxMutations) {
        maxMutations = mutationCount;
        mostMutatedFamily = familyId;
      }
    }
    
    this.genealogyMetrics.mostMutatedFamily = mostMutatedFamily;
  }

  /**
   * Generate node label for visualization
   * @private
   */
  _generateNodeLabel(node) {
    if (node.nodeType === 'original') {
      return 'Original';
    }
    
    const mutationType = node.metadata.mutationType || 'Unknown';
    return `${mutationType} (Gen ${node.generation})`;
  }

  /**
   * Calculate node size for visualization
   * @private
   */
  _calculateNodeSize(node) {
    const baseSize = 20;
    const childrenBonus = Math.min(node.children.size * 5, 30);
    const generationPenalty = node.generation * 2;
    
    return Math.max(baseSize + childrenBonus - generationPenalty, 10);
  }

  /**
   * Get node color based on type and properties
   * @private
   */
  _getNodeColor(node) {
    if (node.nodeType === 'original') {
      return '#ff4444'; // Red for original misinformation
    }
    
    // Color based on mutation type
    const mutationColors = {
      'word_substitution': '#ff8844',
      'phrase_addition': '#ffaa44',
      'context_shift': '#ffcc44',
      'emotional_amplification': '#ff6644',
      'source_modification': '#ff4488',
      'numerical_change': '#8844ff',
      'location_change': '#44ff88',
      'time_shift': '#4488ff'
    };
    
    return mutationColors[node.metadata.mutationType] || '#888888';
  }

  /**
   * Calculate edge weight for visualization
   * @private
   */
  _calculateEdgeWeight(parentId, childId) {
    const childNode = this.nodeIndex.get(childId);
    return childNode ? (childNode.metadata.similarityScore || 0.5) : 0.5;
  }

  /**
   * Analyze tree genealogy
   * @private
   */
  _analyzeTreeGenealogy(familyTree) {
    const allNodes = this._getAllNodesInFamily(familyTree.familyId);
    const mutationNodes = allNodes.filter(node => node.nodeType === 'mutation');
    
    return {
      totalGenerations: familyTree.treeMetrics.maxDepth + 1,
      mutationDensity: mutationNodes.length / allNodes.length,
      averageChildrenPerNode: familyTree.treeMetrics.averageBranchingFactor,
      evolutionComplexity: this._calculateEvolutionComplexity(familyTree),
      dominantMutationTypes: this._getDominantMutationTypes(mutationNodes),
      spreadPattern: this._analyzeSpreadPattern(familyTree)
    };
  }

  /**
   * Calculate evolution complexity score
   * @private
   */
  _calculateEvolutionComplexity(familyTree) {
    const depthWeight = familyTree.treeMetrics.maxDepth * 0.3;
    const branchingWeight = familyTree.treeMetrics.averageBranchingFactor * 0.4;
    const nodeWeight = Math.log(familyTree.treeMetrics.totalNodes) * 0.3;
    
    return Math.min(depthWeight + branchingWeight + nodeWeight, 10);
  }

  /**
   * Get dominant mutation types
   * @private
   */
  _getDominantMutationTypes(mutationNodes) {
    const typeCounts = {};
    
    mutationNodes.forEach(node => {
      const type = node.metadata.mutationType || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count, percentage: (count / mutationNodes.length) * 100 }));
  }

  /**
   * Analyze spread pattern
   * @private
   */
  _analyzeSpreadPattern(familyTree) {
    const levels = familyTree.treeStructure.levels;
    const spreadByLevel = [];
    
    for (const [level, nodes] of levels) {
      spreadByLevel.push({
        level: level,
        nodeCount: nodes.size,
        cumulativeNodes: spreadByLevel.reduce((sum, l) => sum + l.nodeCount, 0) + nodes.size
      });
    }
    
    return {
      spreadByLevel: spreadByLevel,
      peakSpreadLevel: spreadByLevel.reduce((max, current) => 
        current.nodeCount > max.nodeCount ? current : max, spreadByLevel[0]),
      spreadVelocity: this._calculateSpreadVelocity(spreadByLevel)
    };
  }

  /**
   * Calculate spread velocity
   * @private
   */
  _calculateSpreadVelocity(spreadByLevel) {
    if (spreadByLevel.length < 2) return 0;
    
    const velocities = [];
    for (let i = 1; i < spreadByLevel.length; i++) {
      const velocity = spreadByLevel[i].nodeCount - spreadByLevel[i-1].nodeCount;
      velocities.push(velocity);
    }
    
    return velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
  }

  /**
   * Determine relationship type between nodes
   * @private
   */
  _determineRelationshipType(path1, path2, commonAncestor) {
    const distance1 = path1.findIndex(node => node.nodeId === commonAncestor.nodeId);
    const distance2 = path2.findIndex(node => node.nodeId === commonAncestor.nodeId);
    
    if (distance1 === 0) return 'ancestor-descendant';
    if (distance2 === 0) return 'descendant-ancestor';
    if (distance1 === 1 && distance2 === 1) return 'siblings';
    if (distance1 === 1 || distance2 === 1) return 'uncle-nephew';
    return 'cousins';
  }

  /**
   * Analyze mutation types
   * @private
   */
  _analyzeMutationTypes(mutationNodes) {
    const typeAnalysis = {};
    
    mutationNodes.forEach(node => {
      const type = node.metadata.mutationType || 'unknown';
      if (!typeAnalysis[type]) {
        typeAnalysis[type] = {
          count: 0,
          averageGeneration: 0,
          averageConfidence: 0,
          generations: []
        };
      }
      
      typeAnalysis[type].count++;
      typeAnalysis[type].generations.push(node.generation);
      typeAnalysis[type].averageConfidence += (node.metadata.mutationConfidence || 0);
    });
    
    // Calculate averages
    Object.keys(typeAnalysis).forEach(type => {
      const analysis = typeAnalysis[type];
      analysis.averageGeneration = analysis.generations.reduce((sum, gen) => sum + gen, 0) / analysis.generations.length;
      analysis.averageConfidence = analysis.averageConfidence / analysis.count;
    });
    
    return typeAnalysis;
  }

  /**
   * Analyze generation patterns
   * @private
   */
  _analyzeGenerationPatterns(mutationNodes) {
    const generationCounts = {};
    
    mutationNodes.forEach(node => {
      const gen = node.generation;
      generationCounts[gen] = (generationCounts[gen] || 0) + 1;
    });
    
    return {
      generationDistribution: generationCounts,
      peakGeneration: Object.entries(generationCounts).reduce(([maxGen, maxCount], [gen, count]) => 
        count > maxCount ? [gen, count] : [maxGen, maxCount], ['0', 0]),
      generationSpread: Math.max(...Object.keys(generationCounts).map(Number)) - Math.min(...Object.keys(generationCounts).map(Number))
    };
  }

  /**
   * Analyze branching patterns
   * @private
   */
  _analyzeBranchingPatterns(familyTree) {
    const allNodes = this._getAllNodesInFamily(familyTree.familyId);
    const branchingFactors = allNodes.map(node => node.children.size);
    
    return {
      averageBranchingFactor: familyTree.treeMetrics.averageBranchingFactor,
      maxBranchingFactor: Math.max(...branchingFactors),
      branchingDistribution: this._calculateDistribution(branchingFactors),
      leafNodeRatio: familyTree.treeMetrics.leafNodes / familyTree.treeMetrics.totalNodes
    };
  }

  /**
   * Analyze temporal patterns
   * @private
   */
  _analyzeTemporalPatterns(mutationNodes) {
    const timestamps = mutationNodes.map(node => new Date(node.metadata.createdAt).getTime());
    timestamps.sort((a, b) => a - b);
    
    if (timestamps.length < 2) {
      return {
        totalTimespan: 0,
        averageInterval: 0,
        mutationRate: 0
      };
    }
    
    const totalTimespan = timestamps[timestamps.length - 1] - timestamps[0];
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    return {
      totalTimespan: totalTimespan,
      averageInterval: averageInterval,
      mutationRate: mutationNodes.length / (totalTimespan / (1000 * 60 * 60)), // mutations per hour
      temporalDistribution: this._analyzeTemporalDistribution(timestamps)
    };
  }

  /**
   * Calculate distribution of values
   * @private
   */
  _calculateDistribution(values) {
    const distribution = {};
    values.forEach(value => {
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Analyze temporal distribution
   * @private
   */
  _analyzeTemporalDistribution(timestamps) {
    // Group by hour of day
    const hourDistribution = {};
    
    timestamps.forEach(timestamp => {
      const hour = new Date(timestamp).getHours();
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });
    
    return {
      byHour: hourDistribution,
      peakHour: Object.entries(hourDistribution).reduce(([maxHour, maxCount], [hour, count]) => 
        count > maxCount ? [hour, count] : [maxHour, maxCount], ['0', 0])
    };
  }

  /**
   * Generate evolution insights
   * @private
   */
  _generateEvolutionInsights(mutationNodes, familyTree) {
    const insights = [];
    
    // Rapid evolution insight
    if (familyTree.treeMetrics.maxDepth > 5) {
      insights.push({
        type: 'rapid_evolution',
        message: `This misinformation has evolved through ${familyTree.treeMetrics.maxDepth + 1} generations`,
        severity: 'high'
      });
    }
    
    // Viral spread insight
    if (familyTree.treeMetrics.averageBranchingFactor > 3) {
      insights.push({
        type: 'viral_spread',
        message: `High branching factor (${familyTree.treeMetrics.averageBranchingFactor.toFixed(1)}) indicates viral spread`,
        severity: 'high'
      });
    }
    
    // Mutation diversity insight
    const uniqueMutationTypes = new Set(mutationNodes.map(node => node.metadata.mutationType)).size;
    if (uniqueMutationTypes > 4) {
      insights.push({
        type: 'high_diversity',
        message: `${uniqueMutationTypes} different mutation types detected - highly adaptive misinformation`,
        severity: 'medium'
      });
    }
    
    return insights;
  }
}

module.exports = MisinformationFamilyTreeService;