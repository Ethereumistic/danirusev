-- 1. Make user_id nullable on Orders
ALTER TABLE ecommerce.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add an explicit customer_email column to Orders
ALTER TABLE ecommerce.orders ADD COLUMN IF NOT EXISTS customer_email text NULL;

-- 3. Make user_id nullable on Vouchers
ALTER TABLE ecommerce.vouchers ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add an explicit customer_email column to Vouchers
ALTER TABLE ecommerce.vouchers ADD COLUMN IF NOT EXISTS customer_email text NULL;
