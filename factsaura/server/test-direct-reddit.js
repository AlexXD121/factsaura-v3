/**
 * Direct Reddit API Test
 */

const express = require('express');
const RedditApiService = require('./services/redditApiService');

const app = express();
app.use(express.json());

// Create Reddit service instance
const redditService = new RedditApiService();

// Test endpoint
app.get('/test-reddit', async (req, res) => {
  try {
    console.log('Testing Reddit service...');
    
    // Test service status
    const status = redditService.getServiceStatus();
    console.log('Service status:', status);
    
    // Test connection
    const connectionTest = await redditService.testConnection();
    console.log('Connection test:', connectionTest);
    
    res.json({
      success: true,
      status,
      connectionTest
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Direct Reddit test server running on port ${PORT}`);
  console.log(`📊 Test endpoint: http://localhost:${PORT}/test-reddit`);
});