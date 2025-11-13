const { supabaseAdmin } = require('./config/supabase');

async function addMutationColumns() {
  try {
    console.log('🔄 Adding mutation columns to posts table...');
    
    // Add columns one by one using ALTER TABLE
    const alterStatements = [
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS mutation_analysis JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_mutation BOOLEAN DEFAULT false',
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS mutation_family_id UUID',
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS mutation_type VARCHAR(50)',
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS mutation_generation INTEGER DEFAULT 0',
      'ALTER TABLE posts ADD COLUMN IF NOT EXISTS mutation_confidence DECIMAL(4,3) DEFAULT 0.000'
    ];
    
    for (const statement of alterStatements) {
      console.log(`Executing: ${statement}`);
      
      const { error } = await supabaseAdmin
        .from('posts')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection error:', error);
        return;
      }
    }
    
    // Since we can't execute DDL directly, let's check if we can work around this
    // by modifying the posts controller to handle missing columns gracefully
    
    console.log('⚠️ Cannot execute DDL statements through Supabase client');
    console.log('💡 Let\'s modify the code to handle missing columns gracefully');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

addMutationColumns();