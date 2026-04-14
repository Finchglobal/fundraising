-- 1. Add fields to profiles for Impact Ambassadors
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ambassador_username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Add referrer tracking to donations
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. RLS policy so anyone can see basic public profiles of ambassadors
-- (Current policy already allows users to select own profile, but we need public to see ambassador profiles)
-- Since profiles might contain sensitive info like email if not careful, we should 
-- ensure we only expose necessary profiles. Let's allow public SELECT on profiles 
-- where is_ambassador is true.
CREATE POLICY "Anyone can view ambassador profiles" 
ON profiles FOR SELECT 
USING (is_ambassador = true);
