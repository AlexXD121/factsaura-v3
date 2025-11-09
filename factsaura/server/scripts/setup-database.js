#!/usr/bin/env node

const { runMigrations, verifySchema } = require('../database/setup');

async function main() {
  console.log('🗄️  FactSaura Database Setup\n');
  
  try {
    // Run migrations
    await runMigrations();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Verify schema
    await verifySchema();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);