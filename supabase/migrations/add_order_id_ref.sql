-- Migration: Add order_id_ref and fix create_order_from_webhook
-- This allows finding orders by the internal order_id (e.g. order_177...)

-- 1. Add the column to orders table
ALTER TABLE ecommerce.orders 
ADD COLUMN IF NOT EXISTS order_id_ref TEXT;

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id_ref ON ecommerce.orders(order_id_ref);

-- 3. Drop the function to update signature
DROP FUNCTION IF EXISTS create_order_from_webhook(uuid,numeric,jsonb,jsonb,text);

-- 4. Recreate the function with the new order_id_ref parameter
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id uuid,
  p_total_price numeric,
  p_shipping_address_snapshot jsonb,
  p_cart_items jsonb,
  p_payment_transaction_id text,
  p_order_id_ref text DEFAULT NULL -- New parameter
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id bigint;
  v_item jsonb;
BEGIN
  -- Idempotency check: Check if order already exists with this transaction ID
  SELECT id INTO v_order_id
  FROM ecommerce.orders
  WHERE payment_transaction_id = p_payment_transaction_id;

  IF v_order_id IS NOT NULL THEN
    RETURN v_order_id;
  END IF;

  -- Create the main order
  INSERT INTO ecommerce.orders (
    user_id,
    total_price,
    shipping_address_snapshot,
    payment_transaction_id,
    order_id_ref,
    status
  ) VALUES (
    p_user_id,
    p_total_price,
    p_shipping_address_snapshot,
    p_payment_transaction_id,
    p_order_id_ref,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- Create the individual order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
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
      image_url,
      location,
      addons,
      voucher_type,
      voucher_recipient_name,
      selected_date
    ) VALUES (
      v_order_id,
      v_item->>'product_id',
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric,
      v_item->>'title',
      v_item->>'variant',
      v_item->>'sku',
      v_item->>'item_type',
      v_item->>'image_url',
      v_item->>'location',
      v_item->'addons',
      v_item->>'voucher_type',
      v_item->>'voucher_recipient_name',
      CASE 
        WHEN v_item->>'selected_date' IS NOT NULL AND v_item->>'selected_date' <> '' 
        THEN (v_item->>'selected_date')::date 
        ELSE NULL 
      END
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;
