-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for bookings table to match the orders table policies
CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.id = bookings.provider_id
    AND user_profiles.role = 'provider'
  )
);

CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.auth_role = ANY (ARRAY['admin', 'super_admin'])
  )
);