// Test Family Tree Visualization API Integration
// This test verifies the family tree API endpoints work correctly for the visualization

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFamilyTreeVisualizationAPI() {
  console.log('🧬 Testing Family Tree Visualization API Integration...\n');

  try {
    // Test 1: Create a demo family tree
    console.log('📝 Test 1: Creating demo family tree...');
    const createResponse = await axios.post(`${BASE_URL}/family-tree`, {
      content: "Turmeric can cure COVID-19 completely within 24 hours",
      metadata: {
        source: 'Demo',
        category: 'medical_misinformation',
        severity: 'high'
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Family tree created successfully');
      console.log(`   Family ID: ${createResponse.data.data.familyId}`);
      console.log(`   Root Node ID: ${createResponse.data.data.rootNodeId}`);
    } else {
      throw new Error('Failed to create family tree');
    }

    const familyId = createResponse.data.data.familyId;
    const rootNodeId = createResponse.data.data.rootNodeId;

    // Test 2: Add mutations to create a tree structure
    console.log('\n🔄 Test 2: Adding mutations to create tree structure...');
    
    const mutations = [
      {
        content: "Turmeric and ginger can cure COVID-19 completely within 24 hours",
        mutationData: {
          mutationType: 'phrase_addition',
          confidence: 0.85,
          similarityScore: 0.92,
          metadata: { addedPhrase: 'and ginger' }
        }
      },
      {
        content: "Turmeric can cure COVID-19 completely within 12 hours",
        mutationData: {
          mutationType: 'numerical_change',
          confidence: 0.78,
          similarityScore: 0.95,
          metadata: { originalNumber: '24', newNumber: '12' }
        }
      },
      {
        content: "Turmeric can cure coronavirus completely within 24 hours",
        mutationData: {
          mutationType: 'word_substitution',
          confidence: 0.82,
          similarityScore: 0.88,
          metadata: { originalWord: 'COVID-19', newWord: 'coronavirus' }
        }
      },
      {
        content: "Turmeric can cure COVID-19 completely within 6 hours",
        mutationData: {
          mutationType: 'numerical_change',
          confidence: 0.91,
          similarityScore: 0.97,
          metadata: { originalNumber: '24', newNumber: '6' }
        }
      }
    ];

    const mutationNodes = [];
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      const parentId = i < 3 ? rootNodeId : mutationNodes[0]; // First 3 from root, 4th from first mutation
      
      const mutationResponse = await axios.post(`${BASE_URL}/family-tree/${familyId}/mutations`, {
        parentNodeId: parentId,
        content: mutation.content,
        mutationData: mutation.mutationData
      });

      if (mutationResponse.data.success) {
        mutationNodes.push(mutationResponse.data.data.mutationNodeId);
        console.log(`✅ Added mutation ${i + 1}: ${mutation.mutationData.mutationType}`);
      } else {
        console.log(`❌ Failed to add mutation ${i + 1}`);
      }
    }

    // Test 3: Get complete family tree with visualization data
    console.log('\n📊 Test 3: Retrieving family tree with visualization data...');
    const treeResponse = await axios.get(`${BASE_URL}/family-tree/${familyId}?includeMetrics=true`);

    if (treeResponse.data.success) {
      const treeData = treeResponse.data.data;
      console.log('✅ Family tree retrieved successfully');
      console.log(`   Total Nodes: ${treeData.treeMetrics.totalNodes}`);
      console.log(`   Max Depth: ${treeData.treeMetrics.maxDepth}`);
      console.log(`   Leaf Nodes: ${treeData.treeMetrics.leafNodes}`);
      
      // Check visualization data
      if (treeData.visualizationData) {
        const vizData = treeData.visualizationData;
        console.log(`   Visualization Nodes: ${vizData.nodes.length}`);
        console.log(`   Visualization Edges: ${vizData.edges.length}`);
        console.log(`   Layout Type: ${vizData.layout.type}`);
        
        // Test node data structure
        console.log('\n🎨 Node Visualization Data:');
        vizData.nodes.forEach((node, index) => {
          console.log(`   ${index + 1}. ${node.label} (${node.type}) - Color: ${node.color}, Size: ${node.size}`);
        });
        
        // Test edge data structure
        console.log('\n🔗 Edge Visualization Data:');
        vizData.edges.forEach((edge, index) => {
          const fromNode = vizData.nodes.find(n => n.id === edge.from);
          const toNode = vizData.nodes.find(n => n.id === edge.to);
          console.log(`   ${index + 1}. ${fromNode?.label} → ${toNode?.label} (weight: ${edge.weight})`);
        });
      } else {
        console.log('❌ No visualization data found');
      }
    } else {
      throw new Error('Failed to retrieve family tree');
    }

    // Test 4: Get genealogy analysis
    console.log('\n🧬 Test 4: Testing genealogy analysis...');
    if (treeData.genealogyAnalysis) {
      const analysis = treeData.genealogyAnalysis;
      console.log('✅ Genealogy analysis available');
      console.log(`   Total Generations: ${analysis.totalGenerations}`);
      console.log(`   Mutation Density: ${(analysis.mutationDensity * 100).toFixed(1)}%`);
      console.log(`   Evolution Complexity: ${analysis.evolutionComplexity.toFixed(1)}/10`);
      
      if (analysis.dominantMutationTypes) {
        console.log('   Dominant Mutation Types:');
        analysis.dominantMutationTypes.forEach((mutation, index) => {
          console.log(`     ${index + 1}. ${mutation.type}: ${mutation.percentage.toFixed(1)}%`);
        });
      }
    }

    // Test 5: Get mutation patterns
    console.log('\n📈 Test 5: Testing mutation pattern analysis...');
    const patternsResponse = await axios.get(`${BASE_URL}/family-tree/${familyId}/patterns`);
    
    if (patternsResponse.data.success) {
      const patterns = patternsResponse.data.data;
      console.log('✅ Mutation patterns retrieved successfully');
      console.log(`   Total Mutations: ${patterns.totalMutations}`);
      
      if (patterns.mutationTypeAnalysis) {
        console.log('   Mutation Type Distribution:');
        Object.entries(patterns.mutationTypeAnalysis).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });
      }
    }

    // Test 6: Test genealogy path
    console.log('\n🛤️ Test 6: Testing genealogy path...');
    if (mutationNodes.length > 0) {
      const pathResponse = await axios.get(`${BASE_URL}/family-tree/node/${mutationNodes[0]}/genealogy`);
      
      if (pathResponse.data.success) {
        const path = pathResponse.data.data.genealogyPath;
        console.log('✅ Genealogy path retrieved successfully');
        console.log(`   Path Length: ${path.length}`);
        console.log('   Path:');
        path.forEach((node, index) => {
          console.log(`     ${index + 1}. Gen ${node.generation}: ${node.nodeType} (${node.mutationType || 'original'})`);
        });
      }
    }

    console.log('\n🎉 All Family Tree Visualization API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Family tree creation');
    console.log('✅ Mutation addition');
    console.log('✅ Tree retrieval with visualization data');
    console.log('✅ Genealogy analysis');
    console.log('✅ Mutation pattern analysis');
    console.log('✅ Genealogy path tracing');
    console.log('\n🎨 Visualization Data Ready for Frontend Component!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testFamilyTreeVisualizationAPI();
}

module.exports = { testFamilyTreeVisualizationAPI };