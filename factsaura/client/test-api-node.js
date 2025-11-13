/**
 * Node.js API Connectivity Test
 * Tests the backend API endpoints directly
 */

const API_BASE = 'http://localhost:3001';

async function testAPI() {
    console.log('🔍 Testing FactSaura API connectivity...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Health check passed!');
            console.log(`   Status: ${data.status}`);
            console.log(`   Message: ${data.message}`);
            console.log(`   Uptime: ${data.uptime}s\n`);
        } else {
            console.log('❌ Health check failed!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data, null, 2)}\n`);
            return;
        }
    } catch (error) {
        console.log('❌ Health check failed with network error!');
        console.log(`   Error: ${error.message}\n`);
        return;
    }

    // Test 2: Posts API
    console.log('2. Testing Posts API...');
    try {
        const response = await fetch(`${API_BASE}/api/posts?limit=5`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            const posts = data.data.posts;
            console.log('✅ Posts API working!');
            console.log(`   Found ${posts.length} posts`);
            console.log(`   Pagination: Page ${data.data.pagination.current_page}, Has more: ${data.data.pagination.has_more}`);
            
            if (posts.length > 0) {
                console.log('\n   Sample post:');
                const post = posts[0];
                console.log(`   - ID: ${post.id}`);
                console.log(`   - Title: ${post.title}`);
                console.log(`   - Type: ${post.type}`);
                console.log(`   - Created: ${post.created_at}`);
                console.log(`   - AI Analysis: ${post.ai_analysis?.is_misinformation ? 'Misinformation' : 'Verified'} (${Math.round((post.ai_analysis?.confidence_score || 0) * 100)}% confidence)`);
                console.log(`   - Crisis Level: ${post.crisis_context?.urgency_level}`);
            }
            console.log('');
        } else {
            console.log('❌ Posts API failed!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data, null, 2)}\n`);
        }
    } catch (error) {
        console.log('❌ Posts API failed with network error!');
        console.log(`   Error: ${error.message}\n`);
    }

    // Test 3: Create Post
    console.log('3. Testing Create Post API...');
    try {
        const testPost = {
            title: `API Test Post - ${new Date().toLocaleTimeString()}`,
            content: `This is a test post created via Node.js API test at ${new Date().toLocaleString()}. Testing end-to-end functionality.`,
            content_type: 'text'
        };

        const response = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPost)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Create Post API working!');
            console.log(`   Created post ID: ${data.data.post.id}`);
            console.log(`   Title: ${data.data.post.title}`);
            console.log(`   AI Analysis completed: ${data.data.ai_analysis.confidence_score * 100}% confidence`);
            console.log(`   Misinformation: ${data.data.ai_analysis.is_misinformation ? 'Yes' : 'No'}`);
            console.log('');
        } else {
            console.log('❌ Create Post API failed!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data, null, 2)}\n`);
        }
    } catch (error) {
        console.log('❌ Create Post API failed with network error!');
        console.log(`   Error: ${error.message}\n`);
    }

    // Test 4: Content Scraping Status
    console.log('4. Testing Content Scraping Status...');
    try {
        const response = await fetch(`${API_BASE}/api/content-scraping/status`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Content Scraping API working!');
            console.log(`   Scheduler running: ${data.status.isRunning}`);
            console.log(`   Cycles completed: ${data.status.cyclesCompleted}`);
            console.log(`   Last run: ${data.status.lastRun || 'Never'}`);
            console.log('');
        } else {
            console.log('⚠️ Content Scraping API not fully ready (expected)');
            console.log(`   Status: ${response.status}`);
            console.log('');
        }
    } catch (error) {
        console.log('⚠️ Content Scraping API not accessible (expected)');
        console.log(`   Error: ${error.message}\n`);
    }

    console.log('🎉 API connectivity test completed!');
    console.log('\nNext steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Open http://localhost:5173');
    console.log('3. Check if posts are now displaying in the UI');
}

// Run the test
testAPI().catch(error => {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
});