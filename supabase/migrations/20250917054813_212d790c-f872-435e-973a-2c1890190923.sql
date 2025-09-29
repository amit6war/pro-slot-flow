-- First, add some test service providers with approved status
INSERT INTO public.user_profiles (
  id,
  user_id,
  full_name,
  email,
  phone,
  role,
  auth_role,
  registration_status,
  business_name,
  address,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  gen_random_uuid(),
  'John Smith',
  'john.smith@example.com',
  '+1234567890',
  'provider',
  'provider',
  'approved',
  'Smith Home Services',
  '123 Main St, City, State 12345',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+1234567891',
  'provider',
  'provider',
  'approved',
  'Johnson Cleaning Co',
  '456 Oak Ave, City, State 12345',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Mike Davis',
  'mike.davis@example.com',
  '+1234567892',
  'provider',
  'provider',
  'approved',
  'Davis Electrical Services',
  '789 Pine St, City, State 12345',
  NOW(),
  NOW()
);

-- Add corresponding service_providers entries
INSERT INTO public.service_providers (
  user_id,
  business_name,
  contact_person,
  phone,
  email,
  address,
  status,
  rating,
  total_reviews,
  total_completed_jobs,
  years_of_experience,
  created_at,
  updated_at
)
SELECT 
  up.user_id,
  up.business_name,
  up.full_name,
  up.phone,
  up.email,
  up.address,
  'approved',
  4.5 + (RANDOM() * 0.5),
  FLOOR(RANDOM() * 100) + 10,
  FLOOR(RANDOM() * 200) + 50,
  FLOOR(RANDOM() * 10) + 2,
  NOW(),
  NOW()
FROM public.user_profiles up
WHERE up.role = 'provider' 
AND up.registration_status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM public.service_providers sp WHERE sp.user_id = up.user_id
);

-- Add provider services for different subcategories
-- Get some existing subcategories to assign services to
WITH provider_data AS (
  SELECT 
    up.id as provider_id,
    up.business_name,
    ROW_NUMBER() OVER (ORDER BY up.created_at) as rn
  FROM public.user_profiles up
  WHERE up.role = 'provider' AND up.registration_status = 'approved'
),
subcategory_data AS (
  SELECT 
    id,
    name,
    min_price,
    max_price,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.subcategories
  WHERE is_active = true
  LIMIT 10
)
INSERT INTO public.provider_services (
  provider_id,
  subcategory_id,
  service_name,
  description,
  price,
  duration_minutes,
  status,
  is_active,
  rating,
  total_bookings,
  created_at,
  updated_at
)
SELECT 
  pd.provider_id,
  sd.id,
  CASE 
    WHEN pd.rn = 1 THEN sd.name || ' by ' || pd.business_name
    WHEN pd.rn = 2 THEN 'Premium ' || sd.name || ' Service'
    ELSE 'Professional ' || sd.name
  END,
  'High-quality ' || sd.name || ' service provided by experienced professionals.',
  sd.min_price + (RANDOM() * (sd.max_price - sd.min_price)),
  60 + (FLOOR(RANDOM() * 4) * 30),
  'approved',
  true,
  4.0 + (RANDOM() * 1.0),
  FLOOR(RANDOM() * 50) + 5,
  NOW(),
  NOW()
FROM provider_data pd
CROSS JOIN subcategory_data sd
WHERE (pd.rn + sd.rn) % 3 = 1  -- Distribute services across providers
LIMIT 15;

-- Add provider availability for all days of the week for our test providers
INSERT INTO public.provider_availability (
  provider_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  slot_duration,
  created_at,
  updated_at
)
SELECT 
  up.id,
  dow.day_of_week,
  CASE 
    WHEN dow.day_of_week IN (0, 6) THEN '10:00:00'  -- Weekend start later
    ELSE '09:00:00'  -- Weekday start
  END,
  CASE 
    WHEN dow.day_of_week IN (0, 6) THEN '16:00:00'  -- Weekend end earlier
    ELSE '17:00:00'  -- Weekday end
  END,
  CASE 
    WHEN dow.day_of_week = 0 THEN false  -- Sunday off
    ELSE true
  END,
  30,  -- 30-minute slots
  NOW(),
  NOW()
FROM public.user_profiles up
CROSS JOIN (
  SELECT generate_series(0, 6) as day_of_week
) dow
WHERE up.role = 'provider' 
AND up.registration_status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM public.provider_availability pa 
  WHERE pa.provider_id = up.id AND pa.day_of_week = dow.day_of_week
);

-- Generate booking slots for the next 14 days for our test providers
DO $$
DECLARE
  provider_record RECORD;
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '14 days';
BEGIN
  FOR provider_record IN 
    SELECT id FROM public.user_profiles 
    WHERE role = 'provider' AND registration_status = 'approved'
  LOOP
    -- Generate slots using the existing function
    PERFORM public.generate_provider_slots(
      provider_record.id,
      current_date,
      end_date
    );
  END LOOP;
END $$;