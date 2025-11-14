#!/usr/bin/env node

/**
 * Final End-to-End Verification Test
 * Tests complete user journey and system functionality
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const CLIENT_BASE = 'http://localhost:5173';

console.log('🔍 FactSaura Final Verification Test - Task 4.3');
console.log('='.repeat(60));

// Test data for submission
const testPost = {
    title: "BREAKING: New COVID-19 Cure Discovered",
    content: "BREAKING: Scientists discover that drinking bleach can cure COVID-19! Share this to save lives! 🚨",
    source: "WhatsApp Forward",
    author: "Test User"
};

async function testBackendHealth() {
    console.log('\n🏥 BACKEND HEALTH CHECK:');
    console.log('-'.repeat(30));
    
    try {
        const response = await axios.get(`${API_BASE}/health`);
        console.log('   ✅ Backend server responding');
        console.log(`   📊 Status: ${response.status}`);
        console.log(`   🕐 Response time: ${response.headers['x-response-time'] || 'N/A'}`);
        return true;
    } catch (error) {
        console.log('   ❌ Backend server not responding');
        console.log(`   🚨 Error: ${error.message}`);
        return false;
    }
}

async function testAPIEndpoints() {
    console.log('\n🔌 API ENDPOINTS TEST:');
    console.log('-'.repeat(30));
    
    const endpoints = [
        { method: 'GET', path: '/posts', name: 'Get Posts' },
        { method: 'GET', path: '/demo/posts', name: 'Demo Posts' },
        { method: 'GET', path: '/demo/statistics', name: 'Demo Statistics' },
        { method: 'GET', path: '/health', name: 'Health Check' }
    ];
    
    let passedEndpoints = 0;
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios({
                method: endpoint.method.toLowerCase(),
                url: `${API_BASE}${endpoint.path}`,
                timeout: 5000
            });
            
            console.log(`   ✅ ${endpoint.name}: ${response.status}`);
            passedEndpoints++;
        } catch (error) {
            console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'FAILED'}`);
        }
    }
    
    console.log(`\n   📊 Endpoints Working: ${passedEndpoints}/${endpoints.length}`);
    return passedEndpoints === endpoints.length;
}

async function testContentSubmission() {
    console.log('\n📝 CONTENT SUBMISSION TEST:');
    console.log('-'.repeat(30));
    
    try {
        console.log('   🚀 Submitting test content...');
        const response = await axios.post(`${API_BASE}/posts`, testPost, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('   ✅ Content submitted successfully');
        console.log(`   📊 Status: ${response.status}`);
        console.log(`   🆔 Post ID: ${response.data.id || response.data.data?.id}`);
        console.log(`   🤖 AI Confidence: ${response.data.aiAnalysis?.confidence || response.data.data?.aiAnalysis?.confidence || 'N/A'}%`);
        console.log(`   ⚠️  Crisis Level: ${response.data.aiAnalysis?.crisisContext?.urgencyLevel || response.data.data?.aiAnalysis?.crisisContext?.urgencyLevel || 'N/A'}`);
        
        return response.data;
    } catch (error) {
        console.log('   ❌ Content submission failed');
        console.log(`   🚨 Error: ${JSON.stringify(error.response?.data) || error.message}`);
        console.log(`   📊 Status Code: ${error.response?.status || 'N/A'}`);
        return null;
    }
}

async function testFeedRetrieval() {
    console.log('\n📰 FEED RETRIEVAL TEST:');
    console.log('-'.repeat(30));
    
    try {
        const response = await axios.get(`${API_BASE}/posts?limit=5`);
        const posts = response.data.data || response.data;
        
        console.log('   ✅ Feed retrieved successfully');
        console.log(`   📊 Posts count: ${Array.isArray(posts) ? posts.length : 'N/A'}`);
        
        if (Array.isArray(posts) && posts.length > 0) {
            const latestPost = posts[0];
            console.log(`   📝 Latest post: "${latestPost.content?.substring(0, 50) || 'N/A'}..."`);
            console.log(`   🤖 AI Analysis: ${latestPost.aiAnalysis ? 'Present' : 'Missing'}`);
            console.log(`   📅 Created: ${latestPost.createdAt ? new Date(latestPost.createdAt).toLocaleString() : 'N/A'}`);
        }
        
        return posts;
    } catch (error) {
        console.log('   ❌ Feed retrieval failed');
        console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
        return null;
    }
}

async function testFamilyTreeData() {
    console.log('\n🌳 FAMILY TREE DATA TEST:');
    console.log('-'.repeat(30));
    
    try {
        // First try to create demo family tree if it doesn't exist
        console.log('   🚀 Creating demo family tree...');
        const createResponse = await axios.post(`${API_BASE}/demo/family-tree`);
        console.log('   ✅ Demo family tree created');
        
        // Now get the visualization data
        const familyId = createResponse.data.data.familyId;
        const response = await axios.get(`${API_BASE}/family-tree/${familyId}/visualization`);
        const treeData = response.data;
        
        console.log('   ✅ Family tree data retrieved');
        console.log(`   📊 Nodes: ${treeData.nodes?.length || 0}`);
        console.log(`   � Edges:: ${treeData.edges?.length || 0}`);
        console.log(`   📈 Generations: ${treeData.statistics?.maxDepth || 0}`);
        console.log(`   🧬 Mutation Types: ${treeData.statistics?.mutationTypes || 0}`);
        
        return treeData;
    } catch (error) {
        console.log('   ❌ Family tree data failed');
        console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
        return null;
    }
}

async function testDemoEndpoints() {
    console.log('\n🎭 DEMO ENDPOINTS TEST:');
    console.log('-'.repeat(30));
    
    try {
        // Test demo posts
        const postsResponse = await axios.get(`${API_BASE}/demo/posts`);
        console.log('   ✅ Demo posts available');
        console.log(`   📊 Demo posts count: ${postsResponse.data.data?.posts?.length || 0}`);
        
        // Test demo statistics
        const statsResponse = await axios.get(`${API_BASE}/demo/statistics`);
        console.log('   ✅ Demo statistics available');
        console.log(`   📈 Demo readiness: ${statsResponse.data.data?.demoReadiness?.totalDemoContent || 0} items`);
        
        return true;
    } catch (error) {
        console.log('   ❌ Demo endpoints failed');
        console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testPerformanceMetrics() {
    console.log('\n⚡ PERFORMANCE METRICS TEST:');
    console.log('-'.repeat(30));
    
    const startTime = Date.now();
    
    try {
        // Test multiple concurrent requests
        const promises = [
            axios.get(`${API_BASE}/posts`),
            axios.get(`${API_BASE}/demo/posts`),
            axios.get(`${API_BASE}/demo/statistics`)
        ];
        
        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log('   ✅ Concurrent requests successful');
        console.log(`   ⏱️  Total time: ${totalTime}ms`);
        console.log(`   📊 Average per request: ${Math.round(totalTime / promises.length)}ms`);
        console.log(`   🚀 Requests per second: ${Math.round(1000 / (totalTime / promises.length))}`);
        
        return totalTime < 3000; // Should complete within 3 seconds
    } catch (error) {
        console.log('   ❌ Performance test failed');
        console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function generateTestReport() {
    console.log('\n📋 GENERATING COMPREHENSIVE TEST REPORT...\n');
    
    const results = {
        backendHealth: await testBackendHealth(),
        apiEndpoints: await testAPIEndpoints(),
        contentSubmission: await testContentSubmission(),
        feedRetrieval: await testFeedRetrieval(),
        familyTreeData: await testFamilyTreeData(),
        demoEndpoints: await testDemoEndpoints(),
        performanceMetrics: await testPerformanceMetrics()
    };
    
    // Calculate overall success rate
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => 
        result === true || (result && typeof result === 'object')
    ).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION RESULTS:');
    console.log('='.repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
        const status = (result === true || (result && typeof result === 'object')) ? '✅' : '❌';
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   ${status} ${testName}`);
    });
    
    console.log('\n📈 SUMMARY:');
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   📊 Success Rate: ${successRate}%`);
    
    if (successRate >= 95) {
        console.log('\n🎉 STATUS: SYSTEM FULLY OPERATIONAL - DEMO READY!');
    } else if (successRate >= 80) {
        console.log('\n⚠️  STATUS: MINOR ISSUES DETECTED - DEMO VIABLE');
    } else {
        console.log('\n🚨 STATUS: CRITICAL ISSUES - DEMO NOT READY');
    }
    
    return { results, successRate, passedTests, totalTests };
}

// Main execution
async function main() {
    try {
        const report = await generateTestReport();
        
        // Save results to file
        const reportData = {
            timestamp: new Date().toISOString(),
            testResults: report.results,
            summary: {
                successRate: report.successRate,
                passedTests: report.passedTests,
                totalTests: report.totalTests
            }
        };
        
        fs.writeFileSync('final-verification-results.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Test results saved to: final-verification-results.json');
        
        return report;
    } catch (error) {
        console.error('\n🚨 CRITICAL ERROR during testing:', error.message);
        return null;
    }
}

// Execute if run directly
if (require.main === module) {
    main().then(result => {
        process.exit(result && result.successRate >= 80 ? 0 : 1);
    });
}

module.exports = { main, testBackendHealth, testAPIEndpoints };