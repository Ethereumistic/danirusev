-- Migration: Rename stripe_payment_intent_id to payment_transaction_id
-- This makes the schema provider-agnostic for myPOS and others.

-- 1. Rename the column
ALTER TABLE ecommerce.orders 
RENAME COLUMN stripe_payment_intent_id TO payment_transaction_id;

-- 2. Rename the unique constraint
ALTER TABLE ecommerce.orders 
RENAME CONSTRAINT orders_stripe_payment_intent_id_key TO orders_payment_transaction_id_key;

-- 3. Recreate the index with the new name
DROP INDEX IF EXISTS ecommerce.idx_orders_stripe_payment_intent_id;
CREATE INDEX IF NOT EXISTS idx_orders_payment_transaction_id 
ON ecommerce.orders(payment_transaction_id);

-- 4. Drop the old function first (required because we are changing parameter names)
DROP FUNCTION IF EXISTS create_order_from_webhook(uuid,numeric,jsonb,jsonb,text);

-- 5. Update the create_order_from_webhook RPC function
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id uuid,
  p_total_price numeric,
  p_shipping_address_snapshot jsonb,
  p_cart_items jsonb,
  p_payment_transaction_id text -- Renamed from p_stripe_payment_intent_id
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
    status
  ) VALUES (
    p_user_id,
    p_total_price,
    p_shipping_address_snapshot,
    p_payment_transaction_id,
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

COMMENT ON COLUMN ecommerce.orders.payment_transaction_id IS 'Unique reference ID from the payment provider (myPOS, Stripe, etc.)';
