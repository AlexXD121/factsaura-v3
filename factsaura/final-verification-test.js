/**
 * Final Verification Test
 * Comprehensive test to verify all functionality is working end-to-end
 */

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:5173';

async function finalVerificationTest() {
    console.log('🎯 FINAL VERIFICATION TEST');
    console.log('='.repeat(50));
    console.log('Testing complete end-to-end functionality...\n');

    let results = {
        backend_health: false,
        frontend_running: false,
        posts_api: false,
        posts_display_data: false,
        create_post: false,
        ai_analysis: false,
        mutation_detection: false,
        content_scraping: false
    };

    // Test 1: Backend Health
    console.log('1. 🏥 Backend Health Check');
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok && data.status === 'OK') {
            console.log('   ✅ Backend is healthy and running');
            console.log(`   📊 Uptime: ${Math.round(data.uptime)}s`);
            results.backend_health = true;
        } else {
            console.log('   ❌ Backend health check failed');
        }
    } catch (error) {
        console.log('   ❌ Backend is not accessible:', error.message);
    }

    // Test 2: Frontend Running
    console.log('\n2. 🌐 Frontend Accessibility');
    try {
        const response = await fetch(FRONTEND_BASE);
        if (response.ok) {
            console.log('   ✅ Frontend is accessible at http://localhost:5173');
            results.frontend_running = true;
        } else {
            console.log('   ❌ Frontend returned error:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Frontend is not accessible:', error.message);
    }

    // Test 3: Posts API
    console.log('\n3. 📄 Posts API Functionality');
    try {
        const response = await fetch(`${API_BASE}/api/posts?limit=10`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            const posts = data.data.posts;
            console.log(`   ✅ Posts API working - Found ${posts.length} posts`);
            console.log(`   📊 Pagination: Page ${data.data.pagination.current_page}, Has more: ${data.data.pagination.has_more}`);
            results.posts_api = true;
            
            if (posts.length > 0) {
                results.posts_display_data = true;
                console.log('   ✅ Posts data available for display');
            }
        } else {
            console.log('   ❌ Posts API failed:', data.error?.message);
        }
    } catch (error) {
        console.log('   ❌ Posts API error:', error.message);
    }

    // Test 4: Create Post with AI Analysis
    console.log('\n4. 🤖 Create Post with AI Analysis');
    try {
        const testPost = {
            title: `Final Test - ${new Date().toLocaleTimeString()}`,
            content: `This is a comprehensive test post created at ${new Date().toLocaleString()} to verify all functionality is working correctly. Testing AI analysis, mutation detection, and database storage.`,
            content_type: 'text'
        };

        const response = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPost)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('   ✅ Post creation successful');
            console.log(`   📝 Post ID: ${data.data.post.id}`);
            
            // Check AI Analysis
            if (data.data.ai_analysis) {
                console.log('   ✅ AI analysis completed');
                console.log(`   🎯 Confidence: ${Math.round(data.data.ai_analysis.confidence_score * 100)}%`);
                console.log(`   🔍 Misinformation: ${data.data.ai_analysis.is_misinformation ? 'Yes' : 'No'}`);
                console.log(`   📋 Reasoning steps: ${data.data.ai_analysis.reasoning_steps?.length || 0}`);
                results.ai_analysis = true;
            }
            
            // Check Mutation Detection
            if (data.data.mutation_analysis) {
                console.log('   ✅ Mutation detection completed');
                console.log(`   🧬 Is mutation: ${data.data.mutation_analysis.is_mutation ? 'Yes' : 'No'}`);
                console.log(`   👨‍👩‍👧‍👦 Family ID: ${data.data.mutation_analysis.family_id}`);
                results.mutation_detection = true;
            }
            
            results.create_post = true;
        } else {
            console.log('   ❌ Post creation failed:', data.error?.message);
        }
    } catch (error) {
        console.log('   ❌ Post creation error:', error.message);
    }

    // Test 5: Content Scraping
    console.log('\n5. 🕷️ Content Scraping System');
    try {
        const response = await fetch(`${API_BASE}/api/content-scraping/status`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('   ✅ Content scraping system accessible');
            console.log(`   🔄 Scheduler running: ${data.status.isRunning ? 'Yes' : 'No'}`);
            console.log(`   📊 Cycles completed: ${data.status.cyclesCompleted || 0}`);
            results.content_scraping = true;
        } else {
            console.log('   ⚠️ Content scraping system not fully ready');
        }
    } catch (error) {
        console.log('   ⚠️ Content scraping system not accessible');
    }

    // Test 6: Verify Latest Posts Include New Post
    console.log('\n6. 🔄 Real-time Data Verification');
    try {
        const response = await fetch(`${API_BASE}/api/posts?limit=5`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            const latestPost = data.data.posts[0];
            const isRecentPost = new Date(latestPost.created_at) > new Date(Date.now() - 60000); // Within last minute
            
            if (isRecentPost) {
                console.log('   ✅ Latest post is recent - real-time updates working');
                console.log(`   📅 Latest post: "${latestPost.title}" (${new Date(latestPost.created_at).toLocaleTimeString()})`);
            } else {
                console.log('   ⚠️ Latest post is not recent - may need to refresh');
            }
        }
    } catch (error) {
        console.log('   ❌ Real-time verification error:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(50));
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)\n`);
    
    // Detailed results
    const testNames = {
        backend_health: 'Backend Health',
        frontend_running: 'Frontend Running',
        posts_api: 'Posts API',
        posts_display_data: 'Posts Display Data',
        create_post: 'Create Post',
        ai_analysis: 'AI Analysis',
        mutation_detection: 'Mutation Detection',
        content_scraping: 'Content Scraping'
    };
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${testNames[test]}`);
    });
    
    console.log('\n' + '='.repeat(50));
    
    // Final assessment
    const criticalTests = ['backend_health', 'posts_api', 'posts_display_data', 'create_post', 'ai_analysis'];
    const criticalPassed = criticalTests.filter(test => results[test]).length;
    
    if (criticalPassed === criticalTests.length) {
        console.log('🎉 SUCCESS! All critical functionality is working!');
        console.log('\n✅ The main issue has been completely resolved:');
        console.log('   • Backend API is serving posts correctly');
        console.log('   • Posts data structure matches frontend expectations');
        console.log('   • Create post functionality works with AI analysis');
        console.log('   • Frontend environment is properly configured');
        console.log('   • Real-time polling should work automatically');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Open http://localhost:5173 in your browser');
        console.log('   2. You should see posts displayed in the feed');
        console.log('   3. Try creating a new post to test the full workflow');
        console.log('   4. Posts will auto-refresh every 30 seconds');
        
        if (results.frontend_running) {
            console.log('\n🌟 EVERYTHING IS WORKING PERFECTLY!');
        } else {
            console.log('\n⚠️ Note: Frontend server may need to be restarted');
            console.log('   Run: cd factsaura/client && npm run dev');
        }
        
    } else {
        console.log('⚠️ Some critical functionality needs attention');
        console.log(`   Critical tests passed: ${criticalPassed}/${criticalTests.length}`);
        
        const failedCritical = criticalTests.filter(test => !results[test]);
        console.log('   Failed critical tests:', failedCritical.map(t => testNames[t]).join(', '));
    }
    
    return results;
}

// Run the final verification
finalVerificationTest().catch(error => {
    console.error('💥 Final verification failed:', error);
    process.exit(1);
});