-- Add specific URL columns for various tax and compliance certificates
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS registration_80g_url TEXT,
ADD COLUMN IF NOT EXISTS registration_12a_url TEXT,
ADD COLUMN IF NOT EXISTS csr_1_url TEXT,
ADD COLUMN IF NOT EXISTS fcra_url TEXT;

-- Verify columns (optional select for manual check)
-- SELECT id, name, registration_80g_url, registration_12a_url, csr_1_url FROM organizations LIMIT 1;
