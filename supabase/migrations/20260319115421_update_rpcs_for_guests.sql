-- Function: create_checkout_session
CREATE OR REPLACE FUNCTION public.create_checkout_session(p_order_id text, p_user_id uuid DEFAULT NULL::uuid, p_email text DEFAULT NULL::text, p_full_name text DEFAULT NULL::text, p_phone_number text DEFAULT NULL::text, p_address text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_postal_code text DEFAULT NULL::text, p_country text DEFAULT 'България'::text, p_cart_items jsonb DEFAULT '[]'::jsonb, p_total_amount numeric DEFAULT 0, p_currency text DEFAULT 'EUR'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO ecommerce.checkout_sessions (
        order_id, user_id, email, full_name, phone_number,
        address, city, postal_code, country,
        cart_items, total_amount, currency, expires_at
    ) VALUES (
        p_order_id, p_user_id, p_email, p_full_name, p_phone_number,
        p_address, p_city, p_postal_code, p_country,
        p_cart_items, p_total_amount, p_currency,
        NOW() + INTERVAL '24 hours'
    );
END;
$function$
;

-- Function: create_order_from_webhook
CREATE OR REPLACE FUNCTION public.create_order_from_webhook(p_user_id uuid, p_total_price numeric, p_shipping_address_snapshot jsonb, p_cart_items jsonb, p_payment_transaction_id text, p_order_id_ref text DEFAULT NULL::text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order_id bigint;
  v_item jsonb;
BEGIN
  -- Idempotency check: Check if order already exists with this provider transaction ID
  SELECT id INTO v_order_id
  FROM ecommerce.orders
  WHERE payment_transaction_id = p_payment_transaction_id;

  IF v_order_id IS NOT NULL THEN
    RETURN v_order_id;
  END IF;

  -- Create the main order
  INSERT INTO ecommerce.orders (
    user_id,
    customer_email,
    total_price,
    shipping_address_snapshot,
    payment_transaction_id,
    order_id_ref,
    status
  ) VALUES (
    p_user_id,
    p_shipping_address_snapshot->>'email',
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
$function$
;

-- Function: create_voucher
CREATE OR REPLACE FUNCTION public.create_voucher(p_order_item_id integer, p_user_id uuid DEFAULT NULL::uuid, p_product_slug text DEFAULT NULL::text, p_selected_date date DEFAULT NULL::date, p_addons jsonb DEFAULT NULL::jsonb, p_voucher_recipient_name text DEFAULT NULL::text, p_location text DEFAULT NULL::text, p_voucher_type text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_voucher_id UUID;
    v_expiry_date DATE;
    v_final_addons JSONB;
    v_purchase_date TIMESTAMPTZ;
    v_customer_email text;
BEGIN
    -- 1. Fetch the order creation date (Purchase Date) and customer email by joining through order_items
    SELECT o.created_at, o.customer_email INTO v_purchase_date, v_customer_email
    FROM ecommerce.orders o
    JOIN ecommerce.order_items oi ON o.id = oi.order_id
    WHERE oi.id = p_order_item_id;

    -- 2. Calculate expiry date based on Purchase Date + 1 year
    -- If order is not found (safety fallback), use p_selected_date + 1 year
    IF v_purchase_date IS NOT NULL THEN
        v_expiry_date := (v_purchase_date::DATE + INTERVAL '1 year');
    ELSE
        v_expiry_date := p_selected_date + INTERVAL '1 year';
    END IF;
    
    -- 3. Addon logic (p_voucher_type handling)
    v_final_addons := p_addons;
    IF p_voucher_type IS NOT NULL THEN
        IF v_final_addons IS NULL OR jsonb_typeof(v_final_addons) != 'array' THEN
            v_final_addons := jsonb_build_array(p_voucher_type);
        ELSE
            IF NOT (v_final_addons @> jsonb_build_array(p_voucher_type)) THEN
                v_final_addons := v_final_addons || jsonb_build_array(p_voucher_type);
            END IF;
        END IF;
    END IF;
    
    -- 4. Check for existing voucher
    SELECT id INTO new_voucher_id 
    FROM ecommerce.vouchers 
    WHERE order_item_id = p_order_item_id;
    
    IF new_voucher_id IS NOT NULL THEN
        -- Update existing voucher with NEW expiry date and addons
        UPDATE ecommerce.vouchers
        SET selected_date = p_selected_date,
            expiry_date = v_expiry_date,
            addons = v_final_addons,
            voucher_recipient_name = p_voucher_recipient_name,
            location = p_location,
            customer_email = v_customer_email
        WHERE id = new_voucher_id;
        RETURN new_voucher_id;
    END IF;
    
    -- 5. Insert new voucher
    INSERT INTO ecommerce.vouchers (
        order_item_id, user_id, customer_email, product_slug, selected_date, expiry_date,
        addons, voucher_recipient_name, location, status
    )
    VALUES (
        p_order_item_id, p_user_id, v_customer_email, p_product_slug, p_selected_date, v_expiry_date,
        v_final_addons, p_voucher_recipient_name, p_location, 'active'
    )
    RETURNING id INTO new_voucher_id;
    
    RETURN new_voucher_id;
END;$function$
;
