-- ============================================
-- SUPABASE MIGRATION: Vouchers System
-- Run this in Supabase SQL Editor
-- PDFs are generated on-demand, no storage needed
-- ============================================

-- 1. Create vouchers table (no pdf_url - PDFs generated on-demand)
CREATE TABLE IF NOT EXISTS ecommerce.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id INTEGER NOT NULL REFERENCES ecommerce.order_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES ecommerce.profiles(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    selected_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    addons JSONB,
    voucher_recipient_name TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'redeemed', 'expired')),
    redeemed_at TIMESTAMPTZ,
    redeemed_by UUID REFERENCES ecommerce.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON ecommerce.vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_order_item_id ON ecommerce.vouchers(order_item_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON ecommerce.vouchers(status);

-- 2. RPC to create a voucher record
DROP FUNCTION IF EXISTS public.create_voucher(integer, uuid, text, date, jsonb, text, text, text);
DROP FUNCTION IF EXISTS public.create_voucher(integer, uuid, text, date, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.create_voucher(
    p_order_item_id integer,
    p_user_id uuid,
    p_product_slug text,
    p_selected_date date,
    p_addons jsonb DEFAULT NULL,
    p_voucher_recipient_name text DEFAULT NULL,
    p_location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_voucher_id UUID;
    v_expiry_date DATE;
BEGIN
    -- Calculate expiry date (1 year from selected date)
    v_expiry_date := p_selected_date + INTERVAL '1 year';
    
    -- Check if voucher already exists for this order item
    SELECT id INTO new_voucher_id 
    FROM ecommerce.vouchers 
    WHERE order_item_id = p_order_item_id;
    
    IF new_voucher_id IS NOT NULL THEN
        -- Update existing voucher
        UPDATE ecommerce.vouchers
        SET selected_date = p_selected_date,
            expiry_date = v_expiry_date
        WHERE id = new_voucher_id;
        RETURN new_voucher_id;
    END IF;
    
    -- Insert new voucher
    INSERT INTO ecommerce.vouchers (
        order_item_id, user_id, product_slug, selected_date, expiry_date,
        addons, voucher_recipient_name, location, status
    )
    VALUES (
        p_order_item_id, p_user_id, p_product_slug, p_selected_date, v_expiry_date,
        p_addons, p_voucher_recipient_name, p_location, 'active'
    )
    RETURNING id INTO new_voucher_id;
    
    RETURN new_voucher_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_voucher(integer, uuid, text, date, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_voucher(integer, uuid, text, date, jsonb, text, text) TO service_role;

-- 3. RPC to get user's vouchers
DROP FUNCTION IF EXISTS public.get_user_vouchers();

CREATE OR REPLACE FUNCTION public.get_user_vouchers()
RETURNS TABLE (
    id uuid,
    order_item_id integer,
    product_slug text,
    selected_date date,
    expiry_date date,
    addons jsonb,
    voucher_recipient_name text,
    location text,
    status text,
    redeemed_at timestamptz,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.order_item_id,
        v.product_slug,
        v.selected_date,
        v.expiry_date,
        v.addons,
        v.voucher_recipient_name,
        v.location,
        v.status,
        v.redeemed_at,
        v.created_at
    FROM ecommerce.vouchers v
    WHERE v.user_id = auth.uid()
    ORDER BY v.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_vouchers TO authenticated;

-- 4. RPC to get voucher by ID (for verification)
DROP FUNCTION IF EXISTS public.get_voucher_by_id(uuid);

CREATE OR REPLACE FUNCTION public.get_voucher_by_id(p_voucher_id uuid)
RETURNS TABLE (
    id uuid,
    order_item_id integer,
    user_id uuid,
    product_slug text,
    selected_date date,
    expiry_date date,
    addons jsonb,
    voucher_recipient_name text,
    location text,
    status text,
    redeemed_at timestamptz,
    created_at timestamptz,
    customer_name text,
    customer_email text,
    customer_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.order_item_id,
        v.user_id,
        v.product_slug,
        v.selected_date,
        v.expiry_date,
        v.addons,
        v.voucher_recipient_name,
        v.location,
        v.status,
        v.redeemed_at,
        v.created_at,
        p.full_name as customer_name,
        p.email as customer_email,
        p.phone_number as customer_phone
    FROM ecommerce.vouchers v
    LEFT JOIN ecommerce.profiles p ON v.user_id = p.id
    WHERE v.id = p_voucher_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_voucher_by_id(uuid) TO authenticated;

-- 5. RPC to redeem voucher
DROP FUNCTION IF EXISTS public.redeem_voucher(uuid);

CREATE OR REPLACE FUNCTION public.redeem_voucher(p_voucher_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status TEXT;
    v_expiry_date DATE;
BEGIN
    -- Get current voucher status
    SELECT status, expiry_date INTO v_status, v_expiry_date
    FROM ecommerce.vouchers
    WHERE id = p_voucher_id;
    
    IF v_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
    END IF;
    
    IF v_status = 'redeemed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Voucher already redeemed');
    END IF;
    
    IF v_status = 'expired' OR v_expiry_date < CURRENT_DATE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Voucher has expired');
    END IF;
    
    -- Redeem the voucher
    UPDATE ecommerce.vouchers
    SET status = 'redeemed',
        redeemed_at = NOW(),
        redeemed_by = auth.uid()
    WHERE id = p_voucher_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Voucher redeemed successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_voucher(uuid) TO authenticated;
