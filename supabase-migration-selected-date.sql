-- ============================================
-- SUPABASE MIGRATION: Add selected_date to order_items
-- Run this in Supabase SQL Editor after all code changes are deployed
-- ============================================

-- 1. Add selected_date column to order_items table
ALTER TABLE ecommerce.order_items 
ADD COLUMN IF NOT EXISTS selected_date DATE NULL;

-- 2. Update create_order_from_webhook to handle selected_date
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
            RAISE NOTICE 'Order already exists for payment intent %, returning existing order ID %', 
                p_stripe_payment_intent_id, existing_order_id;
            RETURN existing_order_id;
        END IF;
    END IF;

    -- Create new order with payment intent ID
    INSERT INTO ecommerce.orders (user_id, total_price, shipping_address_snapshot, stripe_payment_intent_id)
    VALUES (p_user_id, p_total_price, p_shipping_address_snapshot, p_stripe_payment_intent_id)
    RETURNING id INTO new_order_id;

    -- Insert order items (now including selected_date)
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        INSERT INTO ecommerce.order_items (
            order_id, product_id, quantity, price, title,
            variant, sku, item_type, image_url, location, addons,
            voucher_type, voucher_recipient_name, selected_date
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
            item->>'voucher_recipient_name',
            (item->>'selected_date')::date
        );
    END LOOP;

    RETURN new_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_from_webhook(uuid, numeric, jsonb, jsonb, text) TO service_role;

-- 3. Update get_all_orders_with_details to include selected_date and voucher_id
DROP FUNCTION IF EXISTS public.get_all_orders_with_details();

CREATE OR REPLACE FUNCTION public.get_all_orders_with_details()
RETURNS TABLE (
    "orderId" text,
    "userId" uuid,
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
        o.user_id AS "userId",
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
                    'voucher_recipient_name', oi.voucher_recipient_name,
                    'selected_date', oi.selected_date,
                    'voucher_id', v.id
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) AS "orderItems"
    FROM ecommerce.orders o
    LEFT JOIN ecommerce.order_items oi ON o.id = oi.order_id
    LEFT JOIN ecommerce.vouchers v ON oi.id = v.order_item_id
    GROUP BY o.id, o.created_at, o.total_price, o.status, o.shipping_address_snapshot, o.stripe_payment_intent_id
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_orders_with_details TO authenticated;

-- 4. Update get_user_orders_with_items to include selected_date and voucher_id
DROP FUNCTION IF EXISTS public.get_user_orders_with_items();

CREATE OR REPLACE FUNCTION public.get_user_orders_with_items()
RETURNS TABLE (
    id bigint,
    created_at timestamptz,
    total_price numeric,
    status text,
    shipping_address_snapshot jsonb,
    order_items jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.created_at,
        o.total_price,
        o.status,
        o.shipping_address_snapshot,
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
                    'voucher_recipient_name', oi.voucher_recipient_name,
                    'selected_date', oi.selected_date,
                    'voucher_id', v.id
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) AS order_items
    FROM ecommerce.orders o
    LEFT JOIN ecommerce.order_items oi ON o.id = oi.order_id
    LEFT JOIN ecommerce.vouchers v ON oi.id = v.order_item_id
    WHERE o.user_id = auth.uid()
    GROUP BY o.id
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_orders_with_items TO authenticated;

-- 5. Create RPC function to confirm order date and update status
DROP FUNCTION IF EXISTS public.confirm_order_date(bigint, integer, date);

CREATE OR REPLACE FUNCTION public.confirm_order_date(
    p_order_id bigint,
    p_order_item_id integer DEFAULT NULL,
    p_selected_date date DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update order item's selected_date if provided
    IF p_order_item_id IS NOT NULL AND p_selected_date IS NOT NULL THEN
        UPDATE ecommerce.order_items
        SET selected_date = p_selected_date
        WHERE id = p_order_item_id AND order_id = p_order_id;
    END IF;

    -- Update order status to 'approved' if it was Pending
    UPDATE ecommerce.orders
    SET status = 'approved'
    WHERE id = p_order_id AND (status = 'Pending' OR status = 'pending');

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_order_date(bigint, integer, date) TO authenticated;
