-- Add PAN and Phone fields to donations for 80G tax benefits and communication
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS donor_phone text,
ADD COLUMN IF NOT EXISTS donor_pan text;
