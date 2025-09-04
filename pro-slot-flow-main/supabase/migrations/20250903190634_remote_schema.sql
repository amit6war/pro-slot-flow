drop extension if exists "pg_net";


  create table "public"."admin_settings" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_settings" enable row level security;


  create table "public"."booking_slots" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid,
    "service_id" uuid,
    "slot_date" date not null,
    "slot_time" time without time zone not null,
    "is_blocked" boolean default false,
    "blocked_by" uuid,
    "blocked_until" timestamp with time zone,
    "booking_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."booking_slots" enable row level security;


  create table "public"."bookings" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid,
    "provider_id" uuid,
    "service_id" uuid,
    "booking_date" date not null,
    "booking_time" time without time zone not null,
    "status" text default 'pending'::text,
    "total_amount" numeric(10,2) not null,
    "payment_status" text default 'pending'::text,
    "payment_intent_id" text,
    "special_instructions" text,
    "slot_reserved_until" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "service_name" text,
    "provider_name" text,
    "location" text,
    "provider_phone" text,
    "notes" text
      );


alter table "public"."bookings" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "description" text,
    "icon" character varying(100),
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."customer_favorites" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid,
    "service_id" text not null,
    "service_name" text not null,
    "provider_name" text not null,
    "category" text,
    "rating" numeric(3,2) default 0,
    "price_range" text,
    "location" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."customer_favorites" enable row level security;


  create table "public"."favorites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "provider_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."favorites" enable row level security;


  create table "public"."locations" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "address" text not null,
    "city" character varying(100) not null,
    "state" character varying(100) not null,
    "postal_code" character varying(20) not null,
    "country" character varying(100) not null default 'United States'::character varying,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."locations" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "title" text not null,
    "message" text not null,
    "type" text not null,
    "read" boolean default false,
    "data" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."provider_services" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid not null,
    "subcategory_id" uuid not null,
    "service_name" character varying(255) not null,
    "description" text,
    "price" numeric(10,2) not null,
    "license_number" character varying(255),
    "license_document_url" text,
    "status" character varying(50) default 'pending'::character varying,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."provider_services" enable row level security;


  create table "public"."service_provider_documents" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid,
    "document_type" text not null,
    "document_url" text not null,
    "document_name" text not null,
    "verification_status" text default 'pending'::text,
    "verified_by" uuid,
    "verification_notes" text,
    "uploaded_at" timestamp with time zone default now(),
    "verified_at" timestamp with time zone
      );


alter table "public"."service_provider_documents" enable row level security;


  create table "public"."service_providers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "business_name" text not null,
    "contact_person" text not null,
    "phone" text not null,
    "email" text not null,
    "address" text not null,
    "license_number" text,
    "license_document_url" text,
    "id_document_url" text,
    "status" text default 'pending'::text,
    "is_featured" boolean default false,
    "is_emergency_offline" boolean default false,
    "rating" numeric(3,2) default 0,
    "total_reviews" integer default 0,
    "total_completed_jobs" integer default 0,
    "response_time_minutes" integer default 15,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."service_providers" enable row level security;


  create table "public"."services" (
    "id" uuid not null default gen_random_uuid(),
    "subcategory_id" uuid,
    "name" text not null,
    "description" text,
    "price" numeric(10,2) not null,
    "duration_minutes" integer default 60,
    "is_popular" boolean default false,
    "display_order" integer default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."services" enable row level security;


  create table "public"."subcategories" (
    "id" uuid not null default gen_random_uuid(),
    "category_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "min_price" numeric(10,2) not null default 0,
    "max_price" numeric(10,2) not null default 999999,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."subcategories" enable row level security;


  create table "public"."user_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "full_name" character varying(255),
    "role" character varying(50) default 'customer'::character varying,
    "phone" character varying(20),
    "address" text,
    "business_name" character varying(255),
    "contact_person" character varying(255),
    "license_number" character varying(255),
    "registration_status" character varying(50) default 'pending'::character varying,
    "license_document_url" text,
    "id_document_url" text,
    "onboarding_completed" boolean default false,
    "emergency_offline" boolean default false,
    "is_blocked" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "auth_role" text default 'customer'::text,
    "city" text,
    "date_of_birth" date,
    "preferences" jsonb default '{}'::jsonb
      );


alter table "public"."user_profiles" enable row level security;

CREATE UNIQUE INDEX admin_settings_key_key ON public.admin_settings USING btree (key);

CREATE UNIQUE INDEX admin_settings_pkey ON public.admin_settings USING btree (id);

CREATE UNIQUE INDEX booking_slots_pkey ON public.booking_slots USING btree (id);

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX customer_favorites_pkey ON public.customer_favorites USING btree (id);

CREATE UNIQUE INDEX favorites_pkey ON public.favorites USING btree (id);

CREATE UNIQUE INDEX favorites_user_id_provider_id_key ON public.favorites USING btree (user_id, provider_id);

CREATE INDEX idx_bookings_customer_id ON public.bookings USING btree (customer_id);

CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);

