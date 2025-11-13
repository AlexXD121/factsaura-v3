/**
 * Test Reddit Routes Loading
 */

console.log('Testing Reddit routes loading...');

try {
  // Test loading Reddit controller
  console.log('1. Loading Reddit controller...');
  const redditController = require('./controllers/redditApiController');
  console.log('✅ Reddit controller loaded successfully');
  console.log('   Methods:', Object.getOwnPropertyNames(redditController).filter(name => typeof redditController[name] === 'function'));

  // Test loading Reddit service
  console.log('\n2. Loading Reddit service...');
  const RedditApiService = require('./services/redditApiService');
  console.log('✅ Reddit service loaded successfully');

  // Test creating service instance
  console.log('\n3. Creating Reddit service instance...');
  const redditService = new RedditApiService();
  console.log('✅ Reddit service instance created');
  console.log('   Status:', redditService.getServiceStatus());

  // Test loading Reddit routes
  console.log('\n4. Loading Reddit routes...');
  const redditRoutes = require('./routes/reddit');
  console.log('✅ Reddit routes loaded successfully');

  // Test loading main routes
  console.log('\n5. Loading main routes...');
  const mainRoutes = require('./routes/index');
  console.log('✅ Main routes loaded successfully');

  console.log('\n🎉 All Reddit components loaded successfully!');

} catch (error) {
  console.error('❌ Error loading Reddit components:', error);
  console.error('Stack:', error.stack);
}