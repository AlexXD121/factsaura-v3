// Test Family Tree API Endpoints
// Test the REST API endpoints for family tree operations
const request = require('supertest');
const express = require('express');
const familyTreeRoutes = require('./routes/familyTree');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/family-tree', familyTreeRoutes);

async function testFamilyTreeAPI() {
  console.log('🌐 Testing Family Tree API Endpoints...\n');
  
  let testsPassed = 0;
  let totalTests = 0;
  let createdFamilyId = null;
  let createdNodeId = null;
  
  // Test 1: Create Family Tree via API
  console.log('Test 1: POST /api/family-tree - Create Family Tree');
  totalTests++;
  try {
    const response = await request(app)
      .post('/api/family-tree')
      .send({
        content: "Drinking hot water prevents coronavirus infection",
        metadata: {
          source: 'social_media',
          location: 'mumbai',
          urgency: 'high'
        }
      });
    
    if (response.status === 201 && response.body.success && response.body.data.familyId) {
      console.log('✅ Family tree created via API successfully');
      console.log(`   Status: ${response.status}`);
      console.log(`   Family ID: ${response.body.data.familyId}`);
      console.log(`   Root Node ID: ${response.body.data.rootNodeId}`);
      
      createdFamilyId = response.body.data.familyId;
      createdNodeId = response.body.data.rootNodeId;
      testsPassed++;
    } else {
      console.log('❌ Failed to create family tree via API');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log('❌ Error testing create family tree API:', error.message);
  }
  
  // Test 2: Add Mutation via API
  console.log('\nTest 2: POST /api/family-tree/:familyId/mutations - Add Mutation');
  totalTests++;
  if (createdFamilyId && createdNodeId) {
    try {
      const response = await request(app)
        .post(`/api/family-tree/${createdFamilyId}/mutations`)
        .send({
          parentNodeId: createdNodeId,
          content: "Drinking hot water with lemon prevents coronavirus infection",
          mutationData: {
            mutationType: 'phrase_addition',
            similarityScore: 0.85,
            confidence: 0.9,
            metadata: {
              source: 'whatsapp',
              timestamp: new Date().toISOString()
            }
          }
        });
      
      if (response.status === 201 && response.body.success && response.body.data.mutationNodeId) {
        console.log('✅ Mutation added via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Mutation Node ID: ${response.body.data.mutationNodeId}`);
        console.log(`   Generation: ${response.body.data.generation}`);
        console.log(`   Depth: ${response.body.data.depth}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to add mutation via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing add mutation API:', error.message);
    }
  } else {
    console.log('❌ Skipping mutation test - no family tree created');
  }
  
  // Test 3: Get Family Tree via API
  console.log('\nTest 3: GET /api/family-tree/:familyId - Get Family Tree');
  totalTests++;
  if (createdFamilyId) {
    try {
      const response = await request(app)
        .get(`/api/family-tree/${createdFamilyId}`)
        .query({
          includeContent: 'true',
          includeMetrics: 'true'
        });
      
      if (response.status === 200 && response.body.success && response.body.data.found) {
        console.log('✅ Family tree retrieved via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Family ID: ${response.body.data.familyId}`);
        console.log(`   Total Nodes: ${response.body.data.treeMetrics.totalNodes}`);
        console.log(`   Max Depth: ${response.body.data.treeMetrics.maxDepth}`);
        console.log(`   Has Tree Structure: ${!!response.body.data.treeStructure}`);
        console.log(`   Has Visualization Data: ${!!response.body.data.visualizationData}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to retrieve family tree via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing get family tree API:', error.message);
    }
  } else {
    console.log('❌ Skipping get family tree test - no family tree created');
  }
  
  // Test 4: Get Genealogy Path via API
  console.log('\nTest 4: GET /api/family-tree/node/:nodeId/genealogy - Get Genealogy Path');
  totalTests++;
  if (createdNodeId) {
    try {
      const response = await request(app)
        .get(`/api/family-tree/node/${createdNodeId}/genealogy`);
      
      if (response.status === 200 && response.body.success && response.body.data.genealogyPath) {
        console.log('✅ Genealogy path retrieved via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Node ID: ${response.body.data.nodeId}`);
        console.log(`   Path Length: ${response.body.data.pathLength}`);
        console.log(`   Path Nodes: ${response.body.data.genealogyPath.length}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to retrieve genealogy path via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing genealogy path API:', error.message);
    }
  } else {
    console.log('❌ Skipping genealogy path test - no node created');
  }
  
  // Test 5: Get Descendants via API
  console.log('\nTest 5: GET /api/family-tree/node/:nodeId/descendants - Get Descendants');
  totalTests++;
  if (createdNodeId) {
    try {
      const response = await request(app)
        .get(`/api/family-tree/node/${createdNodeId}/descendants`)
        .query({
          maxDepth: '5',
          includeContent: 'true'
        });
      
      if (response.status === 200 && response.body.success && Array.isArray(response.body.data.descendants)) {
        console.log('✅ Descendants retrieved via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Node ID: ${response.body.data.nodeId}`);
        console.log(`   Total Descendants: ${response.body.data.totalDescendants}`);
        console.log(`   Descendants Array Length: ${response.body.data.descendants.length}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to retrieve descendants via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing descendants API:', error.message);
    }
  } else {
    console.log('❌ Skipping descendants test - no node created');
  }
  
  // Test 6: Get Mutation Patterns via API
  console.log('\nTest 6: GET /api/family-tree/:familyId/patterns - Get Mutation Patterns');
  totalTests++;
  if (createdFamilyId) {
    try {
      const response = await request(app)
        .get(`/api/family-tree/${createdFamilyId}/patterns`);
      
      if (response.status === 200 && response.body.success && response.body.data.found) {
        console.log('✅ Mutation patterns retrieved via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Family ID: ${response.body.data.familyId}`);
        console.log(`   Total Mutations: ${response.body.data.totalMutations}`);
        console.log(`   Has Mutation Type Analysis: ${!!response.body.data.mutationTypeAnalysis}`);
        console.log(`   Has Generation Analysis: ${!!response.body.data.generationAnalysis}`);
        console.log(`   Evolution Insights: ${response.body.data.evolutionInsights?.length || 0}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to retrieve mutation patterns via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing mutation patterns API:', error.message);
    }
  } else {
    console.log('❌ Skipping mutation patterns test - no family tree created');
  }
  
  // Test 7: Get Visualization Data via API
  console.log('\nTest 7: GET /api/family-tree/:familyId/visualization - Get Visualization Data');
  totalTests++;
  if (createdFamilyId) {
    try {
      const response = await request(app)
        .get(`/api/family-tree/${createdFamilyId}/visualization`);
      
      if (response.status === 200 && response.body.success && response.body.data.visualizationData) {
        console.log('✅ Visualization data retrieved via API successfully');
        console.log(`   Status: ${response.status}`);
        console.log(`   Family ID: ${response.body.data.familyId}`);
        console.log(`   Visualization Nodes: ${response.body.data.visualizationData.nodes?.length || 0}`);
        console.log(`   Visualization Edges: ${response.body.data.visualizationData.edges?.length || 0}`);
        console.log(`   Layout Type: ${response.body.data.visualizationData.layout?.type || 'unknown'}`);
        testsPassed++;
      } else {
        console.log('❌ Failed to retrieve visualization data via API');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.body);
      }
    } catch (error) {
      console.log('❌ Error testing visualization data API:', error.message);
    }
  } else {
    console.log('❌ Skipping visualization data test - no family tree created');
  }
  
  // Test 8: Get Global Statistics via API
  console.log('\nTest 8: GET /api/family-tree/statistics - Get Global Statistics');
  totalTests++;
  try {
    const response = await request(app)
      .get('/api/family-tree/statistics');
    
    if (response.status === 200 && response.body.success && response.body.data.globalMetrics) {
      console.log('✅ Global statistics retrieved via API successfully');
      console.log(`   Status: ${response.status}`);
      console.log(`   Total Families: ${response.body.data.globalMetrics.totalFamilies}`);
      console.log(`   Total Nodes: ${response.body.data.globalMetrics.totalNodes}`);
      console.log(`   Average Depth: ${response.body.data.globalMetrics.averageDepth.toFixed(2)}`);
      console.log(`   Max Depth: ${response.body.data.globalMetrics.maxDepth}`);
      testsPassed++;
    } else {
      console.log('❌ Failed to retrieve global statistics via API');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log('❌ Error testing global statistics API:', error.message);
  }
  
  // Test 9: Error Handling - Invalid Family ID
  console.log('\nTest 9: Error Handling - Invalid Family ID');
  totalTests++;
  try {
    const response = await request(app)
      .get('/api/family-tree/invalid-family-id-12345');
    
    if (response.status === 404 && !response.body.success) {
      console.log('✅ Error handling works correctly for invalid family ID');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error Message: ${response.body.error}`);
      testsPassed++;
    } else {
      console.log('❌ Error handling failed for invalid family ID');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log('❌ Error testing error handling:', error.message);
  }
  
  // Test 10: Validation - Missing Required Fields
  console.log('\nTest 10: Validation - Missing Required Fields');
  totalTests++;
  try {
    const response = await request(app)
      .post('/api/family-tree')
      .send({
        metadata: { source: 'test' }
        // Missing required 'content' field
      });
    
    if (response.status === 400 && !response.body.success) {
      console.log('✅ Validation works correctly for missing required fields');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error Message: ${response.body.error}`);
      testsPassed++;
    } else {
      console.log('❌ Validation failed for missing required fields');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    }
  } catch (error) {
    console.log('❌ Error testing validation:', error.message);
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(60));
  console.log('🌐 FAMILY TREE API TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${((testsPassed/totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL API TESTS PASSED! Family tree REST API is working correctly.');
  } else {
    console.log('\n⚠️  Some API tests failed. Please review the implementation.');
  }
  
  console.log('\n🌐 Family Tree API Endpoints Tested:');
  console.log('   ✅ POST /api/family-tree - Create family tree');
  console.log('   ✅ POST /api/family-tree/:familyId/mutations - Add mutation');
  console.log('   ✅ GET /api/family-tree/:familyId - Get family tree');
  console.log('   ✅ GET /api/family-tree/node/:nodeId/genealogy - Get genealogy path');
  console.log('   ✅ GET /api/family-tree/node/:nodeId/descendants - Get descendants');
  console.log('   ✅ GET /api/family-tree/:familyId/patterns - Get mutation patterns');
  console.log('   ✅ GET /api/family-tree/:familyId/visualization - Get visualization data');
  console.log('   ✅ GET /api/family-tree/statistics - Get global statistics');
  console.log('   ✅ Error handling for invalid requests');
  console.log('   ✅ Input validation for required fields');
}

// Run the test
if (require.main === module) {
  testFamilyTreeAPI().catch(console.error);
}

module.exports = { testFamilyTreeAPI };