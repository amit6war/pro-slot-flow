drop extension if exists "pg_net";

drop policy "Provider services are viewable by admins and owners" on "public"."provider_services";

drop policy "Providers can delete their own services, admins can delete any" on "public"."provider_services";

drop policy "Providers can update their own services, admins can update any" on "public"."provider_services";

alter table "public"."provider_services" drop constraint "provider_services_status_check";

alter table "public"."user_profiles" drop constraint "user_profiles_registration_status_check";

alter table "public"."user_profiles" drop constraint "user_profiles_role_check";

alter table "public"."provider_services" add constraint "provider_services_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."provider_services" validate constraint "provider_services_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_registration_status_check" CHECK (((registration_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_registration_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_role_check" CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'provider'::character varying, 'admin'::character varying, 'super_admin'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_role_check";


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



