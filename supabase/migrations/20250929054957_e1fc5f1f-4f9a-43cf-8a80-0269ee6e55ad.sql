-- Add RLS policy to allow providers to view their own orders
CREATE POLICY "Providers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.id = orders.provider_id
    AND user_profiles.role = 'provider'
  )
);