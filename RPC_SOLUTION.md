# RPC Functions Solution ✅

## The Problem

Supabase PostgREST only exposes certain schemas (`public`, `graphql_public`) by default. The `ecommerce` schema is not accessible via the REST API.

**Error**: `The schema must be one of the following: public, graphql_public`

---

## The Solution: RPC Functions

Create PostgreSQL functions that can be called via `.rpc()` to interact with the `ecommerce` schema.

---

## What Was Added

### 1. `create_checkout_session()` Function
Creates a new checkout session in `ecommerce.checkout_sessions`

**Usage** (in API):
```typescript
await supabaseAdmin.rpc('create_checkout_session', {
    p_order_id: orderID,
    p_user_id: user.id,
    p_email: personalInfo.email,
    // ... other parameters
});
```

### 2. `get_checkout_session()` Function  
Retrieves checkout session data by order_id

**Usage** (in webhook):
```typescript
const { data } = await supabaseAdmin
    .rpc('get_checkout_session', { p_order_id: OrderID });
const checkoutData = data[0];
```

---

## Files Modified

1. **Migration** (`supabase/migrations/create_checkout_sessions_table.sql`)
   - Added `create_checkout_session()` RPC function
   - Added `get_checkout_session()` RPC function

2. **Create Session API** (`app/api/checkout/create-session/route.ts`)
   - Changed from `.schema().from()` to `.rpc('create_checkout_session')`

3. **Webhook API** (`app/api/webhooks/mypos/route.ts`)
   - Changed from `.schema().from()` to `.rpc('get_checkout_session')`

---

## Apply the Migration

### Step 1: Open Supabase Dashboard
Go to: **SQL Editor**

### Step 2: Copy & Run Migration
1. Open `supabase/migrations/create_checkout_sessions_table.sql`
2. Copy the ENTIRE file contents  
3. Paste into SQL Editor
4. Click **Run**

### Step 3: Verify
Check that these functions exist:
- `create_checkout_session`
- `get_checkout_session`
- `ecommerce.delete_expired_checkout_sessions`
- `ecommerce.cleanup_expired_sessions_trigger`

---

## Test the Checkout

After running the migration:

1. **Refresh browser**
2. **Go to /checkout**
3. **Add an item**
4. **Proceed to payment**
5. **Should work!** ✅

---

## Why RPC Functions?

**Advantages**:
- ✅ Works with any schema
- ✅ Controlled via `SECURITY DEFINER`
- ✅ Can include business logic
- ✅ Better for complex operations

**Alternative** (not recommended for this case):
- Expose `ecommerce` schema in Supabase API settings
- Requires additional configuration
- Less secure (exposes entire schema)

---

**Status**: RPC functions created! Ready to apply migration 🚀
