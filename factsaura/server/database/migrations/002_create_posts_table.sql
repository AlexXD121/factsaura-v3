-- Create posts table with AI analysis and crisis context
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'url', 'image')),
  source_url TEXT,
  
  -- Post metadata
  post_type VARCHAR(20) DEFAULT 'user_submitted' CHECK (post_type IN ('user_submitted', 'ai_detected')),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Crisis context
  crisis_context JSONB DEFAULT '{}'::jsonb,
  urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('critical', 'high', 'medium', 'low')),
  location_relevance VARCHAR(100),
  harm_category VARCHAR(50),
  crisis_keywords TEXT[] DEFAULT '{}',
  
  -- AI analysis results
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(4,3) DEFAULT 0.000,
  is_misinformation BOOLEAN DEFAULT false,
  analysis_explanation TEXT,
  reasoning_steps TEXT[],
  sources_checked JSONB DEFAULT '[]'::jsonb,
  uncertainty_flags TEXT[] DEFAULT '{}',
  analysis_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  expert_verifications INTEGER DEFAULT 0,
  community_trust_score DECIMAL(4,3) DEFAULT 0.000,
  
  -- Status and visibility
  is_published BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and queries
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_urgency_level ON posts(urgency_level);
CREATE INDEX IF NOT EXISTS idx_posts_is_misinformation ON posts(is_misinformation);
CREATE INDEX IF NOT EXISTS idx_posts_confidence_score ON posts(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_location_relevance ON posts(location_relevance);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);

-- GIN indexes for JSONB and array fields
CREATE INDEX IF NOT EXISTS idx_posts_crisis_context ON posts USING GIN(crisis_context);
CREATE INDEX IF NOT EXISTS idx_posts_ai_analysis ON posts USING GIN(ai_analysis);
CREATE INDEX IF NOT EXISTS idx_posts_crisis_keywords ON posts USING GIN(crisis_keywords);

-- Create updated_at trigger for posts
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();