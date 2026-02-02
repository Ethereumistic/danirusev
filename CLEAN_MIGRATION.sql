-- Clean up old checkout_sessions from public schema (if exists)
DROP TABLE IF EXISTS public.checkout_sessions CASCADE;
DROP FUNCTION IF EXISTS public.delete_expired_checkout_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions_trigger() CASCADE;

-- Clean up from ecommerce schema (if exists)
DROP TABLE IF EXISTS ecommerce.checkout_sessions CASCADE;
DROP FUNCTION IF EXISTS ecommerce.delete_expired_checkout_sessions() CASCADE;
DROP FUNCTION IF EXISTS ecommerce.cleanup_expired_sessions_trigger() CASCADE;
DROP FUNCTION IF EXISTS create_checkout_session(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, DECIMAL, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_checkout_session(TEXT) CASCADE;

-- Now create everything fresh in ecommerce schema
CREATE TABLE ecommerce.checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Customer information
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'България',
  
  -- Order data
  cart_items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Indexes
  CONSTRAINT checkout_sessions_order_id_key UNIQUE (order_id)
);

-- Create index on order_id for fast lookups
CREATE INDEX idx_checkout_sessions_order_id 
ON ecommerce.checkout_sessions(order_id);

-- Create index on user_id
CREATE INDEX idx_checkout_sessions_user_id 
ON ecommerce.checkout_sessions(user_id);

-- Create index on expires_at for cleanup
CREATE INDEX idx_checkout_sessions_expires_at 
ON ecommerce.checkout_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE ecommerce.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own sessions
CREATE POLICY "Users can read own sessions"
ON ecommerce.checkout_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Service role can do everything
CREATE POLICY "Service role full access"
ON ecommerce.checkout_sessions FOR ALL
USING (auth.role() = 'service_role');

-- Function to automatically delete expired sessions
CREATE FUNCTION ecommerce.delete_expired_checkout_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ecommerce.checkout_sessions
  WHERE expires_at < NOW();
END;
$$;

-- Create a trigger to delete on access (simpler approach)
CREATE FUNCTION ecommerce.cleanup_expired_sessions_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM ecommerce.checkout_sessions WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_expired_sessions
BEFORE INSERT ON ecommerce.checkout_sessions
EXECUTE FUNCTION ecommerce.cleanup_expired_sessions_trigger();

-- RPC function to create checkout sessions (needed because ecommerce schema not exposed via PostgREST)
CREATE FUNCTION create_checkout_session(
    p_order_id TEXT,
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_phone_number TEXT,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT 'България',
    p_cart_items JSONB DEFAULT '[]'::jsonb,
    p_total_amount DECIMAL DEFAULT 0,
    p_currency TEXT DEFAULT 'EUR'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- RPC function to get checkout session data (for webhook)
CREATE FUNCTION get_checkout_session(p_order_id TEXT)
RETURNS TABLE (
    order_id TEXT,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    cart_items JSONB,
    total_amount DECIMAL,
    currency TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.order_id, cs.user_id, cs.email, cs.full_name, cs.phone_number,
        cs.address, cs.city, cs.postal_code, cs.country,
        cs.cart_items, cs.total_amount, cs.currency, cs.created_at
    FROM ecommerce.checkout_sessions cs
    WHERE cs.order_id = p_order_id;
END;
$$;

COMMENT ON TABLE ecommerce.checkout_sessions IS 'Temporary storage for checkout data before myPOS payment completion';
COMMENT ON COLUMN ecommerce.checkout_sessions.order_id IS 'Unique order ID generated for this checkout session';
COMMENT ON COLUMN ecommerce.checkout_sessions.expires_at IS 'Session expires 24 hours after creation';
COMMENT ON COLUMN ecommerce.checkout_sessions.cart_items IS 'Validated cart items with prices from database';
