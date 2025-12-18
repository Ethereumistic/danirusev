-- ============================================
-- SUPABASE MIGRATION V5: Add idempotency for order creation
-- This prevents duplicate orders when Stripe webhooks are retried
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add stripe_payment_intent_id column to orders table
ALTER TABLE ecommerce.orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- 2. Add unique constraint to prevent duplicate orders for the same payment
-- First, check if constraint already exists and drop it if so
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_stripe_payment_intent_id_key') THEN
        ALTER TABLE ecommerce.orders DROP CONSTRAINT orders_stripe_payment_intent_id_key;
    END IF;
END $$;

ALTER TABLE ecommerce.orders 
ADD CONSTRAINT orders_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);

-- 3. Create index for faster lookups
DROP INDEX IF EXISTS ecommerce.idx_orders_stripe_payment_intent_id;
CREATE INDEX idx_orders_stripe_payment_intent_id 
ON ecommerce.orders(stripe_payment_intent_id);

-- ============================================
-- CRITICAL FIX: Drop OLD ecommerce schema functions
-- These were causing duplicate orders because Supabase was finding both!
-- ============================================
DROP FUNCTION IF EXISTS ecommerce.create_order_from_webhook(uuid, numeric, jsonb, jsonb);
DROP FUNCTION IF EXISTS ecommerce.create_order_from_webhook(uuid, numeric, jsonb, jsonb, text);

-- 4. Update create_order_from_webhook to accept payment_intent_id and be idempotent
DROP FUNCTION IF EXISTS public.create_order_from_webhook(uuid, numeric, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_order_from_webhook(uuid, numeric, jsonb, jsonb, text);

CREATE OR REPLACE FUNCTION public.create_order_from_webhook(
    p_user_id uuid,
    p_total_price numeric,
    p_shipping_address_snapshot jsonb,
    p_cart_items jsonb,
    p_stripe_payment_intent_id text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id BIGINT;
    existing_order_id BIGINT;
    item jsonb;
BEGIN
    -- IDEMPOTENCY CHECK: If payment intent ID provided, check if order already exists
    IF p_stripe_payment_intent_id IS NOT NULL THEN
        SELECT id INTO existing_order_id 
        FROM ecommerce.orders 
        WHERE stripe_payment_intent_id = p_stripe_payment_intent_id;
        
        IF existing_order_id IS NOT NULL THEN
            -- Order already exists, return existing order ID (idempotent)
            RAISE NOTICE 'Order already exists for payment intent %, returning existing order ID %', 
                p_stripe_payment_intent_id, existing_order_id;
            RETURN existing_order_id;
        END IF;
    END IF;

    -- Create new order with payment intent ID
    INSERT INTO ecommerce.orders (user_id, total_price, shipping_address_snapshot, stripe_payment_intent_id)
    VALUES (p_user_id, p_total_price, p_shipping_address_snapshot, p_stripe_payment_intent_id)
    RETURNING id INTO new_order_id;

    -- Insert order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        INSERT INTO ecommerce.order_items (
            order_id, product_id, quantity, price, title,
            variant, sku, item_type, image_url, location, addons,
            voucher_type, voucher_recipient_name
        )
        VALUES (
            new_order_id, 
            COALESCE(item->>'product_id', ''),
            COALESCE((item->>'quantity')::integer, 1),
            COALESCE((item->>'price')::numeric, 0),
            COALESCE(item->>'title', ''),
            item->>'variant',
            item->>'sku',
            COALESCE(item->>'item_type', 'physical'),
            item->>'image_url',
            item->>'location',
            item->'addons',
            item->>'voucher_type',
            item->>'voucher_recipient_name'
        );
    END LOOP;

    RETURN new_order_id;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_order_from_webhook(uuid, numeric, jsonb, jsonb, text) TO service_role;

-- 6. Update get_all_orders_with_details to include stripe_payment_intent_id (optional, for admin debugging)
DROP FUNCTION IF EXISTS public.get_all_orders_with_details();

CREATE OR REPLACE FUNCTION public.get_all_orders_with_details()
RETURNS TABLE (
    "orderId" text,
    "customerEmail" text,
    "customerName" text,
    "customerPhone" text,
    "customerAddress" text,
    "customerCity" text,
    "customerPostalCode" text,
    "customerCountry" text,
    "productTitles" text,
    total numeric,
    status text,
    "createdAt" timestamptz,
    "stripePaymentIntentId" text,
    "orderItems" jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id::text AS "orderId",
        (o.shipping_address_snapshot->>'email')::text AS "customerEmail",
        (o.shipping_address_snapshot->>'fullName')::text AS "customerName",
        (o.shipping_address_snapshot->>'phoneNumber')::text AS "customerPhone",
        (o.shipping_address_snapshot->>'address')::text AS "customerAddress",
        (o.shipping_address_snapshot->>'city')::text AS "customerCity",
        (o.shipping_address_snapshot->>'postalCode')::text AS "customerPostalCode",
        (o.shipping_address_snapshot->>'country')::text AS "customerCountry",
        string_agg(
            CASE 
                WHEN oi.variant IS NOT NULL AND oi.variant != '' 
                THEN oi.title || ' (' || oi.variant || ')'
                ELSE oi.title
            END, 
            ', '
        ) AS "productTitles",
        o.total_price AS total,
        o.status,
        o.created_at AS "createdAt",
        o.stripe_payment_intent_id AS "stripePaymentIntentId",
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'title', oi.title,
                    'variant', oi.variant,
                    'sku', oi.sku,
                    'item_type', oi.item_type,
                    'image_url', oi.image_url,
                    'location', oi.location,
                    'addons', oi.addons,
                    'voucher_type', oi.voucher_type,
                    'voucher_recipient_name', oi.voucher_recipient_name
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) AS "orderItems"
    FROM ecommerce.orders o
    LEFT JOIN ecommerce.order_items oi ON o.id = oi.order_id
    GROUP BY o.id, o.created_at, o.total_price, o.status, o.shipping_address_snapshot, o.stripe_payment_intent_id
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_orders_with_details TO authenticated;
