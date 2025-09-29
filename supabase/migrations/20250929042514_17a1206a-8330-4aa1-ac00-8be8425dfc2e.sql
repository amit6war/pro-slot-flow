-- Fix the validate_coupon_code function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.validate_coupon_code(coupon_code text, customer_id uuid, order_amount numeric)
 RETURNS TABLE(is_valid boolean, offer_id uuid, discount_amount numeric, error_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  offer_record special_offers%ROWTYPE;
  usage_count_customer integer;
  calculated_discount numeric;
BEGIN
  -- Find the offer
  SELECT * INTO offer_record
  FROM special_offers
  WHERE code = coupon_code
    AND is_active = true
    AND valid_from <= now()
    AND valid_until >= now();
  
  -- Check if offer exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'Invalid or expired coupon code';
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF order_amount < offer_record.minimum_order_amount THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 
      format('Minimum order amount of $%.2f required', offer_record.minimum_order_amount);
    RETURN;
  END IF;
  
  -- Check usage limit
  IF offer_record.usage_limit IS NOT NULL AND offer_record.usage_count >= offer_record.usage_limit THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'Coupon usage limit exceeded';
    RETURN;
  END IF;
  
  -- Check per-customer usage limit - Fix ambiguous reference by specifying table alias
  SELECT COUNT(*) INTO usage_count_customer
  FROM coupons c
  WHERE c.offer_id = offer_record.id AND c.customer_id = validate_coupon_code.customer_id;
  
  IF usage_count_customer >= offer_record.usage_limit_per_customer THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'You have already used this coupon';
    RETURN;
  END IF;
  
  -- Calculate discount
  IF offer_record.discount_type = 'percentage' THEN
    calculated_discount := order_amount * (offer_record.discount_value / 100);
  ELSE
    calculated_discount := offer_record.discount_value;
  END IF;
  
  -- Apply maximum discount limit
  IF offer_record.maximum_discount_amount IS NOT NULL THEN
    calculated_discount := LEAST(calculated_discount, offer_record.maximum_discount_amount);
  END IF;
  
  RETURN QUERY SELECT true, offer_record.id, calculated_discount, null::text;
END;
$function$;