-- Create surcharge configuration table for post-5 PM charges
CREATE TABLE IF NOT EXISTS public.surcharge_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  surcharge_amount NUMERIC NOT NULL DEFAULT 0,
  start_time TIME NOT NULL DEFAULT '17:00:00', -- 5:00 PM
  end_time TIME NOT NULL DEFAULT '20:00:00', -- 8:00 PM
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on surcharge_settings
ALTER TABLE public.surcharge_settings ENABLE ROW LEVEL SECURITY;

-- Policies for surcharge_settings
CREATE POLICY "Admins can manage surcharge settings" 
ON public.surcharge_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_id = auth.uid() 
  AND auth_role IN ('admin', 'super_admin')
));

CREATE POLICY "Public can view active surcharge settings" 
ON public.surcharge_settings 
FOR SELECT 
USING (is_active = true);

-- Insert default surcharge setting
INSERT INTO public.surcharge_settings (name, description, surcharge_amount, start_time, end_time) 
VALUES ('Evening Surcharge', 'Additional charge for appointments after 5:00 PM', 100, '17:00:00', '20:00:00')
ON CONFLICT DO NOTHING;

-- Create standardized time slots table
CREATE TABLE IF NOT EXISTS public.standardized_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_time TIME NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on standardized_time_slots
ALTER TABLE public.standardized_time_slots ENABLE ROW LEVEL SECURITY;

-- Policy for standardized_time_slots
CREATE POLICY "Everyone can view active time slots" 
ON public.standardized_time_slots 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage time slots" 
ON public.standardized_time_slots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_id = auth.uid() 
  AND auth_role IN ('admin', 'super_admin')
));

-- Insert standardized time slots (8:00 AM to 8:00 PM, 30-minute intervals)
INSERT INTO public.standardized_time_slots (slot_time, display_name, sort_order) VALUES
('08:00:00', '8:00 AM', 1),
('08:30:00', '8:30 AM', 2),
('09:00:00', '9:00 AM', 3),
('09:30:00', '9:30 AM', 4),
('10:00:00', '10:00 AM', 5),
('10:30:00', '10:30 AM', 6),
('11:00:00', '11:00 AM', 7),
('11:30:00', '11:30 AM', 8),
('12:00:00', '12:00 PM', 9),
('12:30:00', '12:30 PM', 10),
('13:00:00', '1:00 PM', 11),
('13:30:00', '1:30 PM', 12),
('14:00:00', '2:00 PM', 13),
('14:30:00', '2:30 PM', 14),
('15:00:00', '3:00 PM', 15),
('15:30:00', '3:30 PM', 16),
('16:00:00', '4:00 PM', 17),
('16:30:00', '4:30 PM', 18),
('17:00:00', '5:00 PM', 19),
('17:30:00', '5:30 PM', 20),
('18:00:00', '6:00 PM', 21),
('18:30:00', '6:30 PM', 22),
('19:00:00', '7:00 PM', 23),
('19:30:00', '7:30 PM', 24),
('20:00:00', '8:00 PM', 25)
ON CONFLICT DO NOTHING;

-- Update booking_slots table to support buffer booking and surcharge
ALTER TABLE public.booking_slots 
ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS surcharge_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS buffer_blocked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS buffer_booking_id UUID;

-- Update trigger for automatic timestamps
CREATE OR REPLACE FUNCTION update_booking_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Calculate total price including surcharge
  NEW.total_price = COALESCE(NEW.base_price, 0) + COALESCE(NEW.surcharge_amount, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_booking_slots_updated_at_trigger ON public.booking_slots;
CREATE TRIGGER update_booking_slots_updated_at_trigger
  BEFORE UPDATE ON public.booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_slots_updated_at();

-- Enhanced function to generate provider slots with standardized times and surcharge
CREATE OR REPLACE FUNCTION public.generate_standardized_provider_slots(
  p_provider_id UUID,
  p_date DATE,
  p_base_price NUMERIC DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_record RECORD;
  surcharge_record RECORD;
  calculated_surcharge NUMERIC := 0;
BEGIN
  -- Get active surcharge settings
  SELECT * INTO surcharge_record
  FROM public.surcharge_settings 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Check if provider is available for this day of week
  IF NOT EXISTS (
    SELECT 1 FROM public.provider_availability 
    WHERE provider_id = p_provider_id 
    AND day_of_week = EXTRACT(dow FROM p_date)
    AND is_available = true
  ) THEN
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
$$;

-- Enhanced function to implement booking buffer (1-hour blocking)
CREATE OR REPLACE FUNCTION public.confirm_slot_booking_with_buffer(
  slot_id UUID,
  user_id UUID,
  booking_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_record RECORD;
  buffer_end_time TIMESTAMP WITH TIME ZONE;
  rows_affected INTEGER;
BEGIN
  -- Get the slot details
  SELECT * INTO slot_record
  FROM public.booking_slots 
  WHERE id = slot_id 
  AND held_by = user_id 
  AND status = 'held';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Calculate buffer end time (1 hour after slot time)
  buffer_end_time := (slot_record.slot_date || ' ' || slot_record.slot_time)::TIMESTAMP + INTERVAL '1 hour';
  
  -- Confirm the main booking
  UPDATE public.booking_slots 
  SET 
    status = 'booked',
    booking_id = booking_id,
    held_by = NULL,
    hold_expires_at = NULL,
    buffer_blocked_until = buffer_end_time,
    buffer_booking_id = booking_id
  WHERE id = slot_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  IF rows_affected = 0 THEN
    RETURN false;
  END IF;
  
  -- Block subsequent slots within 1-hour buffer for the same provider
  UPDATE public.booking_slots 
  SET 
    is_blocked = true,
    blocked_by = user_id,
    blocked_until = buffer_end_time,
    buffer_booking_id = booking_id
  WHERE 
    provider_id = slot_record.provider_id
    AND slot_date = slot_record.slot_date
    AND slot_time > slot_record.slot_time
    AND slot_time <= (slot_record.slot_time + INTERVAL '1 hour')
    AND status = 'available';
  
  RETURN true;
END;
$$;

-- Function to release expired buffer blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_buffers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Release expired buffer blocks
  UPDATE public.booking_slots 
  SET 
    is_blocked = false,
    blocked_by = NULL,
    blocked_until = NULL,
    buffer_booking_id = NULL
  WHERE 
    buffer_blocked_until IS NOT NULL 
    AND buffer_blocked_until < NOW()
    AND status = 'available';
END;
$$;