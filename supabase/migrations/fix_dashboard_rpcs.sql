-- Migration: Fix RPC functions for Order Dashboard after column rename
-- This updates get_all_orders_with_details and get_user_orders_with_items

-- 1. Fix get_all_orders_with_details (Admin Dashboard)
DROP FUNCTION IF EXISTS get_all_orders_with_details();
CREATE OR REPLACE FUNCTION get_all_orders_with_details()
RETURNS TABLE (
    id BIGINT,
    "orderId" TEXT,
    "userId" UUID,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "customerCity" TEXT,
    "customerPostalCode" TEXT,
    "customerCountry" TEXT,
    "productTitles" TEXT,
    "total" NUMERIC,
    "status" TEXT,
    "createdAt" TIMESTAMPTZ,
    "orderItems" JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        COALESCE(o.order_id_ref, o.id::text) as "orderId",
        o.user_id as "userId",
        (o.shipping_address_snapshot->>'email')::TEXT as "customerEmail",
        (o.shipping_address_snapshot->>'fullName')::TEXT as "customerName",
        (o.shipping_address_snapshot->>'phoneNumber')::TEXT as "customerPhone",
        (o.shipping_address_snapshot->>'address')::TEXT as "customerAddress",
        (o.shipping_address_snapshot->>'city')::TEXT as "customerCity",
        (o.shipping_address_snapshot->>'postalCode')::TEXT as "customerPostalCode",
        (o.shipping_address_snapshot->>'country')::TEXT as "customerCountry",
        string_agg(oi.title, ', ') as "productTitles",
        o.total_price as "total",
        o.status as "status",
        o.created_at as "createdAt",
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
                'voucher_id', (SELECT v.id FROM ecommerce.vouchers v WHERE v.order_item_id = oi.id LIMIT 1)
            )
        ) as "orderItems"
    FROM 
        ecommerce.orders o
    LEFT JOIN 
        ecommerce.order_items oi ON o.id = oi.order_id
    GROUP BY 
        o.id
    ORDER BY 
        o.created_at DESC;
END;
$$;

-- 2. Fix get_user_orders_with_items (Customer Dashboard)
DROP FUNCTION IF EXISTS get_user_orders_with_items();
CREATE OR REPLACE FUNCTION get_user_orders_with_items()
RETURNS TABLE (
    id BIGINT,
    order_id_ref TEXT, -- Added this
    created_at TIMESTAMPTZ,
    total_price NUMERIC,
    status TEXT,
    shipping_address_snapshot JSONB,
    payment_transaction_id TEXT, -- Updated from stripe_payment_intent_id
    order_items JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_id_ref,
        o.created_at,
        o.total_price,
        o.status,
        o.shipping_address_snapshot,
        o.payment_transaction_id,
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
                'voucher_id', (SELECT v.id FROM ecommerce.vouchers v WHERE v.order_item_id = oi.id LIMIT 1)
            )
        ) as order_items
    FROM 
        ecommerce.orders o
    LEFT JOIN 
        ecommerce.order_items oi ON o.id = oi.order_id
    WHERE 
        o.user_id = auth.uid()
    GROUP BY 
        o.id
    ORDER BY 
        o.created_at DESC;
END;
$$;
