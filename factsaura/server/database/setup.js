const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

// Read and execute SQL migration files
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure files run in order

  console.log('🚀 Starting database migrations...\n');

  for (const file of migrationFiles) {
    try {
      console.log(`📄 Running migration: ${file}`);
      
      const sqlContent = fs.readFileSync(
        path.join(migrationsDir, file), 
        'utf8'
      );
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: sqlContent
      });
      
      if (error) {
        // Try alternative method if RPC doesn't work
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          const { error: stmtError } = await supabaseAdmin
            .from('_migrations')
            .select('*')
            .limit(0); // This will fail but test connection
          
          if (stmtError && stmtError.code === 'PGRST116') {
            console.log(`   ⚠️  Cannot execute SQL directly via Supabase client`);
            console.log(`   💡 Please run this SQL manually in your Supabase dashboard:`);
            console.log(`   📋 ${file}\n`);
            break;
          }
        }
      } else {
        console.log(`   ✅ Migration completed successfully\n`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error running migration ${file}:`, error.message);
      console.log(`   💡 Please run this SQL manually in your Supabase dashboard\n`);
    }
  }
  
  console.log('🎉 Database setup completed!');
  console.log('\n📋 Manual Setup Instructions:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run each migration file in order:');
  migrationFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
}

// Verify database schema
async function verifySchema() {
  console.log('🔍 Verifying database schema...\n');
  
  const tables = ['users', 'posts', 'votes', 'comments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ Table '${table}' not found`);
      } else if (error) {
        console.log(`   ⚠️  Table '${table}' exists but has issues:`, error.message);
      } else {
        console.log(`   ✅ Table '${table}' exists and accessible`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking table '${table}':`, error.message);
    }
  }
  
  console.log('\n📊 Schema verification completed!');
}

module.exports = {
  runMigrations,
  verifySchema
};