-- 1. Enable UPDATE for Super Admins to verify NGOs
DROP POLICY IF EXISTS "Super Admins can update any organization" ON organizations;
CREATE POLICY "Super Admins can update any organization" 
ON organizations FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 2. Enable UPDATE for NGO Admins to edit their NGO Profile / Details
DROP POLICY IF EXISTS "NGO Admins can update own organization" ON organizations;
CREATE POLICY "NGO Admins can update own organization" 
ON organizations FOR UPDATE 
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'));
