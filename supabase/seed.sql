-- Disable triggers/RLS during seed if needed, but since we're inserting as superuser we can just insert.

-- Insert 4 NGOs
INSERT INTO public.organizations (id, name, description, pan_number, registration_number, upi_id, logo_url, is_verified)
VALUES
  ('3326759e-b8d4-4bb3-accb-8ab2d9cd7ea1', 'Bangalore Medical Aid Trust', 'Providing critical medical interventions and post-op care.', 'BLRMA1234T', 'TRUST-BLR-2005', 'bmatrust@sbi', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80', true),
  ('3326759e-b8d4-4bb3-accb-8ab2d9cd7ea2', 'Rural Girls Education Foundation', 'Bridging the education gap for girls in rural Rajasthan.', 'RGEF9876E', 'TRUST-RAJ-2012', 'rgef@icici', 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&q=80', true),
  ('3326759e-b8d4-4bb3-accb-8ab2d9cd7ea3', 'Lucknow Dialysis Support Initiative', 'Offering subsidized and free dialysis sessions.', 'LKO9988D', 'SOCIETY-UP-2018', 'lkodialysis@hdfc', 'https://images.unsplash.com/photo-1551076805-e1869043e560?w=400&q=80', true),
  ('3326759e-b8d4-4bb3-accb-8ab2d9cd7ea4', 'Mumbai Animal Rescue Co.', 'Rescuing and rehabilitating stray animals in Mumbai.', 'MUMARC8876', 'NGO-MH-2015', 'mumrescue@yesbank', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', true);

-- Insert 8 Campaigns
-- organization_id links to NGOs above
INSERT INTO public.campaigns (id, organization_id, title, story, hero_image_url, actual_need, platform_buffer, public_goal, raised_amount, status)
VALUES
  ('a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea1', 'Support 8-year-old Aarav''s Heart Surgery', 'Aarav needs an urgent congenital heart defect surgery. His father, a daily wage laborer, cannot afford the ₹3,00,000 cost. Please help give Aarav a second chance at life.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80', 300000, 6000, 306000, 32500, 'published'),
  ('a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e12', '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea2', 'Sponsor Education for 50 Girls in Jaipur', 'With ₹2,000, you can cover a girl''s tuition and books for an entire year. Our goal is to secure the education of 50 bright young minds this academic year.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', 100000, 2000, 102000, 45000, 'published'),
  ('a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e13', '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea3', 'Fund 100 Dialysis Sessions in Lucknow', 'Chronic kidney disease drains families emotionally and financially. Help us sponsor 100 dialysis sessions for the most vulnerable patients.', 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&q=80', 250000, 5000, 255000, 120500, 'published'),
  ('a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e14', '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea4', 'Provide Winter Shelters for Stray Dogs', 'Winter is harsh on the streets of Mumbai. We are building 50 portable wooden shelters to keep injured and young stray dogs warm.', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80', 75000, 1500, 76500, 76500, 'completed');

-- Insert pending/verified Donations
INSERT INTO public.donations (id, campaign_id, donor_name, donor_email, is_anonymous, amount, platform_tip, upi_utr, status)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', 'Rahul Verma', 'rahul@example.com', false, 5000, 100, 'UPI123456789012', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', 'Aditi Sharma', 'aditi@example.com', false, 15000, 300, 'UPI123456789013', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', 'Anonymous', null, true, 2500, 0, 'UPI123456789014', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', 'Sneha Patel', 'sneha@example.com', false, 10000, 200, 'UPI123456789015', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e11', 'Vikram Singh', 'vikram@example.com', false, 2500, 50, 'UPI123456789016', 'pending'),

  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e12', 'Arjun Reddy', 'arjun@example.com', false, 20000, 500, 'UPI123456789017', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e12', 'Pooja Desai', 'pooja@example.com', false, 25000, 0, 'UPI123456789018', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e12', 'Anonymous', null, true, 1500, 150, 'UPI123456789019', 'pending'),

  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e13', 'Ravi Pillai', 'ravi@example.com', false, 50000, 1000, 'UPI123456789020', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e13', 'Sunita Nair', 'sunita@example.com', false, 70500, 0, 'UPI123456789021', 'verified'),

  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e14', 'Neha Kapoor', 'neha@example.com', false, 75000, 1500, 'UPI123456789022', 'verified'),
  (gen_random_uuid(), 'a1b2c3d4-b8d4-4bb3-accb-8ab2d9cd7e14', 'Deepak Rao', 'deepak@example.com', false, 1500, 50, 'UPI123456789023', 'verified');
