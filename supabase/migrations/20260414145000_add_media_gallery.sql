-- Add media_gallery field to campaigns for dynamic media arrangement.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS media_gallery JSONB DEFAULT '[]'::jsonb;
NOTIFY pgrst, 'reload schema';
