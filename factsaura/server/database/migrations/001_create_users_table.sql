-- Create users table with essential fields for FactSaura
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  
  -- Reputation and gamification
  reputation_score INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  expertise_areas TEXT[] DEFAULT '{}',
  
  -- Community trust metrics
  submissions_count INTEGER DEFAULT 0,
  accurate_submissions INTEGER DEFAULT 0,
  expert_verifications_given INTEGER DEFAULT 0,
  community_trust_rating DECIMAL(3,2) DEFAULT 0.00,
  
  -- Location for crisis-aware features
  location VARCHAR(100),
  
  -- Account status
  is_verified BOOLEAN DEFAULT false,
  is_expert BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();