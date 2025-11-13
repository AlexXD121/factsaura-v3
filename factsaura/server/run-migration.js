const { supabaseAdmin } = require('./config/supabase');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('🔄 Running mutation fields migration...');
    
    const migrationSQL = fs.readFileSync('./database/migrations/004_add_mutation_fields.sql', 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('❌ Statement failed:', error);
          console.error('   Statement:', statement);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();