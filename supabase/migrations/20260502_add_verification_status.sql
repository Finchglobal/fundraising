-- Add verification_status and verification_comments columns to organizations table
ALTER TABLE "public"."organizations" 
ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
ADD COLUMN IF NOT EXISTS "verification_comments" jsonb DEFAULT '{}'::jsonb;

-- Sync existing data
UPDATE "public"."organizations"
SET "verification_status" = 'approved'
WHERE "is_verified" = true;

UPDATE "public"."organizations"
SET "verification_status" = 'pending'
WHERE "is_verified" = false;