CREATE INDEX idx_favorites_customer_id ON public.customer_favorites USING btree (customer_id);

CREATE INDEX idx_provider_services_provider_id ON public.provider_services USING btree (provider_id);

CREATE INDEX idx_provider_services_status ON public.provider_services USING btree (status);

CREATE INDEX idx_provider_services_subcategory_id ON public.provider_services USING btree (subcategory_id);

CREATE INDEX idx_subcategories_category_id ON public.subcategories USING btree (category_id);

CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX locations_pkey ON public.locations USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX provider_services_pkey ON public.provider_services USING btree (id);

CREATE UNIQUE INDEX provider_services_provider_id_subcategory_id_key ON public.provider_services USING btree (provider_id, subcategory_id);

CREATE UNIQUE INDEX service_provider_documents_pkey ON public.service_provider_documents USING btree (id);

CREATE UNIQUE INDEX service_providers_pkey ON public.service_providers USING btree (id);

CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id);

CREATE UNIQUE INDEX subcategories_pkey ON public.subcategories USING btree (id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);

alter table "public"."admin_settings" add constraint "admin_settings_pkey" PRIMARY KEY using index "admin_settings_pkey";

alter table "public"."booking_slots" add constraint "booking_slots_pkey" PRIMARY KEY using index "booking_slots_pkey";

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."customer_favorites" add constraint "customer_favorites_pkey" PRIMARY KEY using index "customer_favorites_pkey";

alter table "public"."favorites" add constraint "favorites_pkey" PRIMARY KEY using index "favorites_pkey";

alter table "public"."locations" add constraint "locations_pkey" PRIMARY KEY using index "locations_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."provider_services" add constraint "provider_services_pkey" PRIMARY KEY using index "provider_services_pkey";

alter table "public"."service_provider_documents" add constraint "service_provider_documents_pkey" PRIMARY KEY using index "service_provider_documents_pkey";

alter table "public"."service_providers" add constraint "service_providers_pkey" PRIMARY KEY using index "service_providers_pkey";

alter table "public"."services" add constraint "services_pkey" PRIMARY KEY using index "services_pkey";

alter table "public"."subcategories" add constraint "subcategories_pkey" PRIMARY KEY using index "subcategories_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."admin_settings" add constraint "admin_settings_key_key" UNIQUE using index "admin_settings_key_key";

alter table "public"."booking_slots" add constraint "booking_slots_blocked_by_fkey" FOREIGN KEY (blocked_by) REFERENCES auth.users(id) not valid;

alter table "public"."booking_slots" validate constraint "booking_slots_blocked_by_fkey";

alter table "public"."booking_slots" add constraint "booking_slots_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) not valid;

alter table "public"."booking_slots" validate constraint "booking_slots_booking_id_fkey";

