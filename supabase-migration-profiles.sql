-- ============================================
-- SUPABASE MIGRATION: Auto-create Profile on Sign Up
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, add email column to profiles if it doesn't exist
ALTER TABLE ecommerce.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- This trigger automatically creates a profile in ecommerce.profiles
-- when a new user signs up in auth.users

CREATE OR REPLACE FUNCTION ecommerce.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO ecommerce.profiles (id, full_name, email, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION ecommerce.handle_new_user();

-- ============================================
-- Function to update profile from checkout
-- Called by the Stripe webhook after successful payment
-- ============================================

CREATE OR REPLACE FUNCTION ecommerce.update_profile_from_checkout(
    p_user_id uuid,
    p_full_name text,
    p_phone_number text,
    p_address text,
    p_city text,
    p_postal_code text,
    p_country text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update profile with checkout info
    INSERT INTO ecommerce.profiles (
        id, 
        full_name, 
        phone_number, 
        address, 
        city, 
        postal_code, 
        country,
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
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(NULLIF(p_full_name, ''), ecommerce.profiles.full_name),
        phone_number = COALESCE(NULLIF(p_phone_number, ''), ecommerce.profiles.phone_number),
        address = COALESCE(NULLIF(p_address, ''), ecommerce.profiles.address),
        city = COALESCE(NULLIF(p_city, ''), ecommerce.profiles.city),
        postal_code = COALESCE(NULLIF(p_postal_code, ''), ecommerce.profiles.postal_code),
        country = COALESCE(NULLIF(p_country, ''), ecommerce.profiles.country),
        updated_at = NOW();
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ecommerce.update_profile_from_checkout TO service_role;

-- ============================================
-- Function to get user profile (used by checkout)
-- Returns the profile for the current authenticated user
-- ============================================

CREATE OR REPLACE FUNCTION ecommerce.get_user_profile()
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION ecommerce.get_user_profile TO authenticated;
