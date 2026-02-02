## Stripe to myPOS Migration - Implementation Status

### Migration Branch: `migration/stripe-to-mypos`

---

## ✅ Completed Tasks

### 1. **Core Infrastructure**
- [x] Installed myPOS SDK package (`mypos-embedded-checkout`)
- [x] Created `lib/mypos.ts` with core configuration and utilities
- [x] Added RSA signature generation and verification
- [x] Created helper functions for order ID generation and cart formatting

### 2. **API Routes**
- [x] Created `/api/checkout/create-session/route.ts`
  - Validates cart items against database
  - Stores checkout data temporarily
  - Generates unique order IDs
  - Returns payment configuration
  
- [x] Created `/api/webhooks/mypos/route.ts`
  - Handles myPOS payment notifications
  - Verifies signatures using RSA
  - Creates orders in database
  - Updates user profiles
  - **CRITICAL**: Returns "OK" response to myPOS

### 3. **Database**
- [x] Created SQL migration for `checkout_sessions` table
  - Temporary storage for checkout data
  - 24-hour expiry mechanism
  - Automatic cleanup triggers
  - RLS policies for security

### 4. **Frontend**
- [x] Updated `checkout-form.tsx`
  - Removed Stripe Elements and dependencies
  - Added myPOS SDK loading logic
  - Integrated myPOS Embedded Checkout
  - Updated payment flow and UI

### 5. **Configuration**
- [x] Created `.env.mypos.example` with environment variable template
- [x] Updated `package.json`
  - Removed `@stripe/react-stripe-js`
  - Removed `@stripe/stripe-js`
  - Removed `stripe` server package
  - Added `mypos-embedded-checkout`

---

## 🔄 Next Steps (Before Testing)

### 1. **Environment Variables**
Add to `.env.local`:
```bash
MYPOS_SID=000000000000010                    # Test: 000000000000010
MYPOS_WALLET_NUMBER=61938166610              # Test: 61938166610
MYPOS_KEY_INDEX=1
MYPOS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
MYPOS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
NEXT_PUBLIC_MYPOS_IS_SANDBOX=true
NEXT_PUBLIC_MYPOS_SID=000000000000010        # For client-side
NEXT_PUBLIC_MYPOS_WALLET_NUMBER=61938166610  # For client-side
```

### 2. **Database Migration**
```bash
# Run the checkout_sessions table migration
# Using Supabase CLI or dashboard SQL editor
supabase/migrations/create_checkout_sessions_table.sql
```

### 3. **Remove Old Stripe Files** (Optional but recommended)
- `lib/stripe.ts` - No longer needed
- `lib/checkout.ts` - Functions replaced
- `app/api/create-payment-intent/route.ts` - Replaced by create-session
- `app/api/webhooks/stripe/route.ts` - Replaced by mypos webhook

---

## 🔒 Security Enhancements (from optimise.md)

### Implemented:
- ✅ Server-side session creation with validation
- ✅ RSA signature verification on webhooks
- ✅ Amount validation server-side
- ✅ Temporary data storage with auto-cleanup

### Recommended (Future):
- [ ] Rename database column `stripe_payment_intent_id` to `payment_reference`
- [ ] Add payment provider column to orders table
- [ ] Implement database-level data encryption for sensitive fields

---

## 🧪 Testing Checklist

### Pre-deployment Testing
- [ ] Test with myPOS sandbox credentials
- [ ] Test card: `4006092001004`, CVV: `111`, 3D: `111111`
- [ ] Verify checkout session creation
- [ ] Verify myPOS payment form loads
- [ ] Test successful payment flow
- [ ] Test failed payment handling
- [ ] Test webhook signature verification
- [ ] Verify order creation in database
- [ ] Test with physical products (address required)
- [ ] Test with digital products (no address)
- [ ] Test session expiry (24 hours)

### Post-deployment Testing
- [ ] Configure webhook URL in myPOS dashboard
- [ ] Test with real credentials in production
- [ ] Monitor webhook logs
- [ ] Verify production payment flow
- [ ] Test with various card types

---

## 🚨 Critical Notes

1. **Webhook Response**: The myPOS webhook handler MUST return "OK" (200) or transaction fails
2. **SSL Required**: Webhook URL must be HTTPS in production
3. **Idempotency**: Webhook uses `TransactionID` to prevent duplicate orders
4. **Session Cleanup**: Automatic cleanup via trigger, manual: `SELECT delete_expired_checkout_sessions()`
5. **SDK Loading**: myPOS SDK is loaded from CDN (620px min height required)

---

## 📝 Key Differences from Stripe

| Feature | Stripe | myPOS |
|---------|--------|-------|
| **Payment Init** | `createPaymentIntent` → clientSecret | `create-session` → orderID |
| **Frontend** | Stripe Elements wrapper | Direct SDK integration |
| **Webhook Format** | JSON with signature header | FormData with signature field |
| **Webhook Response** | JSON `{received: true}` | Plain text "OK" |
| **Session Storage** | Managed by Stripe | Manual (`checkout_sessions` table) |
| **Testing** | Test mode via API key | Sandbox flag + test SID |

---

## 🔄 Rollback Plan

If issues arise:
```bash
# Revert to main branch (Stripe)
git checkout main

# Or revert specific commits
git revert <commit-hash>

# Delete migration branch if needed
git branch -D migration/stripe-to-mypos
```

All Stripe code remains on `main` branch, making rollback instant.

---

## 📊 Migration Impact

### Files Changed:
- ✅ `app/(frontend)/checkout/checkout-form.tsx` - Major refactor
- ✅ `package.json` - Dependencies updated
- ✅ `lib/mypos.ts` - New file
- ✅ `app/api/checkout/create-session/route.ts` - New file
- ✅ `app/api/webhooks/mypos/route.ts` - New file
- ✅ `supabase/migrations/create_checkout_sessions_table.sql` - New file
- ✅ `.env.mypos.example` - New file

### Files to Remove (Post-merge):
- `lib/stripe.ts`
- `lib/checkout.ts`
- `app/api/create-payment-intent/route.ts`
- `app/api/webhooks/stripe/route.ts`

---

## 🎯 Ready for Testing?

**PreRequisites:**
1. ✅ All code changes committed on `migration/stripe-to-mypos` branch
2. ⏳ Environment variables configured
3. ⏳ Database migration applied
4. ⏳ Dev server running: `pnpm dev`

**Once ready**, proceed with the testing checklist above.

---

**Last Updated**: 2026-02-02
**Migration Status**: Implementation Complete - Testing Pending
