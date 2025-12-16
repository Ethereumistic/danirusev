-- ============================================
-- SUPABASE MIGRATION: Update get_all_orders_with_details for Admin Dashboard
-- Run this in your Supabase SQL Editor
-- ============================================

-- First drop the existing function (required because we're changing the return type)
DROP FUNCTION IF EXISTS ecommerce.get_all_orders_with_details();

-- Update the get_all_orders_with_details function to return full order items
CREATE OR REPLACE FUNCTION ecommerce.get_all_orders_with_details()
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

-- ============================================
-- FIX: Update create_order_from_webhook to use correct snake_case field names
-- ============================================

CREATE OR REPLACE FUNCTION ecommerce.create_order_from_webhook(
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
    -- Create the order
    INSERT INTO ecommerce.orders (user_id, total_price, shipping_address_snapshot)
    VALUES (p_user_id, p_total_price, p_shipping_address_snapshot)
    RETURNING id INTO new_order_id;

    -- Insert order items from the JSONB array
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        INSERT INTO ecommerce.order_items (
            order_id, 
            product_id, 
            quantity, 
            price, 
            title,
            variant,
            sku,
            item_type,
            location,
            addons,
            voucher_type,
            voucher_recipient_name
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
            item->>'location',
            item->'addons',  -- Get as jsonb directly, not string
            item->>'voucher_type',
            item->>'voucher_recipient_name'
        );
    END LOOP;

    RETURN new_order_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ecommerce.get_all_orders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION ecommerce.create_order_from_webhook TO service_role;

