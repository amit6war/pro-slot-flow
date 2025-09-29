-- Clean up inconsistent booking slots and fix pricing
-- This will remove slots with incorrect base prices and let them be regenerated correctly

-- First, let's create a function to clean up inconsistent slots for a provider
CREATE OR REPLACE FUNCTION cleanup_inconsistent_provider_slots(p_provider_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  correct_price numeric;
BEGIN
  -- Get the provider's actual service price (we'll use the most common price as reference)
  SELECT ps.price INTO correct_price
  FROM provider_services ps
  WHERE ps.provider_id = p_provider_id 
    AND ps.status = 'approved'
    AND ps.is_active = true
  ORDER BY ps.price DESC -- Take the highest price if multiple services
  LIMIT 1;

  -- If we found a price, delete slots that don't match
  IF correct_price IS NOT NULL THEN
    DELETE FROM booking_slots 
    WHERE provider_id = p_provider_id 
      AND base_price != correct_price 
      AND status = 'available'
      AND slot_date >= CURRENT_DATE;
      
    RAISE NOTICE 'Cleaned up inconsistent slots for provider % with correct price %', p_provider_id, correct_price;
  END IF;
END;
$$;

-- Run cleanup for the problematic provider
SELECT cleanup_inconsistent_provider_slots('3b85160b-d841-4227-9ac6-7315eea8a2e0');

-- Also clean up any other providers with inconsistent pricing
DO $$
DECLARE
  provider_record RECORD;
BEGIN
  FOR provider_record IN 
    SELECT DISTINCT provider_id 
    FROM booking_slots 
    WHERE slot_date >= CURRENT_DATE 
      AND status = 'available'
  LOOP
    PERFORM cleanup_inconsistent_provider_slots(provider_record.provider_id);
  END LOOP;
END $$;