alter table "public"."booking_slots" add constraint "booking_slots_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."booking_slots" validate constraint "booking_slots_provider_id_fkey";

alter table "public"."booking_slots" add constraint "booking_slots_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE not valid;

alter table "public"."booking_slots" validate constraint "booking_slots_service_id_fkey";

alter table "public"."bookings" add constraint "bookings_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) not valid;

alter table "public"."bookings" validate constraint "bookings_customer_id_fkey";

alter table "public"."bookings" add constraint "bookings_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text]))) not valid;

alter table "public"."bookings" validate constraint "bookings_payment_status_check";

alter table "public"."bookings" add constraint "bookings_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES service_providers(id) not valid;

alter table "public"."bookings" validate constraint "bookings_provider_id_fkey";

alter table "public"."bookings" add constraint "bookings_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) not valid;

alter table "public"."bookings" validate constraint "bookings_service_id_fkey";

alter table "public"."bookings" add constraint "bookings_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text, 'rescheduled'::text]))) not valid;

alter table "public"."bookings" validate constraint "bookings_status_check";

alter table "public"."customer_favorites" add constraint "customer_favorites_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."customer_favorites" validate constraint "customer_favorites_customer_id_fkey";

alter table "public"."favorites" add constraint "favorites_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_provider_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_user_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_provider_id_key" UNIQUE using index "favorites_user_id_provider_id_key";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."provider_services" add constraint "provider_services_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."provider_services" validate constraint "provider_services_provider_id_fkey";

alter table "public"."provider_services" add constraint "provider_services_provider_id_subcategory_id_key" UNIQUE using index "provider_services_provider_id_subcategory_id_key";

alter table "public"."provider_services" add constraint "provider_services_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."provider_services" validate constraint "provider_services_status_check";

alter table "public"."provider_services" add constraint "provider_services_subcategory_id_fkey" FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE not valid;

alter table "public"."provider_services" validate constraint "provider_services_subcategory_id_fkey";

alter table "public"."service_provider_documents" add constraint "service_provider_documents_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."service_provider_documents" validate constraint "service_provider_documents_provider_id_fkey";

alter table "public"."service_provider_documents" add constraint "service_provider_documents_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES auth.users(id) not valid;

alter table "public"."service_provider_documents" validate constraint "service_provider_documents_verified_by_fkey";

alter table "public"."service_providers" add constraint "service_providers_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'blocked'::text]))) not valid;

alter table "public"."service_providers" validate constraint "service_providers_status_check";

alter table "public"."service_providers" add constraint "service_providers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."service_providers" validate constraint "service_providers_user_id_fkey";

