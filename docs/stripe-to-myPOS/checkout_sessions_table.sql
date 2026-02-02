-- Create checkout_sessions table for storing temporary checkout data
-- This replaces the need for Redis or external caching

CREATE TABLE IF NOT EXISTS checkout_sessions (
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
  country TEXT DEFAULT 'BG',
  
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
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_order_id 
ON checkout_sessions(order_id);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id 
ON checkout_sessions(user_id);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at 
ON checkout_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own sessions
CREATE POLICY "Users can read own sessions"
ON checkout_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Service role can do everything
CREATE POLICY "Service role full access"
ON checkout_sessions FOR ALL
USING (auth.role() = 'service_role');

-- Function to automatically delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_checkout_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM checkout_sessions
  WHERE expires_at < NOW();
END;
$$;

-- Create a scheduled job to clean up expired sessions (if using pg_cron)
-- Run this every hour:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 * * * *', 'SELECT delete_expired_checkout_sessions()');

-- Or create a trigger to delete on access (simpler approach)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM checkout_sessions WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_expired_sessions
BEFORE INSERT ON checkout_sessions
EXECUTE FUNCTION cleanup_expired_sessions_trigger();

COMMENT ON TABLE checkout_sessions IS 'Temporary storage for checkout data before myPOS payment completion';
COMMENT ON COLUMN checkout_sessions.order_id IS 'Unique order ID generated for this checkout session';
COMMENT ON COLUMN checkout_sessions.expires_at IS 'Session expires 24 hours after creation';
COMMENT ON COLUMN checkout_sessions.cart_items IS 'Validated cart items with prices from database';