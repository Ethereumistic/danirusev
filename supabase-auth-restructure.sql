-- ============================================
-- SUPABASE MIGRATION: Super-Robust Auth Roles (Metadata Sync)
-- This script ensures roles are stored in Auth Metadata for performance.
-- Run this in your Supabase SQL Editor.
-- ============================================

-- 1. Function to sync Payload roles to Supabase app_metadata
CREATE OR REPLACE FUNCTION public.sync_payload_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Look for the user in auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = NEW.email;

  IF v_user_id IS NOT NULL THEN
    -- Update the app_metadata to include the role
    -- This "stamps" the role into the JWT, making it zero-query on the frontend
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role)
    WHERE id = v_user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Trigger on public.users (Payload)
DROP TRIGGER IF EXISTS on_payload_user_upsert ON public.users;
CREATE TRIGGER on_payload_user_upsert
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payload_user_role();

-- 3. Ensure new sign-ups default to 'customer' role in metadata
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payload_role text;
BEGIN
  -- Check if this email is already an admin in Payload
  SELECT role INTO v_payload_role FROM public.users WHERE email = NEW.email;

  -- Set metadata (Default to customer, or Payload role if exists)
  NEW.raw_app_meta_data = 
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', COALESCE(v_payload_role, 'customer'));
    
  RETURN NEW;
END;
$$;

-- 4. Trigger on auth.users (Sign-up)
DROP TRIGGER IF EXISTS on_auth_user_created_metadata ON auth.users;
CREATE TRIGGER on_auth_user_created_metadata
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user_metadata();

-- 5. Backfill: Sync existing admin to metadata
-- Replace 'admin@example.com' if you want to be specific, or just sync all
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT email, role FROM public.users) LOOP
        UPDATE auth.users
        SET raw_app_meta_data = 
          COALESCE(raw_app_meta_data, '{}'::jsonb) || 
          jsonb_build_object('role', r.role)
        WHERE email = r.email;
    END LOOP;
END $$;
