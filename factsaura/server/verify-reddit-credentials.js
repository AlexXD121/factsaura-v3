/**
 * Reddit Credentials Verification Helper
 */

require('dotenv').config();

console.log('🔍 Reddit Credentials Verification\n');

console.log('Current credentials in .env file:');
console.log('================================');
console.log('REDDIT_CLIENT_ID:', process.env.REDDIT_CLIENT_ID);
console.log('REDDIT_CLIENT_SECRET:', process.env.REDDIT_CLIENT_SECRET);
console.log('REDDIT_USERNAME:', process.env.REDDIT_USERNAME);
console.log('REDDIT_PASSWORD:', process.env.REDDIT_PASSWORD ? '[HIDDEN]' : 'NOT SET');
console.log('REDDIT_USER_AGENT:', process.env.REDDIT_USER_AGENT);

console.log('\n📋 What to check on Reddit:');
console.log('============================');
console.log('1. Go to: https://www.reddit.com/prefs/apps');
console.log('2. Find your app "Densiee"');
console.log('3. The CLIENT_ID is the string directly under "Densiee"');
console.log('4. The CLIENT_SECRET is the longer string in the "secret" field');
console.log('5. Make sure the app type is "script"');

console.log('\n🔧 Expected format:');
console.log('===================');
console.log('CLIENT_ID: Usually 14 characters (like: abc123def456gh)');
console.log('CLIENT_SECRET: Usually 27 characters (like: vyxgokCmIuROdwVjTDgb7FG68qd2jQ)');

console.log('\n✅ Current CLIENT_ID length:', process.env.REDDIT_CLIENT_ID?.length || 0);
console.log('✅ Current CLIENT_SECRET length:', process.env.REDDIT_CLIENT_SECRET?.length || 0);

if (process.env.REDDIT_CLIENT_ID?.length !== 14) {
  console.log('⚠️  CLIENT_ID length seems incorrect (should be 14 characters)');
}

if (process.env.REDDIT_CLIENT_SECRET?.length !== 27) {
  console.log('⚠️  CLIENT_SECRET length seems incorrect (should be 27 characters)');
}