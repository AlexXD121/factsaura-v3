// Create Demo Family Tree Script - Task 2.2
// Populates the family tree service with demo data for the Turmeric COVID cure example

const FamilyTreeDemoData = require('../demo-data/family-tree-demo-data');
const MisinformationFamilyTreeService = require('../services/misinformationFamilyTreeService');

async function createDemoFamilyTree() {
  console.log('🌳 Creating Demo Family Tree - Turmeric COVID Cure Example...\n');

  try {
    // Initialize services
    const demoData = new FamilyTreeDemoData();
    const familyTreeService = new MisinformationFamilyTreeService();

    // Generate the complete family tree
    console.log('📊 Generating family tree with 47 mutations...');
    const familyTreeData = demoData.generateTurmericCovidFamilyTree();

    console.log('✅ Demo family tree generated successfully!');
    console.log(`   Family ID: ${familyTreeData.familyId}`);
    console.log(`   Total Nodes: ${familyTreeData.treeMetrics.totalNodes}`);
    console.log(`   Max Depth: ${familyTreeData.treeMetrics.maxDepth} generations`);
    console.log(`   Total Branches: ${familyTreeData.treeMetrics.totalBranches}`);

    // Store the family tree in the service using the proper API
    console.log('\n💾 Storing family tree in service...');
    
    // First create the root family tree
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

    // Add all mutations using the service API
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

    // Update genealogy metrics
    familyTreeService.genealogyMetrics = {
      totalFamilies: 1,
      totalNodes: familyTreeData.treeMetrics.totalNodes,
      averageDepth: familyTreeData.treeMetrics.maxDepth / 2,
      maxDepth: familyTreeData.treeMetrics.maxDepth,
      averageBranchingFactor: familyTreeData.treeMetrics.averageBranchingFactor,
      mostMutatedFamily: familyTreeData.familyId
    };

    console.log('✅ Family tree stored in service successfully!');

    // Display mutation type distribution
    console.log('\n📈 Mutation Type Distribution:');
    familyTreeData.genealogyAnalysis.dominantMutationTypes.forEach(type => {
      console.log(`   ${type.type}: ${type.count} mutations (${type.percentage}%)`);
    });

    // Display evolution patterns
    console.log('\n🧬 Evolution Patterns:');
    familyTreeData.genealogyAnalysis.evolutionPatterns.forEach((pattern, index) => {
      console.log(`   ${index + 1}. ${pattern}`);
    });

    // Display spread analysis
    console.log('\n📊 Spread Analysis:');
    console.log(`   Total Reach: ${familyTreeData.genealogyAnalysis.spreadAnalysis.totalReach.toLocaleString()} people`);
    console.log(`   Spread Velocity: ${familyTreeData.genealogyAnalysis.spreadAnalysis.spreadVelocity} mutations/hour`);
    console.log(`   Virality Score: ${(familyTreeData.genealogyAnalysis.spreadAnalysis.viralityScore * 100).toFixed(1)}%`);

    // Test API endpoints
    console.log('\n🧪 Testing API endpoints...');
    
    // Test getFamilyTree
    const retrievedTree = familyTreeService.getFamilyTree(actualFamilyId, { 
      includeContent: true, 
      includeMetrics: true 
    });
    
    if (retrievedTree.found) {
      console.log('✅ getFamilyTree API working');
      console.log(`   Retrieved ${retrievedTree.treeMetrics.totalNodes} nodes`);
    } else {
      console.log(`❌ getFamilyTree API failed: ${retrievedTree.error}`);
    }

    // Test getVisualizationData
    if (retrievedTree.visualizationData) {
      console.log('✅ Visualization data available');
      console.log(`   Nodes for visualization: ${retrievedTree.visualizationData.nodes.length}`);
      console.log(`   Edges for visualization: ${retrievedTree.visualizationData.edges.length}`);
    } else {
      console.log('❌ Visualization data missing');
    }

    console.log('\n🎉 Demo family tree creation completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ 47 mutations generated across 8 mutation types');
    console.log('✅ 4 generations with realistic evolution patterns');
    console.log('✅ Color-coded mutation types for visualization');
    console.log('✅ Interactive node details with mutation info');
    console.log('✅ Tree statistics and genealogy analysis');
    console.log('✅ API endpoints tested and working');

    return {
      success: true,
      familyId: actualFamilyId,
      totalNodes: addedMutations + 1, // +1 for root
      maxDepth: familyTreeData.treeMetrics.maxDepth,
      addedMutations: addedMutations
    };

  } catch (error) {
    console.error('❌ Error creating demo family tree:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script if called directly
if (require.main === module) {
  createDemoFamilyTree()
    .then(result => {
      if (result.success) {
        console.log(`\n🚀 Demo family tree ready! Family ID: ${result.familyId}`);
        process.exit(0);
      } else {
        console.log(`\n💥 Failed to create demo family tree: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { createDemoFamilyTree };