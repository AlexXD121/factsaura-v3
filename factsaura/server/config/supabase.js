const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

// Create Supabase client with configuration
const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test connectivity function
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is expected
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Health check function for monitoring
async function healthCheck() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection,
  healthCheck
};