alter table "public"."subcategories" add constraint "subcategories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."subcategories" validate constraint "subcategories_category_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_registration_status_check" CHECK (((registration_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_registration_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_role_check" CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'provider'::character varying, 'admin'::character varying, 'super_admin'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_role_check";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_key" UNIQUE using index "user_profiles_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_duplicate_credentials(check_email text, check_phone text DEFAULT NULL::text, check_full_name text DEFAULT NULL::text)
 RETURNS TABLE(exists_email boolean, exists_phone boolean, exists_name boolean, existing_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  email_exists BOOLEAN := FALSE;
  phone_exists BOOLEAN := FALSE;
  name_exists BOOLEAN := FALSE;
  found_role TEXT := NULL;
BEGIN
  -- Check if email exists in auth.users (this requires RLS bypass)
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = check_email
  ) INTO email_exists;
  
  -- Check if phone exists in user_profiles
  IF check_phone IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles WHERE phone = check_phone
    ) INTO phone_exists;
    
    -- Get the role of user with this phone
    SELECT role INTO found_role 
    FROM public.user_profiles 
    WHERE phone = check_phone 
    LIMIT 1;
  END IF;
  
  -- Check if full name exists in user_profiles
  IF check_full_name IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles WHERE full_name = check_full_name
    ) INTO name_exists;
    
    -- Get the role of user with this name (if phone didn't find a role)
    IF found_role IS NULL THEN
      SELECT role INTO found_role 
      FROM public.user_profiles 
      WHERE full_name = check_full_name 
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN QUERY SELECT email_exists, phone_exists, name_exists, found_role;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    full_name, 
    role,
    phone,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    NEW.raw_user_meta_data ->> 'phone',
    false
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_settings" to "anon";

grant insert on table "public"."admin_settings" to "anon";

grant references on table "public"."admin_settings" to "anon";

grant select on table "public"."admin_settings" to "anon";

grant trigger on table "public"."admin_settings" to "anon";

grant truncate on table "public"."admin_settings" to "anon";

grant update on table "public"."admin_settings" to "anon";

grant delete on table "public"."admin_settings" to "authenticated";

grant insert on table "public"."admin_settings" to "authenticated";

grant references on table "public"."admin_settings" to "authenticated";

grant select on table "public"."admin_settings" to "authenticated";

grant trigger on table "public"."admin_settings" to "authenticated";

grant truncate on table "public"."admin_settings" to "authenticated";

grant update on table "public"."admin_settings" to "authenticated";

grant delete on table "public"."admin_settings" to "service_role";

grant insert on table "public"."admin_settings" to "service_role";

grant references on table "public"."admin_settings" to "service_role";

grant select on table "public"."admin_settings" to "service_role";

grant trigger on table "public"."admin_settings" to "service_role";

grant truncate on table "public"."admin_settings" to "service_role";

grant update on table "public"."admin_settings" to "service_role";

grant delete on table "public"."booking_slots" to "anon";

grant insert on table "public"."booking_slots" to "anon";

grant references on table "public"."booking_slots" to "anon";

grant select on table "public"."booking_slots" to "anon";

grant trigger on table "public"."booking_slots" to "anon";

grant truncate on table "public"."booking_slots" to "anon";

grant update on table "public"."booking_slots" to "anon";

grant delete on table "public"."booking_slots" to "authenticated";

grant insert on table "public"."booking_slots" to "authenticated";

grant references on table "public"."booking_slots" to "authenticated";

grant select on table "public"."booking_slots" to "authenticated";

grant trigger on table "public"."booking_slots" to "authenticated";

grant truncate on table "public"."booking_slots" to "authenticated";

grant update on table "public"."booking_slots" to "authenticated";

grant delete on table "public"."booking_slots" to "service_role";

grant insert on table "public"."booking_slots" to "service_role";

grant references on table "public"."booking_slots" to "service_role";

grant select on table "public"."booking_slots" to "service_role";

grant trigger on table "public"."booking_slots" to "service_role";

grant truncate on table "public"."booking_slots" to "service_role";

grant update on table "public"."booking_slots" to "service_role";

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."customer_favorites" to "anon";

grant insert on table "public"."customer_favorites" to "anon";

grant references on table "public"."customer_favorites" to "anon";

grant select on table "public"."customer_favorites" to "anon";

grant trigger on table "public"."customer_favorites" to "anon";

grant truncate on table "public"."customer_favorites" to "anon";

grant update on table "public"."customer_favorites" to "anon";

grant delete on table "public"."customer_favorites" to "authenticated";

grant insert on table "public"."customer_favorites" to "authenticated";

grant references on table "public"."customer_favorites" to "authenticated";

grant select on table "public"."customer_favorites" to "authenticated";

grant trigger on table "public"."customer_favorites" to "authenticated";

grant truncate on table "public"."customer_favorites" to "authenticated";

grant update on table "public"."customer_favorites" to "authenticated";

grant delete on table "public"."customer_favorites" to "service_role";

grant insert on table "public"."customer_favorites" to "service_role";

grant references on table "public"."customer_favorites" to "service_role";

grant select on table "public"."customer_favorites" to "service_role";

grant trigger on table "public"."customer_favorites" to "service_role";

grant truncate on table "public"."customer_favorites" to "service_role";

grant update on table "public"."customer_favorites" to "service_role";

grant delete on table "public"."favorites" to "anon";

grant insert on table "public"."favorites" to "anon";

grant references on table "public"."favorites" to "anon";

grant select on table "public"."favorites" to "anon";

grant trigger on table "public"."favorites" to "anon";

grant truncate on table "public"."favorites" to "anon";

grant update on table "public"."favorites" to "anon";

grant delete on table "public"."favorites" to "authenticated";

grant insert on table "public"."favorites" to "authenticated";

grant references on table "public"."favorites" to "authenticated";

grant select on table "public"."favorites" to "authenticated";

grant trigger on table "public"."favorites" to "authenticated";

grant truncate on table "public"."favorites" to "authenticated";

grant update on table "public"."favorites" to "authenticated";

grant delete on table "public"."favorites" to "service_role";

grant insert on table "public"."favorites" to "service_role";

grant references on table "public"."favorites" to "service_role";

grant select on table "public"."favorites" to "service_role";

grant trigger on table "public"."favorites" to "service_role";

grant truncate on table "public"."favorites" to "service_role";

grant update on table "public"."favorites" to "service_role";

grant delete on table "public"."locations" to "anon";

grant insert on table "public"."locations" to "anon";

grant references on table "public"."locations" to "anon";

grant select on table "public"."locations" to "anon";

grant trigger on table "public"."locations" to "anon";

grant truncate on table "public"."locations" to "anon";

grant update on table "public"."locations" to "anon";

grant delete on table "public"."locations" to "authenticated";

grant insert on table "public"."locations" to "authenticated";

grant references on table "public"."locations" to "authenticated";

grant select on table "public"."locations" to "authenticated";

grant trigger on table "public"."locations" to "authenticated";

grant truncate on table "public"."locations" to "authenticated";

grant update on table "public"."locations" to "authenticated";

grant delete on table "public"."locations" to "service_role";

grant insert on table "public"."locations" to "service_role";

grant references on table "public"."locations" to "service_role";

grant select on table "public"."locations" to "service_role";

grant trigger on table "public"."locations" to "service_role";

grant truncate on table "public"."locations" to "service_role";

grant update on table "public"."locations" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."provider_services" to "anon";

grant insert on table "public"."provider_services" to "anon";

grant references on table "public"."provider_services" to "anon";

grant select on table "public"."provider_services" to "anon";

grant trigger on table "public"."provider_services" to "anon";

grant truncate on table "public"."provider_services" to "anon";

grant update on table "public"."provider_services" to "anon";

grant delete on table "public"."provider_services" to "authenticated";

grant insert on table "public"."provider_services" to "authenticated";

grant references on table "public"."provider_services" to "authenticated";

grant select on table "public"."provider_services" to "authenticated";

grant trigger on table "public"."provider_services" to "authenticated";

grant truncate on table "public"."provider_services" to "authenticated";

grant update on table "public"."provider_services" to "authenticated";

grant delete on table "public"."provider_services" to "service_role";

grant insert on table "public"."provider_services" to "service_role";

grant references on table "public"."provider_services" to "service_role";

grant select on table "public"."provider_services" to "service_role";

grant trigger on table "public"."provider_services" to "service_role";

grant truncate on table "public"."provider_services" to "service_role";

grant update on table "public"."provider_services" to "service_role";

grant delete on table "public"."service_provider_documents" to "anon";

grant insert on table "public"."service_provider_documents" to "anon";

grant references on table "public"."service_provider_documents" to "anon";

grant select on table "public"."service_provider_documents" to "anon";

grant trigger on table "public"."service_provider_documents" to "anon";

grant truncate on table "public"."service_provider_documents" to "anon";

grant update on table "public"."service_provider_documents" to "anon";

grant delete on table "public"."service_provider_documents" to "authenticated";

grant insert on table "public"."service_provider_documents" to "authenticated";

grant references on table "public"."service_provider_documents" to "authenticated";

grant select on table "public"."service_provider_documents" to "authenticated";

grant trigger on table "public"."service_provider_documents" to "authenticated";

grant truncate on table "public"."service_provider_documents" to "authenticated";

grant update on table "public"."service_provider_documents" to "authenticated";

grant delete on table "public"."service_provider_documents" to "service_role";

grant insert on table "public"."service_provider_documents" to "service_role";

grant references on table "public"."service_provider_documents" to "service_role";

grant select on table "public"."service_provider_documents" to "service_role";

grant trigger on table "public"."service_provider_documents" to "service_role";

grant truncate on table "public"."service_provider_documents" to "service_role";

grant update on table "public"."service_provider_documents" to "service_role";

grant delete on table "public"."service_providers" to "anon";

grant insert on table "public"."service_providers" to "anon";

grant references on table "public"."service_providers" to "anon";

grant select on table "public"."service_providers" to "anon";

grant trigger on table "public"."service_providers" to "anon";

grant truncate on table "public"."service_providers" to "anon";

grant update on table "public"."service_providers" to "anon";

grant delete on table "public"."service_providers" to "authenticated";

grant insert on table "public"."service_providers" to "authenticated";

grant references on table "public"."service_providers" to "authenticated";

grant select on table "public"."service_providers" to "authenticated";

grant trigger on table "public"."service_providers" to "authenticated";

grant truncate on table "public"."service_providers" to "authenticated";

grant update on table "public"."service_providers" to "authenticated";

grant delete on table "public"."service_providers" to "service_role";

grant insert on table "public"."service_providers" to "service_role";

grant references on table "public"."service_providers" to "service_role";

grant select on table "public"."service_providers" to "service_role";

grant trigger on table "public"."service_providers" to "service_role";

grant truncate on table "public"."service_providers" to "service_role";

grant update on table "public"."service_providers" to "service_role";

grant delete on table "public"."services" to "anon";

grant insert on table "public"."services" to "anon";

grant references on table "public"."services" to "anon";

grant select on table "public"."services" to "anon";

grant trigger on table "public"."services" to "anon";

grant truncate on table "public"."services" to "anon";

grant update on table "public"."services" to "anon";

grant delete on table "public"."services" to "authenticated";

grant insert on table "public"."services" to "authenticated";

grant references on table "public"."services" to "authenticated";

grant select on table "public"."services" to "authenticated";

grant trigger on table "public"."services" to "authenticated";

grant truncate on table "public"."services" to "authenticated";

grant update on table "public"."services" to "authenticated";

grant delete on table "public"."services" to "service_role";

grant insert on table "public"."services" to "service_role";

grant references on table "public"."services" to "service_role";

grant select on table "public"."services" to "service_role";

grant trigger on table "public"."services" to "service_role";

grant truncate on table "public"."services" to "service_role";

grant update on table "public"."services" to "service_role";

grant delete on table "public"."subcategories" to "anon";

grant insert on table "public"."subcategories" to "anon";

grant references on table "public"."subcategories" to "anon";

grant select on table "public"."subcategories" to "anon";

grant trigger on table "public"."subcategories" to "anon";

grant truncate on table "public"."subcategories" to "anon";

grant update on table "public"."subcategories" to "anon";

grant delete on table "public"."subcategories" to "authenticated";

grant insert on table "public"."subcategories" to "authenticated";

grant references on table "public"."subcategories" to "authenticated";

grant select on table "public"."subcategories" to "authenticated";

grant trigger on table "public"."subcategories" to "authenticated";

grant truncate on table "public"."subcategories" to "authenticated";

grant update on table "public"."subcategories" to "authenticated";

grant delete on table "public"."subcategories" to "service_role";

grant insert on table "public"."subcategories" to "service_role";

grant references on table "public"."subcategories" to "service_role";

grant select on table "public"."subcategories" to "service_role";

grant trigger on table "public"."subcategories" to "service_role";

grant truncate on table "public"."subcategories" to "service_role";

grant update on table "public"."subcategories" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";


  create policy "Anyone can view admin settings"
  on "public"."admin_settings"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can view booking slots"
  on "public"."booking_slots"
  as permissive
  for select
  to public
using (true);



  create policy "Users can create slot blocks"
  on "public"."booking_slots"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "Users can update own slot blocks"
  on "public"."booking_slots"
  as permissive
  for update
  to public
using ((auth.uid() = blocked_by));



  create policy "Users can create bookings"
  on "public"."bookings"
  as permissive
  for insert
  to public
with check ((auth.uid() = customer_id));



  create policy "Users can delete their own bookings"
  on "public"."bookings"
  as permissive
  for delete
  to public
using ((auth.uid() = customer_id));



  create policy "Users can insert their own bookings"
  on "public"."bookings"
  as permissive
  for insert
  to public
with check ((auth.uid() = customer_id));



  create policy "Users can update their own bookings"
  on "public"."bookings"
  as permissive
  for update
  to public
using ((auth.uid() = customer_id));



  create policy "Users can view their own bookings"
  on "public"."bookings"
  as permissive
  for select
  to public
using ((auth.uid() = customer_id));



  create policy "Allow all operations on categories"
  on "public"."categories"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Categories are viewable by everyone"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own favorites"
  on "public"."customer_favorites"
  as permissive
  for delete
  to public
using ((auth.uid() = customer_id));



  create policy "Users can insert their own favorites"
  on "public"."customer_favorites"
  as permissive
  for insert
  to public
with check ((auth.uid() = customer_id));



  create policy "Users can update their own favorites"
  on "public"."customer_favorites"
  as permissive
  for update
  to public
using ((auth.uid() = customer_id));



  create policy "Users can view their own favorites"
  on "public"."customer_favorites"
  as permissive
  for select
  to public
using ((auth.uid() = customer_id));



  create policy "Users can manage their favorites"
  on "public"."favorites"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Allow all operations on locations"
  on "public"."locations"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Locations are viewable by everyone"
  on "public"."locations"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Only providers can insert their services"
  on "public"."provider_services"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND ((user_profiles.role)::text = 'provider'::text) AND (user_profiles.id = provider_services.provider_id)))));



  create policy "Provider services are viewable by admins and owners"
  on "public"."provider_services"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[])) OR (user_profiles.id = provider_services.provider_id))))));



  create policy "Providers can delete their own services, admins can delete any"
  on "public"."provider_services"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[])) OR (((user_profiles.role)::text = 'provider'::text) AND (user_profiles.id = provider_services.provider_id)))))));



  create policy "Providers can update their own services, admins can update any"
  on "public"."provider_services"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[])) OR (((user_profiles.role)::text = 'provider'::text) AND (user_profiles.id = provider_services.provider_id)))))));



  create policy "Providers can manage own documents"
  on "public"."service_provider_documents"
  as permissive
  for all
  to public
using ((auth.uid() = provider_id));



  create policy "Anyone can view approved providers"
  on "public"."service_providers"
  as permissive
  for select
  to public
using ((status = 'approved'::text));



  create policy "Anyone can view active services"
  on "public"."services"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Allow all operations on subcategories"
  on "public"."subcategories"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Subcategories are viewable by everyone"
  on "public"."subcategories"
  as permissive
  for select
  to public
using (true);



  create policy "Allow users to insert profiles"
  on "public"."user_profiles"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow users to update profiles"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using (true);



  create policy "Allow users to view profiles"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own profile"
  on "public"."user_profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own profile"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own profile"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_services_updated_at BEFORE UPDATE ON public.provider_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


