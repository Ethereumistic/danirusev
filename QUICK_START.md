# myPOS Migration - Quick Start Guide

## 🎯 Current Status
✅ **Migration Complete** - All code changes implemented on branch `migration/stripe-to-mypos`

---

## 🚀 Next Steps to Go Live

### Step 1: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# myPOS Configuration
MYPOS_SID=000000000000010                    # Use test SID for now
MYPOS_WALLET_NUMBER=61938166610              # Use test wallet for now
MYPOS_KEY_INDEX=1

# Generate RSA keys OR use test keys
MYPOS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(paste your full private key here)
-----END RSA PRIVATE KEY-----"

MYPOS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
(paste myPOS public key here)
-----END PUBLIC KEY-----"

# Client-side env vars (needed for frontend)
NEXT_PUBLIC_MYPOS_IS_SANDBOX=true
NEXT_PUBLIC_MYPOS_SID=000000000000010
NEXT_PUBLIC_MYPOS_WALLET_NUMBER=61938166610
```

**How to get production keys:**
1. Login to https://merchant.mypos.com/
2. Navigate to Settings → API Credentials
3. Generate new RSA key pair or download existing ones
4. Copy SID and Wallet Number from your account info

---

### Step 2: Run Database Migration

Execute the SQL migration to create the `checkout_sessions` table:

```bash
# Option 1: Using Supabase CLI (if installed)
supabase db reset

# Option 2: Manual - Open Supabase Dashboard
# Go to SQL Editor → New Query
# Copy & paste contents of: supabase/migrations/create_checkout_sessions_table.sql
# Click "Run"
```

---

### Step 3: Test Locally

```bash
# Start development server
pnpm dev
```

Navigate to `/checkout` and test with:
- **Test Card**: `4006092001004`
- **CVV**: `111`
- **3D Secure Password**: `111111`
- **Expiry**: Any future date

---

### Step 4: Deploy to Production

```bash
# Ensure all changes are committed
git status

# Merge migration branch to main
git checkout main
git merge migration/stripe-to-mypos

# Push to production
git push origin main
```

---

### Step 5: Configure myPOS Webhook

After deployment, configure webhook in myPOS dashboard:

1. Login to https://merchant.mypos.com/
2. Go to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/mypos`
4. **Important**: URL must be HTTPS (SSL)
5. Save and test

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Checkout page loads without errors
- [ ] myPOS SDK loads successfully
- [ ] Personal information form works
- [ ] "Proceed to payment" creates session
- [ ] myPOS payment form appears
- [ ] Test payment completes successfully
- [ ] Order appears in database
- [ ] User profile updates correctly

### Production Testing
- [ ] Update environment variables to production
- [ ] Configure production webhook URL
- [ ] Test with real payment card
- [ ] Verify webhook receives notifications
- [ ] Check order creation
- [ ] Test email notifications (if any)

---

## 🔍 Debugging Tips

### If SDK doesn't load:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_MYPOS_SID` is set
3. Check network tab for SDK CDN request

### If payment fails:
1. Check myPOS dashboard for transaction logs
2. Review webhook logs in your API
3. Verify signature validation in webhook handler
4. Check `checkout_sessions` table for stored data

### Common Issues:
- **"Payment system not ready"**: SDK not loaded → Check console
- **"Failed to create session"**: Check API logs, database connection
- **"Invalid signature"**: Verify public key in env vars
- **Transaction marked as failed**: Webhook not returning "OK"

---

## 📊 Monitoring

### Database Queries

```sql
-- Check recent checkout sessions
SELECT * FROM checkout_sessions ORDER BY created_at DESC LIMIT 10;

-- Check recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Cleanup expired sessions manually
SELECT delete_expired_checkout_sessions();
```

### API Logs

Monitor these endpoints:
- `/api/checkout/create-session` - Session creation
- `/api/webhooks/mypos` - Payment notifications

---

## 🚨 Rollback Plan

If something goes wrong:

```bash
# Switch back to main branch (Stripe still working there)
git checkout main

# If changes were merged, revert the merge
git revert HEAD

# Force push if needed (careful!)
git push origin main --force
```

All Stripe code remains intact on the `main` branch!

---

## 📞 Support

- myPOS Documentation: https://developers.mypos.com/
- myPOS Support: support@mypos.com
- Migration Documentation: See`docs/stripe-to-myPOS/` folder

---

## ✅ You're Ready!

Once environment variables are configured and database migration is run, you can start testing immediately with:

```bash
pnpm dev
```

Navigate to `/checkout` and enjoy your new myPOS integration! 🎉

---

**Created**: 2026-02-02  
**Branch**: `migration/stripe-to-mypos`  
**Status**: Ready for Testing
