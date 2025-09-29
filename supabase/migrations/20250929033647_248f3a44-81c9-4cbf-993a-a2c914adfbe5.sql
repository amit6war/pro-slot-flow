-- Fix the generate_standardized_provider_slots function to properly handle JSONB data
CREATE OR REPLACE FUNCTION public.generate_standardized_provider_slots(p_provider_id uuid, p_date date, p_base_price numeric DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  slot_record RECORD;
  surcharge_record RECORD;
  calculated_surcharge NUMERIC := 0;
  availability_data JSONB;
  date_key TEXT;
  is_available BOOLEAN := false;
BEGIN
  -- Get active surcharge settings
  SELECT * INTO surcharge_record
  FROM public.surcharge_settings 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Convert date to string format for JSONB key lookup
  date_key := p_date::TEXT;

  -- Check if provider has availability for this specific date in provider_weekly_availability
  SELECT pwa.availability_data->date_key INTO availability_data
  FROM public.provider_weekly_availability pwa
  WHERE pwa.provider_id = p_provider_id
    AND pwa.is_confirmed = true
    AND p_date >= pwa.week_start 
    AND p_date <= pwa.week_end
  LIMIT 1;

  -- Check if availability data exists and provider is available
  IF availability_data IS NOT NULL THEN
    is_available := (availability_data->>'is_available')::boolean;
  END IF;

  -- If not available, return early
  IF NOT is_available THEN
    RETURN; -- Provider not available on this day
  END IF;

  -- Generate slots for each standardized time
  FOR slot_record IN 
    SELECT slot_time, display_name 
    FROM public.standardized_time_slots 
    WHERE is_active = true 
    ORDER BY sort_order
  LOOP
    -- Calculate surcharge if applicable
    calculated_surcharge := 0;
    IF surcharge_record.id IS NOT NULL 
       AND slot_record.slot_time >= surcharge_record.start_time 
       AND slot_record.slot_time <= surcharge_record.end_time THEN
      calculated_surcharge := surcharge_record.surcharge_amount;
    END IF;

    -- Insert slot if it doesn't exist
    INSERT INTO public.booking_slots (
      provider_id,
      slot_date,
      slot_time,
      status,
      is_blocked,
      base_price,
      surcharge_amount,
      total_price
    )
    VALUES (
      p_provider_id,
      p_date,
      slot_record.slot_time,
      'available',
      false,
      p_base_price,
      calculated_surcharge,
      p_base_price + calculated_surcharge
    )
    ON CONFLICT (provider_id, slot_date, slot_time) 
    DO UPDATE SET
      base_price = EXCLUDED.base_price,
      surcharge_amount = EXCLUDED.surcharge_amount,
      total_price = EXCLUDED.total_price,
      updated_at = now()
    WHERE booking_slots.status = 'available'; -- Only update if still available
  END LOOP;
END;
$function$;