# Guest Checkout Implementation Plan

**Context for AI Agent:**
The user has already authenticated the Supabase CLI (`npx supabase login` and `npx supabase link`). You have terminal access. Your goal is to enable Guest Checkout (non-authenticated users) without breaking the existing flow for authenticated users.

Follow these steps exactly in order:

## Step 1: Database Schema Modifications (SQL Migration)
Create a new migration file via the terminal using:
`npx supabase migration new guest_checkout_implementation`

Write the following SQL into the newly created migration file, and then deploy it using `npx supabase db push`.

```sql
-- 1. Make user_id nullable on Orders
ALTER TABLE ecommerce.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add an explicit customer_email column to Orders
ALTER TABLE ecommerce.orders ADD COLUMN IF NOT EXISTS customer_email text NULL;

-- 3. Make user_id nullable on Vouchers
ALTER TABLE ecommerce.vouchers ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add an explicit customer_email column to Vouchers
ALTER TABLE ecommerce.vouchers ADD COLUMN IF NOT EXISTS customer_email text NULL;
```

## Step 2: Update Checkout UI (`app/checkout/page.tsx`)
Remove the strict authentication blockade so guests can access the checkout form.

1. Locate and **remove** the strict user check and redirect:
   `if (!user) { ... redirect(...) }`
2. Update the `get_user_profile` RPC call to be conditional. If there is no user, default the profile to `null`.
   *Example logic:*
   ```typescript
   let profile = null;
   if (user) {
     const { data, error } = await supabase.rpc('get_user_profile', {}).returns<Profile>().single();
     if (!error) profile = data;
   }
   ```
3. Ensure `<CheckoutForm profile={profile} />` receives this (it already handles null gracefully).

## Step 3: Update Checkout Session API (`app/api/checkout/create-session/route.ts`)
Allow guest sessions to be stored in the database.

1. **Remove** the `if (!user)` 401 Unauthorized return block.
2. Extract the user ID safely: `const userId = user?.id || null;`
3. In the `create_checkout_session` RPC call, change `p_user_id: user.id` to `p_user_id: userId`.

## Step 4: Update Manual Order API (`app/api/create-manual-order/route.ts` or `cmo-route.ts`)
Allow zero-euro manual checkouts to process for guests.

1. **Remove** the `if (!user)` 401 Unauthorized return block.
2. Extract the user ID safely: `const userId = user?.id || null;`
3. In the `create_order_from_webhook` RPC call, change `p_user_id: user.id` to `p_user_id: userId`.
4. **Critical:** Wrap the `update_profile_from_checkout` RPC call in an `if (userId)` block. Guests do not have an `ecommerce.profiles` record, so we must bypass profile updates for them.

## Step 5: Update Webhook API (`app/api/webhooks/mypos/route.ts`)
Ensure paid orders process successfully for guests.
*Note: This file is mostly ready! It already extracts `checkoutData.user_id` and wraps the profile update in `if (checkoutData.user_id)`. However, do a quick sanity check:*
1. Ensure the `create_order_from_webhook` RPC call is passing `p_user_id: checkoutData.user_id` (which will be `null` for guests). 

## Step 6: Update Voucher Download API (`app/api/vouchers/download/[id]/route.ts`)
Guests need to download their vouchers from the link sent to their email, but currently, the route strictly requires authentication.

1. **Remove** the strict `if (!user)` 401 block at the top.
2. Modify the security check: If the voucher has a `user_id`, enforce the strict `voucher.user_id !== user?.id` check. If the voucher's `user_id` is `null` (meaning it's a guest voucher), bypass the ownership check since the unguessable UUID acts as the auth token.
   *Example logic:*
   ```typescript
   if (voucher.user_id !== null) {
       if (!user || voucher.user_id !== user.id) {
           return NextResponse.json({ error: 'ЗАБРАНЕНО...' }, { status: 403 });
       }
   }
   ```

## Step 7: Database RPC Updates (Verification & Alteration)
You must verify the following PostgreSQL functions in the Supabase database (via SQL editor or pulling the schema) to ensure their parameters accept `null` for `p_user_id` and map the emails correctly.

Create a second migration file (e.g., `npx supabase migration new update_rpcs_for_guests`) and write the `CREATE OR REPLACE FUNCTION` scripts for:
1. `ecommerce.create_checkout_session`: Ensure `p_user_id` is nullable.
2. `ecommerce.create_order_from_webhook`: Ensure `p_user_id` is nullable. Map `p_shipping_address_snapshot->>'email'` to the new `customer_email` column.
3. `ecommerce.create_voucher`: Ensure `p_user_id` is nullable.
Push this migration via `npx supabase db push`.

