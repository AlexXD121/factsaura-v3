-- Create comments table for post discussions
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded replies
  
  -- Comment content
  content TEXT NOT NULL,
  expertise_tags TEXT[] DEFAULT '{}', -- Medical, Safety, Local Knowledge, etc.
  
  -- Community verification
  is_expert_verified BOOLEAN DEFAULT false,
  community_score INTEGER DEFAULT 0,
  
  -- Status
  is_flagged BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_community_score ON comments(community_score DESC);

-- GIN index for expertise tags
CREATE INDEX IF NOT EXISTS idx_comments_expertise_tags ON comments USING GIN(expertise_tags);

-- Create updated_at trigger for comments
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();