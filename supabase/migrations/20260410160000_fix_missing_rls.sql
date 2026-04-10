-- 0. Update Organizations table with missing columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_certificate_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;

-- 1. Organizations: Allow authenticated users to register their NGO
CREATE POLICY "Authenticated users can register organizations" 
ON organizations FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 2. Profiles: Allow owners to update their own organization_id and role
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Beneficiary Applications: Allow NGO Admins to insert
CREATE POLICY "NGO Admins can insert beneficiary applications" 
ON beneficiary_applications FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- 4. Invoices: Allow NGO Admins to generate and manage their own invoices
CREATE POLICY "NGO Admins can manage own invoices" 
ON invoices FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- 5. Campaigns: Ensure NGOs can insert (The 'ALL' policy in schema.sql already covers this, but for clarity)
-- Already exists in schema.sql: "NGO Admins can manage own campaigns" FOR ALL

-- 6. Creator Referrals: Allow anyone to view (Already exists), but maybe we need insert for referral tracking?
CREATE POLICY "Anyone can record referrals" 
ON creator_referrals FOR INSERT 
WITH CHECK (true);
