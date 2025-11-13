/**
 * GDELT API Endpoints Test Script
 * Tests all GDELT API HTTP endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/gdelt';

async function testGdeltEndpoints() {
  console.log('🌍 Testing GDELT API Endpoints...\n');
  
  try {
    // Test 1: Service Status
    console.log('1. Testing GET /api/gdelt/status');
    const statusResponse = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status Response:', JSON.stringify(statusResponse.data, null, 2));
    console.log();
    
    // Test 2: Connection Test
    console.log('2. Testing GET /api/gdelt/test');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Test Response:', JSON.stringify(testResponse.data, null, 2));
    console.log();
    
    if (!testResponse.data.success) {
      console.log('❌ Connection test failed, skipping further endpoint tests');
      return;
    }
    
    // Test 3: Global Events
    console.log('3. Testing GET /api/gdelt/events');
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      params: {
        query: 'crisis OR emergency',
        maxrecords: 5,
        timespan: '1day'
      }
    });
    console.log('✅ Events Response:');
    console.log(`   - Success: ${eventsResponse.data.success}`);
    console.log(`   - Message: ${eventsResponse.data.message}`);
    console.log(`   - Events count: ${eventsResponse.data.data.events.length}`);
    if (eventsResponse.data.data.events.length > 0) {
      console.log(`   - Sample event: ${eventsResponse.data.data.events[0].title}`);
    }
    console.log();
    
    // Test 4: Crisis Monitoring
    console.log('4. Testing GET /api/gdelt/crisis');
    const crisisResponse = await axios.get(`${BASE_URL}/crisis`);
    console.log('✅ Crisis Response:');
    console.log(`   - Success: ${crisisResponse.data.success}`);
    console.log(`   - Message: ${crisisResponse.data.message}`);
    console.log(`   - Crisis events count: ${crisisResponse.data.data.events.length}`);
    if (crisisResponse.data.data.events.length > 0) {
      const topCrisis = crisisResponse.data.data.events[0];
      console.log(`   - Top crisis: ${topCrisis.title}`);
      console.log(`   - Crisis score: ${topCrisis.crisisScore}`);
      console.log(`   - Urgency: ${topCrisis.urgencyLevel}`);
    }
    console.log();
    
    // Test 5: Trending Topics
    console.log('5. Testing GET /api/gdelt/trending');
    const trendingResponse = await axios.get(`${BASE_URL}/trending`, {
      params: {
        timespan: '1day',
        maxrecords: 5
      }
    });
    console.log('✅ Trending Response:');
    console.log(`   - Success: ${trendingResponse.data.success}`);
    console.log(`   - Message: ${trendingResponse.data.message}`);
    console.log(`   - Trending events count: ${trendingResponse.data.data.events.length}`);
    console.log();
    
    // Test 6: Event Search
    console.log('6. Testing GET /api/gdelt/search');
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: 'earthquake',
        maxrecords: 3,
        timespan: '1day'
      }
    });
    console.log('✅ Search Response:');
    console.log(`   - Success: ${searchResponse.data.success}`);
    console.log(`   - Message: ${searchResponse.data.message}`);
    console.log(`   - Search results count: ${searchResponse.data.data.events.length}`);
    console.log();
    
    // Test 7: Geographic Events
    console.log('7. Testing GET /api/gdelt/geographic');
    const geoResponse = await axios.get(`${BASE_URL}/geographic`, {
      params: {
        query: 'emergency',
        maxrecords: 10,
        timespan: '1day'
      }
    });
    console.log('✅ Geographic Response:');
    console.log(`   - Success: ${geoResponse.data.success}`);
    console.log(`   - Message: ${geoResponse.data.message}`);
    console.log(`   - Geographic events count: ${geoResponse.data.data.events.length}`);
    if (geoResponse.data.data.geographicDistribution) {
      console.log(`   - Countries: ${geoResponse.data.data.geographicDistribution.totalCountries}`);
      console.log(`   - Regions: ${geoResponse.data.data.geographicDistribution.totalRegions}`);
    }
    console.log();
    
    // Test 8: Error Handling - Missing Query Parameter
    console.log('8. Testing Error Handling - Missing Query Parameter');
    try {
      await axios.get(`${BASE_URL}/search`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling works correctly:');
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error response:', error.message);
      }
    }
    console.log();
    
    console.log('🎉 All GDELT API endpoint tests completed successfully!');
    
  } catch (error) {
    console.error('❌ GDELT API endpoint test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testGdeltEndpoints();
}

module.exports = { testGdeltEndpoints };