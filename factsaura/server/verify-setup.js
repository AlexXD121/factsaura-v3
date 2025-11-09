const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying FactSaura Backend Setup...\n');

// Check if all required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  '.env',
  '.env.example',
  '.gitignore',
  'config/index.js',
  'routes/index.js',
  'routes/posts.js',
  'routes/ai.js',
  'routes/users.js',
  'controllers/postsController.js',
  'controllers/aiController.js',
  'controllers/usersController.js',
  'services/aiService.js',
  'services/postsService.js',
  'services/usersService.js',
  'models/Post.js',
  'models/User.js',
  'models/AIAnalysis.js'
];

let allFilesExist = true;

console.log('📁 Checking project structure:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules (dependencies installed)');
} else {
  console.log('❌ node_modules - Run "npm install" to install dependencies');
  allFilesExist = false;
}

console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files and directories are present');
  console.log('✅ Project structure is correctly set up');
  console.log('✅ Dependencies are installed');
  console.log('\n🚀 Ready to start server with: npm start');
  console.log('🧪 Run tests with: npm test');
  console.log('📊 Health check will be available at: http://localhost:3001/health');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}

console.log('\n📝 Next Steps:');
console.log('1. Configure Supabase credentials in .env file (Task 1.3)');
console.log('2. Implement AI integration with Jan AI (Task 2.1)');
console.log('3. Set up database schema and authentication (Task 1.3)');
console.log('4. Build frontend components (Task 1.2)');

process.exit(allFilesExist ? 0 : 1);