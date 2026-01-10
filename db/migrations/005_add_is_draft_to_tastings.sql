-- Add is_draft column to tastings table
-- This column is used to distinguish between draft and final tastings

ALTER TABLE tastings
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- Create index for filtering drafts
CREATE INDEX IF NOT EXISTS idx_tastings_is_draft ON tastings(user_id, is_draft);

-- Add comment
COMMENT ON COLUMN tastings.is_draft IS 'Indicates if the tasting is a draft (true) or final (false)';

