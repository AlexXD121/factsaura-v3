const http = require('http');

// Test function to check if server is running
function testServer() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Server is running successfully!');
        console.log('📊 Health check response:', response);
        console.log('🔗 Status Code:', res.statusCode);
        process.exit(0);
      } catch (error) {
        console.error('❌ Invalid JSON response:', data);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Server connection failed:', error.message);
    console.log('💡 Make sure to start the server first with: npm start');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Server request timed out');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

console.log('🔍 Testing FactSaura backend server...');
console.log('📡 Checking health endpoint at http://localhost:3001/health');

// Wait a moment for server to start if it was just launched
setTimeout(testServer, 2000);