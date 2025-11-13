/**
 * GDELT API Integration Test Script
 * Tests all GDELT API functionality
 */

const GdeltApiService = require('../services/gdeltApiService');

async function testGdeltIntegration() {
  console.log('🌍 Testing GDELT API Integration...\n');
  
  const gdeltService = new GdeltApiService();
  
  try {
    // Test 1: Service Status
    console.log('1. Testing Service Status...');
    const status = gdeltService.getServiceStatus();
    console.log('✅ Service Status:', JSON.stringify(status, null, 2));
    console.log();
    
    // Test 2: Connection Test
    console.log('2. Testing API Connection...');
    const connectionTest = await gdeltService.testConnection();
    console.log('✅ Connection Test:', JSON.stringify(connectionTest, null, 2));
    console.log();
    
    if (!connectionTest.success) {
      console.log('❌ Connection failed, skipping further tests');
      return;
    }
    
    // Test 3: Global Events
    console.log('3. Testing Global Events...');
    const globalEvents = await gdeltService.getGlobalEvents({
      query: 'crisis OR emergency',
      maxrecords: 5
    });
    console.log('✅ Global Events Retrieved:');
    console.log(`   - Total events: ${globalEvents.events.length}`);
    console.log(`   - Metadata: ${JSON.stringify(globalEvents.metadata, null, 2)}`);
    if (globalEvents.events.length > 0) {
      console.log(`   - Sample event: ${globalEvents.events[0].title}`);
      console.log(`   - Source: ${globalEvents.events[0].source.name}`);
      console.log(`   - Country: ${globalEvents.events[0].location.country}`);
    }
    console.log();
    
    // Test 4: Crisis Monitoring
    console.log('4. Testing Crisis Monitoring...');
    const crisisEvents = await gdeltService.monitorCrisisEvents();
    console.log('✅ Crisis Events Retrieved:');
    console.log(`   - Total crisis events: ${crisisEvents.events.length}`);
    console.log(`   - Metadata: ${JSON.stringify(crisisEvents.metadata, null, 2)}`);
    if (crisisEvents.events.length > 0) {
      const topCrisis = crisisEvents.events[0];
      console.log(`   - Top crisis event: ${topCrisis.title}`);
      console.log(`   - Crisis score: ${topCrisis.crisisScore}`);
      console.log(`   - Urgency level: ${topCrisis.urgencyLevel}`);
      console.log(`   - Geographic relevance: ${JSON.stringify(topCrisis.geographicRelevance)}`);
    }
    console.log();
    
    // Test 5: Trending Topics
    console.log('5. Testing Trending Topics...');
    const trendingTopics = await gdeltService.getTrendingTopics({
      maxrecords: 5
    });
    console.log('✅ Trending Topics Retrieved:');
    console.log(`   - Total trending events: ${trendingTopics.events.length}`);
    console.log(`   - Metadata: ${JSON.stringify(trendingTopics.metadata, null, 2)}`);
    if (trendingTopics.events.length > 0) {
      console.log(`   - Sample trending topic: ${trendingTopics.events[0].title}`);
    }
    console.log();
    
    // Test 6: Event Search
    console.log('6. Testing Event Search...');
    const searchResults = await gdeltService.searchEvents('earthquake', {
      maxrecords: 3,
      timespan: '1day'
    });
    console.log('✅ Search Results Retrieved:');
    console.log(`   - Total search results: ${searchResults.events.length}`);
    console.log(`   - Metadata: ${JSON.stringify(searchResults.metadata, null, 2)}`);
    if (searchResults.events.length > 0) {
      console.log(`   - Sample search result: ${searchResults.events[0].title}`);
    }
    console.log();
    
    // Test 7: Geographic Events
    console.log('7. Testing Geographic Events...');
    const geoEvents = await gdeltService.getGeographicEvents({
      query: 'emergency',
      maxrecords: 10
    });
    console.log('✅ Geographic Events Retrieved:');
    console.log(`   - Total geographic events: ${geoEvents.events.length}`);
    console.log(`   - Geographic distribution: ${JSON.stringify(geoEvents.geographicDistribution, null, 2)}`);
    console.log();
    
    console.log('🎉 All GDELT API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ GDELT API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testGdeltIntegration();
}

module.exports = { testGdeltIntegration };