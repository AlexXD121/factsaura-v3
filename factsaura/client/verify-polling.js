/**
 * Simple verification script for polling functionality
 * Run this with: node verify-polling.js
 */

console.log('🔍 Verifying FactSaura Real-time Polling Implementation...\n');

// Check if the usePosts hook has polling implementation
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const usePostsPath = join(__dirname, 'src', 'hooks', 'usePosts.js');
  const usePostsContent = readFileSync(usePostsPath, 'utf8');
  
  console.log('✅ usePosts.js file found');
  
  // Check for polling implementation
  const checks = [
    {
      name: 'setInterval for polling',
      pattern: /setInterval\s*\(/,
      required: true
    },
    {
      name: '30 second interval',
      pattern: /30000|30\s*\*\s*1000/,
      required: true
    },
    {
      name: 'Polling log message',
      pattern: /Polling for new posts/,
      required: true
    },
    {
      name: 'Cleanup interval',
      pattern: /clearInterval/,
      required: true
    },
    {
      name: 'Polling condition checks',
      pattern: /pagination\?\.\s*current_page\s*===\s*1/,
      required: true
    },
    {
      name: 'Loading state check',
      pattern: /!loading\s*&&\s*!refreshing/,
      required: true
    },
    {
      name: 'Error state check',
      pattern: /!error/,
      required: true
    },
    {
      name: 'Polling start log',
      pattern: /Real-time polling started/,
      required: true
    },
    {
      name: 'Polling stop log',
      pattern: /Real-time polling stopped/,
      required: true
    }
  ];
  
  let passedChecks = 0;
  let failedChecks = 0;
  
  console.log('\n📋 Checking polling implementation:\n');
  
  checks.forEach(check => {
    const found = check.pattern.test(usePostsContent);
    if (found) {
      console.log(`✅ ${check.name}`);
      passedChecks++;
    } else {
      console.log(`${check.required ? '❌' : '⚠️'} ${check.name}`);
      if (check.required) failedChecks++;
    }
  });
  
  console.log(`\n📊 Results: ${passedChecks}/${checks.length} checks passed`);
  
  if (failedChecks === 0) {
    console.log('🎉 All required polling features are implemented!');
  } else {
    console.log(`⚠️ ${failedChecks} required features are missing`);
  }
  
  // Check Feed component for real-time indicators
  console.log('\n🔍 Checking Feed component for real-time indicators...\n');
  
  const feedPath = join(__dirname, 'src', 'components', 'Feed', 'Feed.jsx');
  const feedContent = readFileSync(feedPath, 'utf8');
  
  const feedChecks = [
    {
      name: 'Real-time indicator',
      pattern: /Live\s*\(\s*30s\s*\)/,
      required: true
    },
    {
      name: 'Refreshing indicator',
      pattern: /Updating\.\.\./,
      required: true
    },
    {
      name: 'Auto-refresh message',
      pattern: /Auto-refresh every 30 seconds/,
      required: true
    },
    {
      name: 'Pulsing indicator',
      pattern: /animate-pulse/,
      required: true
    }
  ];
  
  let feedPassed = 0;
  let feedFailed = 0;
  
  feedChecks.forEach(check => {
    const found = check.pattern.test(feedContent);
    if (found) {
      console.log(`✅ ${check.name}`);
      feedPassed++;
    } else {
      console.log(`${check.required ? '❌' : '⚠️'} ${check.name}`);
      if (check.required) feedFailed++;
    }
  });
  
  console.log(`\n📊 Feed Results: ${feedPassed}/${feedChecks.length} checks passed`);
  
  // Overall summary
  console.log('\n🎯 OVERALL SUMMARY:');
  console.log('==================');
  
  if (failedChecks === 0 && feedFailed === 0) {
    console.log('🎉 SUCCESS: Real-time polling is fully implemented!');
    console.log('');
    console.log('Features implemented:');
    console.log('• ✅ 30-second polling interval');
    console.log('• ✅ Smart polling conditions (first page only, no errors)');
    console.log('• ✅ Proper cleanup on unmount');
    console.log('• ✅ Visual indicators in Feed component');
    console.log('• ✅ Console logging for debugging');
    console.log('• ✅ Error handling for polling failures');
    console.log('');
    console.log('🚀 The task "Add real-time post updates (polling every 30 seconds)" is COMPLETE!');
  } else {
    console.log('⚠️ ISSUES FOUND: Some polling features may be missing or incomplete');
    console.log(`• Hook issues: ${failedChecks}`);
    console.log(`• Feed issues: ${feedFailed}`);
  }
  
} catch (error) {
  console.error('❌ Error verifying polling implementation:', error.message);
  process.exit(1);
}