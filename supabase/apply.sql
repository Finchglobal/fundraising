-- 1. Add missing specific columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_certificate_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- 2. Create Storage Buckets (donation-proofs & documents for onboarding)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('donation-proofs', 'donation-proofs', true),
  ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS for storage (Allow public uploads for these specific buckets)
DROP POLICY IF EXISTS "Public can upload donation proofs" ON storage.objects;
CREATE POLICY "Public can upload donation proofs"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'donation-proofs');

DROP POLICY IF EXISTS "Anyone can view donation proofs" ON storage.objects;
CREATE POLICY "Anyone can view donation proofs"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'donation-proofs');

DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
CREATE POLICY "Public can upload documents"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

-- 4. Organization RLS Fixes
DROP POLICY IF EXISTS "Authenticated users can register organizations" ON organizations;
CREATE POLICY "Authenticated users can register organizations" 
ON organizations FOR INSERT TO authenticated
WITH CHECK (true);

-- 5. Profile RLS Fixes
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Beneficiary App RLS Fixes
DROP POLICY IF EXISTS "NGO Admins can insert beneficiary applications" ON beneficiary_applications;
CREATE POLICY "NGO Admins can insert beneficiary applications" 
ON beneficiary_applications FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- 7. Invoices RLS Fixes
DROP POLICY IF EXISTS "NGO Admins can manage own invoices" ON invoices;
CREATE POLICY "NGO Admins can manage own invoices" 
ON invoices FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'
  )
);

-- 8. Referrals RLS Fixes
DROP POLICY IF EXISTS "Anyone can record referrals" ON creator_referrals;
CREATE POLICY "Anyone can record referrals" 
ON creator_referrals FOR INSERT WITH CHECK (true);

-- 9. Force PostgREST schema cache to reload (Fixes the cached "12a_number" ghost error)
NOTIFY pgrst, 'reload schema';
