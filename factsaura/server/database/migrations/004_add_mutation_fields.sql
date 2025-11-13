-- Add mutation detection fields to posts table
-- This migration adds fields for tracking misinformation mutations and family trees

-- Add mutation detection fields
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS mutation_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_mutation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mutation_family_id UUID,
ADD COLUMN IF NOT EXISTS mutation_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS mutation_generation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mutation_confidence DECIMAL(4,3) DEFAULT 0.000;

-- Create indexes for mutation fields
CREATE INDEX IF NOT EXISTS idx_posts_is_mutation ON posts(is_mutation);
CREATE INDEX IF NOT EXISTS idx_posts_mutation_family_id ON posts(mutation_family_id);
CREATE INDEX IF NOT EXISTS idx_posts_mutation_type ON posts(mutation_type);
CREATE INDEX IF NOT EXISTS idx_posts_mutation_generation ON posts(mutation_generation);

-- GIN index for mutation analysis JSONB
CREATE INDEX IF NOT EXISTS idx_posts_mutation_analysis ON posts USING GIN(mutation_analysis);

-- Add comments for documentation
COMMENT ON COLUMN posts.mutation_analysis IS 'Complete mutation detection analysis results in JSON format';
COMMENT ON COLUMN posts.is_mutation IS 'Whether this post is identified as a mutation of existing misinformation';
COMMENT ON COLUMN posts.mutation_family_id IS 'ID of the misinformation family tree this post belongs to';
COMMENT ON COLUMN posts.mutation_type IS 'Type of mutation (e.g., paraphrase, translation, context_shift)';
COMMENT ON COLUMN posts.mutation_generation IS 'Generation number in the mutation family tree (0 = original)';
COMMENT ON COLUMN posts.mutation_confidence IS 'Confidence score for mutation detection (0.000-1.000)';