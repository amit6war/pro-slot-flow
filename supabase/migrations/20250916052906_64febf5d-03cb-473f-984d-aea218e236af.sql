-- Fix the provider request approval trigger to remove provider_services creation
-- since provider_services uses subcategory_id, not category_id
CREATE OR REPLACE FUNCTION public.handle_provider_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If status changed to approved
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Update user profile to provider role and approved status
    UPDATE public.user_profiles 
    SET 
      role = 'provider',
      auth_role = 'provider',
      registration_status = 'approved',
      business_name = NEW.business_name,
      contact_person = NEW.contact_person,
      phone = NEW.phone,
      address = NEW.address,
      license_number = NEW.license_number,
      license_document_url = NEW.license_document_url,
      id_document_url = NEW.id_document_url,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Note: Removed automatic provider_services creation since it requires subcategory_id
    -- Providers can register for specific services after approval
    
    -- Set approval timestamp and approver
    NEW.approved_at = NOW();
    NEW.approved_by = auth.uid();
    
  -- If status changed to rejected
  ELSIF OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
    -- Set rejection timestamp and rejector
    NEW.rejected_at = NOW();
    NEW.rejected_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;