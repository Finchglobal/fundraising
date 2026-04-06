-- Role definitions
CREATE TYPE user_role AS ENUM ('super_admin', 'ngo_admin', 'donor');

-- Campaign statuses
CREATE TYPE campaign_status AS ENUM ('draft', 'published', 'completed', 'archived');

-- Beneficiary application statuses
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Donation tracking statuses
CREATE TYPE donation_status AS ENUM ('pending', 'verified', 'rejected');

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    pan_number TEXT UNIQUE,
    registration_number TEXT,
    upi_id TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles (Extended user details mapping auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    role user_role DEFAULT 'donor'::user_role,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile after user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'donor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Beneficiary Applications
CREATE TABLE beneficiary_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    story_description TEXT NOT NULL,
    required_amount NUMERIC NOT NULL,
    status application_status DEFAULT 'pending'::application_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    hero_image_url TEXT,
    actual_need NUMERIC NOT NULL,
    platform_buffer NUMERIC NOT NULL,
    public_goal NUMERIC NOT NULL,
    raised_amount NUMERIC DEFAULT 0,
    status campaign_status DEFAULT 'draft'::campaign_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Donations
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    amount NUMERIC NOT NULL,
    platform_tip NUMERIC DEFAULT 0,
    upi_utr TEXT UNIQUE NOT NULL,
    status donation_status DEFAULT 'pending'::donation_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AI Share Assets
CREATE TABLE ai_share_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Enablement
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_share_assets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Organizations: Anyone can view
CREATE POLICY "Anyone can view organizations" 
ON organizations FOR SELECT 
USING (true);

-- Beneficiary Applications: NGO Admins can view own
CREATE POLICY "NGO Admins view own applications" 
ON beneficiary_applications FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- Campaigns: Public can view published, NGOs can view all their own
CREATE POLICY "Public can view published campaigns" 
ON campaigns FOR SELECT 
USING (status = 'published');

CREATE POLICY "NGO Admins can manage own campaigns" 
ON campaigns FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- Donations: Guest & public insert allowed without donor_id requirement
CREATE POLICY "Public can insert donations" 
ON donations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "NGO Admins can read own campaign donations" 
ON donations FOR SELECT 
USING (
  campaign_id IN (
    SELECT id FROM campaigns WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
    )
  )
);

CREATE POLICY "NGO Admins can update own campaign donations" 
ON donations FOR UPDATE 
USING (
  campaign_id IN (
    SELECT id FROM campaigns WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
    )
  )
);
