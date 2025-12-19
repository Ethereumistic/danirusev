-- ============================================
-- SUPABASE MIGRATION: Move Profile Functions to Public Schema
-- Run this in your Supabase SQL Editor
-- This migration moves profile-related functions from ecommerce schema
-- to public schema for direct RPC access from Supabase client
-- ============================================

-- ============================================
-- 1. Drop ALL existing versions of these functions (both schemas)
-- ============================================
-- Drop from ecommerce schema
DROP FUNCTION IF EXISTS ecommerce.update_profile_from_checkout(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS ecommerce.update_profile_from_checkout(uuid, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS ecommerce.get_user_profile();

-- Drop from public schema (in case they exist with different signatures)
DROP FUNCTION IF EXISTS public.update_profile_from_checkout(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.update_profile_from_checkout(uuid, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.get_user_profile();

-- ============================================
-- 2. Create update_profile_from_checkout in PUBLIC schema
-- Called by the Stripe webhook after successful payment
-- Now also saves billing_address as JSONB for convenience
-- ============================================
CREATE OR REPLACE FUNCTION public.update_profile_from_checkout(
    p_user_id uuid,
    p_full_name text,
    p_phone_number text,
    p_address text,
    p_city text,
    p_postal_code text,
    p_country text,
    p_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_billing_address jsonb;
BEGIN
    -- Build the billing_address JSONB object
    v_billing_address := jsonb_build_object(
        'fullName', p_full_name,
        'email', COALESCE(p_email, ''),
        'phoneNumber', p_phone_number,
        'address', p_address,
        'city', p_city,
        'postalCode', p_postal_code,
        'country', p_country
    );

    -- Insert or update profile with checkout info
    INSERT INTO ecommerce.profiles (
        id, 
        full_name, 
        phone_number, 
        address, 
        city, 
        postal_code, 
        country,
        email,
        billing_address,
        updated_at
    )
    VALUES (
        p_user_id,
        p_full_name,
        p_phone_number,
        p_address,
        p_city,
        p_postal_code,
        p_country,
        p_email,
        v_billing_address,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        -- Always update with new values (don't keep old if new is provided)
        full_name = CASE WHEN p_full_name IS NOT NULL AND p_full_name != '' THEN p_full_name ELSE ecommerce.profiles.full_name END,
        phone_number = CASE WHEN p_phone_number IS NOT NULL AND p_phone_number != '' THEN p_phone_number ELSE ecommerce.profiles.phone_number END,
        address = CASE WHEN p_address IS NOT NULL AND p_address != '' THEN p_address ELSE ecommerce.profiles.address END,
        city = CASE WHEN p_city IS NOT NULL AND p_city != '' THEN p_city ELSE ecommerce.profiles.city END,
        postal_code = CASE WHEN p_postal_code IS NOT NULL AND p_postal_code != '' THEN p_postal_code ELSE ecommerce.profiles.postal_code END,
        country = CASE WHEN p_country IS NOT NULL AND p_country != '' THEN p_country ELSE ecommerce.profiles.country END,
        email = CASE WHEN p_email IS NOT NULL AND p_email != '' THEN p_email ELSE ecommerce.profiles.email END,
        billing_address = v_billing_address,
        updated_at = NOW();
END;
$$;

-- Grant permissions to service_role (for webhook calls)
GRANT EXECUTE ON FUNCTION public.update_profile_from_checkout(uuid, text, text, text, text, text, text, text) TO service_role;

-- ============================================
-- 3. Create get_user_profile in PUBLIC schema
-- Returns the profile for the current authenticated user
-- Used by checkout form to pre-fill personal info
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE (
    id uuid,
    updated_at timestamptz,
    full_name text,
    email text,
    address text,
    city text,
    postal_code text,
    country text,
    phone_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.updated_at,
        p.full_name,
        COALESCE(p.email, (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())) as email,
        p.address,
        p.city,
        p.postal_code,
        p.country,
        p.phone_number
    FROM ecommerce.profiles p
    WHERE p.id = auth.uid();
END;
$$;

-- Grant permissions to authenticated users (for checkout form)
GRANT EXECUTE ON FUNCTION public.get_user_profile() TO authenticated;

-- ============================================
-- 4. Verify the functions exist
-- ============================================
-- You can run these to verify:
-- SELECT proname, nspname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE proname = 'update_profile_from_checkout';
-- SELECT proname, nspname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE proname = 'get_user_profile';
