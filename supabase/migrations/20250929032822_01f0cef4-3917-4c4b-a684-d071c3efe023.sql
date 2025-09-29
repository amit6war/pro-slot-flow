-- Enable RLS on standardized_time_slots table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE c.relname = 'standardized_time_slots' 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE standardized_time_slots ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;