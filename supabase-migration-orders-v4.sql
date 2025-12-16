-- ============================================
-- SUPABASE MIGRATION V4: Add image_url to order_items
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add image_url column to order_items if it doesn't exist
ALTER TABLE ecommerce.order_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Update get_all_orders_with_details to include image_url
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
    GROUP BY o.id, o.created_at, o.total_price, o.status, o.shipping_address_snapshot
    ORDER BY o.created_at DESC;
END;
$$;

-- 3. Update create_order_from_webhook to save image_url
DROP FUNCTION IF EXISTS public.create_order_from_webhook(uuid, numeric, jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.create_order_from_webhook(
    p_user_id uuid,
    p_total_price numeric,
    p_shipping_address_snapshot jsonb,
    p_cart_items jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id BIGINT;
    item jsonb;
BEGIN
    INSERT INTO ecommerce.orders (user_id, total_price, shipping_address_snapshot)
    VALUES (p_user_id, p_total_price, p_shipping_address_snapshot)
    RETURNING id INTO new_order_id;

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

-- 4. Update get_user_orders_with_items to include image_url
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
                    'voucher_recipient_name', oi.voucher_recipient_name
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) AS order_items
    FROM ecommerce.orders o
    LEFT JOIN ecommerce.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = auth.uid()
    GROUP BY o.id
    ORDER BY o.created_at DESC;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_orders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_from_webhook TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_orders_with_items TO authenticated;
