-- Fix function return type mismatches by explicit casting
CREATE OR REPLACE FUNCTION public.get_providers_needing_availability_reminder()
RETURNS TABLE(
  provider_id uuid,
  provider_name text,
  email text,
  phone text,
  week_start text,
  reminder_days_advance integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id::uuid as provider_id,
    (up.full_name)::text as provider_name,
    (au.email)::text as email,
    (up.phone)::text as phone,
    ((CURRENT_DATE + (pnp.reminder_days_advance || ' days')::interval)::date)::text as week_start,
    (pnp.reminder_days_advance)::integer as reminder_days_advance
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  JOIN public.provider_notification_preferences pnp ON pnp.provider_id = up.id
  WHERE up.role = 'provider' 
    AND up.registration_status = 'approved'
    AND pnp.availability_reminder_enabled = true
    AND NOT EXISTS (
      SELECT 1 FROM public.provider_weekly_availability pwa
      WHERE pwa.provider_id = up.id
        AND pwa.week_start = (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::interval)::date
        AND pwa.is_confirmed = true
    );
END;
$$;