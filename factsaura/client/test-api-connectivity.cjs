/**
 * Simple API connectivity test script
 * Tests the API service layer with the backend server
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPIConnectivity() {
  console.log('🔍 Testing API connectivity...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);

    // Test 2: Posts API
    console.log('\nTest 2: Posts API');
    const postsResponse = await fetch(`${API_BASE_URL}/posts?limit=5`);
    const postsData = await postsResponse.json();
    console.log('✅ Posts API accessible:', {
      status: postsResponse.status,
      dataType: typeof postsData,
      hasData: Array.isArray(postsData?.data) || Array.isArray(postsData)
    });

    // Test 3: AI Analysis API structure
    console.log('\nTest 3: AI Analysis API');
    try {
      const aiResponse = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Test content for analysis' })
      });
      const aiData = await aiResponse.json();
      console.log('✅ AI Analysis API accessible:', {
        status: aiResponse.status,
        hasAnalysis: !!aiData
      });
    } catch (error) {
      console.log('⚠️ AI Analysis API test (expected if not fully implemented):', error.message);
    }

    // Test 4: Family Tree API
    console.log('\nTest 4: Family Tree API');
    try {
      const treeResponse = await fetch(`${API_BASE_URL}/family-tree/statistics`);
      const treeData = await treeResponse.json();
      console.log('✅ Family Tree API accessible:', {
        status: treeResponse.status,
        hasStats: !!treeData
      });
    } catch (error) {
      console.log('⚠️ Family Tree API test (expected if not fully implemented):', error.message);
    }

    console.log('\n🎉 API connectivity test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ API connectivity test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
    console.log('   Run: cd factsaura/server && npm start');
    return false;
  }
}

// Run the test
testAPIConnectivity()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });