// Simple test to verify Feed component imports work correctly
import { Feed } from './src/components/Feed/index.js';
import { usePosts } from './src/hooks/usePosts.js';
import { postsAPI } from './src/utils/api.js';

console.log('✅ Feed component imported successfully');
console.log('✅ usePosts hook imported successfully');
console.log('✅ postsAPI imported successfully');

console.log('🎉 All Feed component dependencies are working correctly!');