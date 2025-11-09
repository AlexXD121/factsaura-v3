require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Jan AI Configuration
  janAI: {
    endpoint: process.env.JAN_AI_ENDPOINT || 'http://localhost:1337',
    timeout: parseInt(process.env.AI_ANALYSIS_TIMEOUT) || 30000,
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7
  },
  
  // Database Configuration
  database: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'factsaura_dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Crisis Detection
  crisis: {
    keywords: process.env.CRISIS_KEYWORDS ? 
      process.env.CRISIS_KEYWORDS.split(',').map(k => k.trim()) : 
      ['flood', 'earthquake', 'emergency', 'scam', 'fake', 'misinformation']
  }
};

// Validation for required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.nodeEnv === 'production') {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

module.exports = config;