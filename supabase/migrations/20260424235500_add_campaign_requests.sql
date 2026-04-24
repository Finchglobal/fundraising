-- Add requested_by column to campaigns table to support donor-initiated campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Allow donors to insert draft campaigns
CREATE POLICY "Donors can request campaigns" 
ON campaigns FOR INSERT 
TO authenticated 
WITH CHECK (
  status = 'draft' AND 
  requested_by = auth.uid()
);

-- Allow donors to view their requested campaigns
CREATE POLICY "Donors can view their requested campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (
  requested_by = auth.uid()
);
