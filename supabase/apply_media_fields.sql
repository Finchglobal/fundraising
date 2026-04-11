-- Add media fields for Donor and NGO Profiles and Campaigns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS youtube_url TEXT;

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Notify postgREST to pick up new schema changes immediately
NOTIFY pgrst, 'reload schema';
