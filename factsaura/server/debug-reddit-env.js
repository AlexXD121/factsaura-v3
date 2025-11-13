/**
 * Debug Reddit Environment Variables
 */

require('dotenv').config();

console.log('🔍 Debugging Reddit Environment Variables...\n');

console.log('Environment Variables:');
console.log('REDDIT_CLIENT_ID:', process.env.REDDIT_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('REDDIT_CLIENT_SECRET:', process.env.REDDIT_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('REDDIT_USERNAME:', process.env.REDDIT_USERNAME ? 'SET' : 'NOT SET');
console.log('REDDIT_PASSWORD:', process.env.REDDIT_PASSWORD ? 'SET' : 'NOT SET');

console.log('\nActual Values (first 5 chars):');
console.log('REDDIT_CLIENT_ID:', process.env.REDDIT_CLIENT_ID ? process.env.REDDIT_CLIENT_ID.substring(0, 5) + '...' : 'MISSING');
console.log('REDDIT_CLIENT_SECRET:', process.env.REDDIT_CLIENT_SECRET ? process.env.REDDIT_CLIENT_SECRET.substring(0, 5) + '...' : 'MISSING');
console.log('REDDIT_USERNAME:', process.env.REDDIT_USERNAME || 'MISSING');
console.log('REDDIT_PASSWORD:', process.env.REDDIT_PASSWORD ? process.env.REDDIT_PASSWORD.substring(0, 3) + '...' : 'MISSING');

console.log('\nTesting Reddit Service...');
const RedditApiService = require('./services/redditApiService');
const reddit = new RedditApiService();

console.log('Service Status:', reddit.getServiceStatus());

console.log('\nService Properties:');
console.log('clientId:', reddit.clientId ? reddit.clientId.substring(0, 5) + '...' : 'MISSING');
console.log('clientSecret:', reddit.clientSecret ? reddit.clientSecret.substring(0, 5) + '...' : 'MISSING');
console.log('username:', reddit.username || 'MISSING');
console.log('password:', reddit.password ? reddit.password.substring(0, 3) + '...' : 'MISSING');
console.log('reddit instance:', reddit.reddit ? 'INITIALIZED' : 'NOT INITIALIZED');