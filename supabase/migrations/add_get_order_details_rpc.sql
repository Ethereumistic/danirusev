-- Migration: Add secure order lookup RPC
-- This allows the frontend to find order details by ID, order_id_ref, or transaction_id
-- without requiring direct table access to the ecommerce schema from the API.

CREATE OR REPLACE FUNCTION public.get_order_details_by_id(p_order_id text, p_user_id uuid)
RETURNS TABLE (
    id bigint,
    total_price numeric,
    shipping_address_snapshot jsonb,
    payment_transaction_id text,
    order_id_ref text,
    user_id uuid,
    status text,
    items jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.total_price,
        o.shipping_address_snapshot,
        o.payment_transaction_id,
        o.order_id_ref,
        o.user_id,
        o.status,
        COALESCE(
            (SELECT jsonb_agg(item)
             FROM ecommerce.order_items item
             WHERE item.order_id = o.id),
            '[]'::jsonb
        ) as items
    FROM ecommerce.orders o
    WHERE o.user_id = p_user_id
    AND (
        (CASE WHEN p_order_id ~ '^[0-9]+$' THEN o.id = p_order_id::bigint ELSE FALSE END)
        OR o.order_id_ref = p_order_id
        OR o.payment_transaction_id = p_order_id
    )
    LIMIT 1;
END;
$$;
