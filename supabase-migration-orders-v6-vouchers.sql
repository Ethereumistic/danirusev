-- ============================================
-- SUPABASE MIGRATION: Include voucher_id in order items RPC
-- ============================================

-- 1. Update get_user_orders_with_items to join with vouchers and include voucher_id
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

-- 2. Update get_all_orders_with_details to include voucher_id (for admin visibility)
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
