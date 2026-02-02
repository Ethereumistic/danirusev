-- Run this in Supabase SQL Editor to check the last order

SELECT 
    id,
    created_at,
    total_price,
    status,
    shipping_address_snapshot->>'fullName' as customer_name,
    shipping_address_snapshot->>'email' as email
FROM orders
ORDER BY created_at DESC
LIMIT 1;

-- Expected result:
-- total_price should be: 234.00 (not 23400.00)
