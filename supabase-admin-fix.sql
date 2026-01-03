-- ============================================
-- SUPABASE MIGRATION: Admin Access & Role Security
-- This script creates robust functions to check user roles.
-- Run this in your Supabase SQL Editor.
-- ============================================

-- 1. Function to check if a user is an admin safely
-- Use SECURITY DEFINER to bypass RLS on the public.users table (Payload)
CREATE OR REPLACE FUNCTION public.is_admin(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = p_email AND role = 'admin'
  );
END;
$$;

-- 2. Function to get a user's role safely
CREATE OR REPLACE FUNCTION public.get_user_role(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  -- Check payload users first
  SELECT role INTO v_role FROM public.users WHERE email = p_email;
  
  -- If not found, it's a customer
  -- (Optionally you could check ecommerce.profiles here if you had other roles)
  RETURN COALESCE(v_role, 'customer');
END;
$$;

-- 3. Grant permissions to allow these functions to be called via the API
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO anon, authenticated;

-- 4. Add a safe RLS policy for the users table just in case any direct queries remain
-- This allows users to see ONLY their own record in the payload users table
DROP POLICY IF EXISTS "Users can see their own role in payload" ON public.users;
CREATE POLICY "Users can see their own role in payload" ON public.users
FOR SELECT USING (email = auth.jwt()->>'email');
