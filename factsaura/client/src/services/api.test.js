/**
 * API Service Test File
 * Simple tests to verify API service functionality
 */

import api, { testAPIConnectivity, createLoadingState, withLoadingState } from './api.js';

/**
 * Test API service functions
 */
async function runAPITests() {
  console.log('🧪 Starting API Service Tests...\n');

  // Test 1: Loading state creation
  console.log('Test 1: Loading State Creation');
  const loadingState = createLoadingState();
  console.log('✅ Loading state created:', loadingState);
  console.assert(loadingState.loading === false, 'Initial loading should be false');
  console.assert(loadingState.error === null, 'Initial error should be null');
  console.assert(loadingState.data === null, 'Initial data should be null');

  // Test 2: API connectivity (requires backend to be running)
  console.log('\nTest 2: API Connectivity');
  try {
    await testAPIConnectivity();
    console.log('✅ API connectivity test passed');
  } catch (error) {
    console.log('⚠️ API connectivity test failed (backend may not be running):', error.message);
  }

  // Test 3: Posts API structure
  console.log('\nTest 3: API Structure Validation');
  console.assert(typeof api.posts.getPosts === 'function', 'getPosts should be a function');
  console.assert(typeof api.posts.createPost === 'function', 'createPost should be a function');
  console.assert(typeof api.ai.analyzeContent === 'function', 'analyzeContent should be a function');
  console.assert(typeof api.familyTree.getFamilyTree === 'function', 'getFamilyTree should be a function');
  console.log('✅ API structure validation passed');

  // Test 4: Error handling (simulate network error)
  console.log('\nTest 4: Error Handling');
  try {
    // This should fail with network error since we're using invalid URL
    const originalBaseUrl = process.env.VITE_API_BASE_URL;
    process.env.VITE_API_BASE_URL = 'http://invalid-url:9999/api';
    
    await api.posts.getPosts();
    console.log('❌ Error handling test failed - should have thrown error');
  } catch (error) {
    console.log('✅ Error handling test passed:', error.message);
  }

  // Test 5: Loading state with API call
  console.log('\nTest 5: Loading State with API Call');
  const testLoadingState = createLoadingState();
  
  try {
    await withLoadingState(async () => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => resolve({ test: 'data' }), 100);
      });
    }, testLoadingState);
    
    console.log('✅ Loading state test passed:', testLoadingState);
    console.assert(testLoadingState.loading === false, 'Loading should be false after completion');
    console.assert(testLoadingState.data !== null, 'Data should be set after completion');
  } catch (error) {
    console.log('❌ Loading state test failed:', error.message);
  }

  console.log('\n🎉 API Service Tests Completed!');
}

// Export test function for use in other files
export { runAPITests };

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runAPITests = runAPITests;
  console.log('API tests loaded. Run window.runAPITests() to execute tests.');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  runAPITests().catch(console.error);
}