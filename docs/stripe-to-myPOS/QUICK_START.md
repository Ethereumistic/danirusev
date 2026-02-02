# myPOS Migration - Quick Start Guide

## 🚀 30-Minute Implementation Checklist

### Phase 1: Setup (10 minutes)

- [ ] **Install Package**
  ```bash
  pnpm install mypos-embedded-checkout
  ```

- [ ] **Add Environment Variables**
  - Copy `.env.mypos.example` to `.env.local`
  - Get your credentials from myPOS dashboard
  - For testing, use the test credentials provided

- [ ] **Create Checkout Sessions Table**
  - Run `checkout_sessions_table.sql` in your Supabase SQL editor
  - This creates temporary storage for checkout data

### Phase 2: Core Files (10 minutes)

- [ ] **Add myPOS Configuration**
  - Create `lib/mypos.ts` (from provided file)
  - This handles signatures and utilities

- [ ] **Create Webhook Handler**
  - Add `app/api/webhooks/mypos/route.ts`
  - This receives payment confirmations

- [ ] **Create Session API**
  - Add `app/api/checkout/create-session/route.ts`
  - This stores checkout data before payment

### Phase 3: Frontend (10 minutes)

- [ ] **Update Checkout Form**
  - Replace your `checkout-form.tsx` with the provided version
  - Or merge the myPOS integration code into your existing form

- [ ] **Update Order Confirmation**
  - Modify to use `order_id` query param instead of `payment_intent`
  - Remove Stripe-specific code

### Phase 4: Testing

- [ ] **Test with Test Credentials**
  ```
  Card: 4006092001004
  CVV: 111
  Expiry: Any future date
  3D Secure: 111111
  ```

- [ ] **Verify Webhook**
  - Use ngrok for local testing: `ngrok http 3000`
  - Set webhook URL in myPOS dashboard
  - Complete a test payment
  - Check logs to confirm webhook received

### Phase 5: Cleanup

- [ ] **Remove Stripe Dependencies**
  ```bash
  npm uninstall stripe @stripe/stripe-js @stripe/react-stripe-js
  ```

- [ ] **Delete Stripe Files**
  - `lib/stripe.ts`
  - `app/api/create-payment-intent/route.ts`
  - `app/api/webhooks/stripe/route.ts`

- [ ] **Update Database (Optional)**
  ```sql
  -- Rename column to be provider-agnostic
  ALTER TABLE orders 
  RENAME COLUMN stripe_payment_intent_id 
  TO payment_provider_reference_id;
  ```

---

## 📁 File Mapping

| Old Stripe File | New myPOS File | Action |
|----------------|----------------|--------|
| `lib/stripe.ts` | `lib/mypos.ts` | Replace |
| `app/api/create-payment-intent/route.ts` | `app/api/checkout/create-session/route.ts` | Replace |
| `app/api/webhooks/stripe/route.ts` | `app/api/webhooks/mypos/route.ts` | Replace |
| `checkout-form.tsx` (Stripe Elements) | `checkout-form.tsx` (myPOS SDK) | Merge changes |
| N/A | `checkout_sessions_table.sql` | Run in Supabase |

---

## 🔑 Key Differences from Stripe

### 1. No "Create Payment Intent" Step
**Stripe:** Create PaymentIntent → Get clientSecret → Show Elements
**myPOS:** Show embedded form directly → Payment happens → Webhook notifies

### 2. Data Storage Required
Since there's no payment intent API, you must store checkout data BEFORE showing the payment form. That's what `create-session` API does.

### 3. Webhook Response
myPOS requires **EXACTLY** "OK" (status 200) response. Anything else = failed transaction.

### 4. Signature Verification
myPOS uses RSA signatures. You need both:
- Your private key (to sign outgoing requests - not used in embedded SDK)
- myPOS public key (to verify incoming webhooks)

---

## 🧪 Testing Flow

1. **Start your dev server:** `npm run dev`

2. **Use ngrok for webhooks:** 
   ```bash
   ngrok http 3000
   ```

3. **Configure webhook in myPOS:**
   - Go to myPOS merchant dashboard
   - Add webhook URL: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/mypos`

4. **Make test purchase:**
   - Go to `/checkout`
   - Fill in form
   - Use test card: `4006092001004`
   - CVV: `111`
   - 3D Secure: `111111`

5. **Check logs:**
   ```bash
   # Terminal 1: Next.js logs
   # Terminal 2: ngrok logs (shows webhook calls)
   ```

6. **Verify order created in Supabase**

---

## 🚨 Common Issues & Solutions

### Issue: "Payment system not ready"
**Solution:** myPOS SDK not loaded. Check console for script loading errors.

### Issue: Webhook not received
**Solution:** 
- Ensure webhook URL is HTTPS (use ngrok for local dev)
- Check myPOS dashboard webhook configuration
- Verify webhook URL has no port number

### Issue: "Invalid signature"
**Solution:**
- Double-check myPOS public key in `.env`
- Ensure no extra spaces/newlines in key
- Verify key includes BEGIN/END lines

### Issue: Order not created
**Solution:**
- Check webhook logs in `/api/webhooks/mypos`
- Verify `checkout_sessions` table exists
- Check if checkout session was created successfully

---

## 📊 Feature Parity Check

| Feature | Stripe | myPOS | Status |
|---------|--------|-------|--------|
| Embedded payment | ✅ | ✅ | ✅ Same |
| No redirect | ✅ | ✅ | ✅ Same |
| Webhook fulfillment | ✅ | ✅ | ✅ Same |
| 3D Secure | ✅ | ✅ | ✅ Same |
| Card payments | ✅ | ✅ | ✅ Same |
| Mobile optimized | ✅ | ✅ | ✅ Same |
| Payment intents API | ✅ | ❌ | ⚠️ Different pattern |
| Subscriptions | ✅ | ✅ | ℹ️ Available but not used |
| Refunds | ✅ | ✅ | ✅ Via API |

---

## 🎯 Go-Live Checklist

Before deploying to production:

- [ ] Replace test credentials with production credentials
- [ ] Set `NEXT_PUBLIC_MYPOS_IS_SANDBOX=false`
- [ ] Update webhook URL in myPOS dashboard (production URL)
- [ ] Test complete purchase flow with real card (small amount)
- [ ] Verify order creation in production database
- [ ] Update terms & conditions (mention myPOS)
- [ ] Update privacy policy (payment processor change)
- [ ] Test refund process
- [ ] Monitor webhook logs for first 24 hours

---

## 📞 Support & Resources

- **myPOS Documentation:** https://developers-old.mypos.com/en/doc/online_payments/v1_4
- **Embedded SDK Docs:** https://developers-old.mypos.com/en/doc/online_payments/v1_4/374-embedded-sdk
- **Test Data:** https://developers-old.mypos.com/en/doc/online_payments/v1_4/226-test-data

---

## ⏱️ Estimated Timeline

- **Initial Setup:** 30 minutes
- **Testing & Debugging:** 1-2 hours
- **Production Deployment:** 30 minutes
- **Total:** 2-3 hours

Good luck! 🚀
