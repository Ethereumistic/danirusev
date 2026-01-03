-- ============================================
-- SUPABASE MIGRATION: Security Hardening (RLS Enablement)
-- This script enables Row Level Security (RLS) on all tables in public/ecommerce.
-- Run this in your Supabase SQL Editor.
-- ============================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- 1. Enable RLS for all tables in the 'public' schema
    -- This addresses the "RLS Disabled in Public" errors.
    -- Payload CMS will still work because it connects via a service role/superuser that bypasses RLS.
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;

    -- 2. Enable RLS for all tables in the 'ecommerce' schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'ecommerce') LOOP
        EXECUTE 'ALTER TABLE ecommerce.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- 3. Add fundamental policies for ecommerce schema (Optional but best practice)
-- Even though we use SECURITY DEFINER RPCs, these policies ensure safety if 
-- the client library is ever used directly for SELECTs.

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON ecommerce.profiles;
CREATE POLICY "Users can view their own profile" ON ecommerce.profiles
    FOR SELECT USING (auth.uid() = id);

-- ORDERS
DROP POLICY IF EXISTS "Users can view their own orders" ON ecommerce.orders;
CREATE POLICY "Users can view their own orders" ON ecommerce.orders
    FOR SELECT USING (auth.uid() = user_id);

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can view their own order items" ON ecommerce.order_items;
CREATE POLICY "Users can view their own order items" ON ecommerce.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ecommerce.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- VOUCHERS
DROP POLICY IF EXISTS "Users can view their own vouchers" ON ecommerce.vouchers;
CREATE POLICY "Users can view their own vouchers" ON ecommerce.vouchers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ecommerce.order_items 
            JOIN ecommerce.orders ON orders.id = order_items.order_id
            WHERE order_items.id = vouchers.order_item_id 
            AND orders.user_id = auth.uid()
        )
    );

-- NOTE: We are NOT adding INSERT/UPDATE/DELETE policies because 
-- mutations should only happen through your SECURITY DEFINER RPCs
-- or the Stripe Webhook (Service Role).
