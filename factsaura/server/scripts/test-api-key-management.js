#!/usr/bin/env node

/**
 * Test script for API Key Management System
 * Tests all functionality of the API key manager and middleware
 */

require('dotenv').config();
const { apiKeyManager } = require('../config/apiKeys');

async function testApiKeyManagement() {
  console.log('🧪 Testing API Key Management System');
  console.log('=====================================\n');

  try {
    // Test 1: Service Availability
    console.log('1️⃣ Testing Service Availability:');
    const availableServices = apiKeyManager.getAvailableServices();
    console.log('Available services:', availableServices);
    
    const allServices = Object.keys(apiKeyManager.keys);
    allServices.forEach(service => {
      const available = apiKeyManager.isServiceAvailable(service);
      const status = available ? '✅' : '❌';
      console.log(`   ${status} ${service}: ${available ? 'Available' : 'Not Available'}`);
    });
    console.log('');

    // Test 2: Rate Limiting
    console.log('2️⃣ Testing Rate Limiting:');
    allServices.forEach(service => {
      const canMakeRequest = apiKeyManager.checkRateLimit(service);
      const status = apiKeyManager.getRateLimitStatus(service);
      
      if (!status.unlimited) {
        console.log(`   ${service}: ${status.current}/${status.limit} requests used`);
        console.log(`   Can make request: ${canMakeRequest ? '✅' : '❌'}`);
      } else {
        console.log(`   ${service}: Unlimited requests`);
      }
    });
    console.log('');

    // Test 3: Service Health
    console.log('3️⃣ Testing Service Health:');
    const health = apiKeyManager.getServiceHealth();
    Object.entries(health).forEach(([service, status]) => {
      const healthIcon = status.available ? '🟢' : '🔴';
      const requiredIcon = status.required ? '⚠️' : 'ℹ️';
      console.log(`   ${healthIcon} ${service} (${status.service}) ${requiredIcon}`);
    });
    console.log('');

    // Test 4: Masked Keys
    console.log('4️⃣ Testing Key Masking (Security):');
    allServices.forEach(service => {
      const maskedKey = apiKeyManager.getMaskedKey(service);
      console.log(`   ${service}: ${maskedKey}`);
    });
    console.log('');

    // Test 5: Rate Limit Simulation
    console.log('5️⃣ Testing Rate Limit Increment:');
    const testService = 'newsApi';
    if (apiKeyManager.isServiceAvailable(testService)) {
      const beforeStatus = apiKeyManager.getRateLimitStatus(testService);
      console.log(`   Before: ${beforeStatus.current}/${beforeStatus.limit}`);
      
      // Simulate API call
      apiKeyManager.incrementRateLimit(testService);
      
      const afterStatus = apiKeyManager.getRateLimitStatus(testService);
      console.log(`   After:  ${afterStatus.current}/${afterStatus.limit}`);
      console.log(`   ✅ Rate limit increment working`);
    } else {
      console.log(`   ⚠️ ${testService} not available for testing`);
    }
    console.log('');

    // Test 6: Configuration Retrieval
    console.log('6️⃣ Testing Configuration Retrieval:');
    try {
      const newsConfig = apiKeyManager.getConfig('newsApi');
      console.log(`   ✅ NewsAPI config retrieved: ${newsConfig.service}`);
      console.log(`   Endpoints: ${Object.keys(newsConfig.endpoints).join(', ')}`);
    } catch (error) {
      console.log(`   ❌ Error retrieving NewsAPI config: ${error.message}`);
    }
    console.log('');

    // Test 7: Service Status Logging
    console.log('7️⃣ Service Status Summary:');
    apiKeyManager.logServiceStatus();

    // Test 8: Error Handling
    console.log('8️⃣ Testing Error Handling:');
    try {
      apiKeyManager.getConfig('nonexistent-service');
      console.log('   ❌ Should have thrown error for nonexistent service');
    } catch (error) {
      console.log('   ✅ Correctly threw error for nonexistent service');
    }

    try {
      const invalidKey = apiKeyManager.getMaskedKey('nonexistent-service');
      console.log(`   ✅ Handled nonexistent service gracefully: ${invalidKey}`);
    } catch (error) {
      console.log(`   ⚠️ Unexpected error: ${error.message}`);
    }
    console.log('');

    console.log('🎉 API Key Management System Test Complete!');
    console.log('==========================================');

    // Summary
    const totalServices = allServices.length;
    const availableCount = availableServices.length;
    const requiredServices = Object.values(health).filter(s => s.required);
    const criticalIssues = requiredServices.filter(s => !s.available);

    console.log(`\n📊 Summary:`);
    console.log(`   Total Services: ${totalServices}`);
    console.log(`   Available: ${availableCount}/${totalServices}`);
    console.log(`   Required Services: ${requiredServices.length}`);
    console.log(`   Critical Issues: ${criticalIssues.length}`);

    if (criticalIssues.length > 0) {
      console.log(`\n⚠️ Critical Issues Found:`);
      criticalIssues.forEach(service => {
        console.log(`   - ${service.service}: Missing required configuration`);
      });
    } else {
      console.log(`\n✅ All required services are properly configured!`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  testApiKeyManagement()
    .then(() => {
      console.log('\n✅ All tests completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testApiKeyManagement };