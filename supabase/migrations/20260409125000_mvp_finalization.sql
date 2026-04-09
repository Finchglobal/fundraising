-- Campaigns: Public can view published, NGOs can view all their own
DROP POLICY IF EXISTS "Public can view published campaigns" ON campaigns;
CREATE POLICY "Public can view published and completed campaigns" 
ON campaigns FOR SELECT 
USING (status IN ('published', 'completed'));

-- CSR Compliance Fields (Altering organizations table)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS registration_12a TEXT,
ADD COLUMN IF NOT EXISTS registration_80g TEXT,
ADD COLUMN IF NOT EXISTS csr_1_registration TEXT,
ADD COLUMN IF NOT EXISTS fcra_registration TEXT;

-- Invoices (Billing NGOs for platform usage)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform Admins can view all invoices" ON invoices;
CREATE POLICY "Platform Admins can view all invoices" 
ON invoices FOR SELECT 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

DROP POLICY IF EXISTS "NGO Admins can view own invoices" ON invoices;
CREATE POLICY "NGO Admins can view own invoices" 
ON invoices FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- Creator Referrals (Leaderboards)
CREATE TABLE IF NOT EXISTS creator_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_name TEXT NOT NULL,
    creator_handle TEXT,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    funds_raised NUMERIC DEFAULT 0,
    donors_referred INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE creator_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view creator referrals" ON creator_referrals;
CREATE POLICY "Anyone can view creator referrals" 
ON creator_referrals FOR SELECT 
USING (true);
