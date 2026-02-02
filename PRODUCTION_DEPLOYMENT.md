# Production Deployment Checklist 🚀

## ✅ **What Works Without Changes**

1. **Code** - All your code is production-ready ✅
2. **Webhook handling** - Will automatically use your HTTPS domain ✅
3. **CSP headers** - Already configured for myPOS ✅
4. **Database queries** - RPC functions work in production ✅

---

## 🔧 **Environment Variables to Update**

### **File: `.env` (on your VPS)**

```bash
# Supabase (Keep the same)
NEXT_PUBLIC_SUPABASE_URL=https://effbymyawrpwszqfvgdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Keep the same)
DATABASE_URI=postgresql://postgres.effbymyawrpwszqfvgdz:...

# Store Info (Update URLs)
NEXT_PUBLIC_STORE_NAME="Dani Rusev 11"
NEXT_PUBLIC_STORE_EMAIL="noreply@shop.danirusev.com"
NEXT_PUBLIC_SITE_URL=https://danirusev.com  # ← CHANGE to your domain
NEXT_PUBLIC_SERVER_URL=https://danirusev.com  # ← CHANGE to your domain
NEXT_PUBLIC_BASE_URL=https://danirusev.com  # ← CHANGE to your domain

# S3/Supabase Storage (Keep the same)
S3_BUCKET=danirusev-bucket
S3_ACCESS_KEY_ID=71f45c1a6f67bcd71369f4a3d48722aa
S3_SECRET_ACCESS_KEY=3bf8a9f1e710179c6b5aff08a0369baef79509345e5dcd7beeb3060a66e37916
S3_REGION=eu-central-1
S3_ENDPOINT=https://effbymyawrpwszqfvgdz.supabase.co/storage/v1/s3

# myPOS PRODUCTION (CHANGE THESE!)
MYPOS_SID=YOUR_PRODUCTION_SID  # ← Get from myPOS dashboard
MYPOS_WALLET_NUMBER=YOUR_PRODUCTION_WALLET  # ← Get from myPOS dashboard
MYPOS_KEY_INDEX=1
MYPOS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
YOUR_PRODUCTION_PRIVATE_KEY  # ← Get from myPOS dashboard
-----END RSA PRIVATE KEY-----"
MYPOS_PUBLIC_KEY="-----BEGIN CERTIFICATE-----
YOUR_PRODUCTION_PUBLIC_KEY  # ← Get from myPOS dashboard
-----END CERTIFICATE-----"

# Client-side myPOS (CHANGE THESE!)
NEXT_PUBLIC_MYPOS_IS_SANDBOX=false  # ← CHANGE to false!
NEXT_PUBLIC_MYPOS_SID=YOUR_PRODUCTION_SID  # ← Same as above
NEXT_PUBLIC_MYPOS_WALLET_NUMBER=YOUR_PRODUCTION_WALLET  # ← Same as above

# Webhook URL (REMOVE THIS LINE!)
# NEXT_PUBLIC_WEBHOOK_URL=  # ← DELETE - not needed in production

# Validation (REMOVE THIS LINE!)
# SKIP_WEBHOOK_VALIDATION=true  # ← DELETE - must validate in production!

# Other services (Keep the same)
PAYLOAD_SECRET=12f615ef83b5da514f89536e42898c5ed48f32e2cac1ed72b7305dbb9b51abd6
RESEND_API_KEY=re_AMU5WjKW_Mv3JF4VLQNzLU8GGuFU9uka1
NEXT_PUBLIC_WEB3_FORMS_KEY=f382a6b8-0184-407f-ae58-5dc4cd829d9e
```

---

## 🎯 **Critical Changes Summary**

### 1. **myPOS Settings**

| Setting | Development | Production |
|---------|------------|------------|
| `NEXT_PUBLIC_MYPOS_IS_SANDBOX` | `true` | **`false`** ✅ |
| `MYPOS_SID` | `000000000000010` | **Your real SID** ✅ |
| `MYPOS_WALLET_NUMBER` | `61938166610` | **Your real wallet** ✅ |
| Private/Public Keys | Test keys | **Production keys** ✅ |

**Where to get production credentials:**
1. Log in to https://www.mypos.com/
2. Go to Developer Tools / API Settings
3. Copy your production SID, Wallet Number, and Keys

---

### 2. **Remove Development-Only Variables**

Delete these lines from production `.env`:
```bash
NEXT_PUBLIC_WEBHOOK_URL  # Not needed - will use your domain
SKIP_WEBHOOK_VALIDATION=true  # MUST validate in production!
```

---

### 3. **Update Site URLs**

Change to your production domain:
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 🗄️ **Database Migration**

You've already run the migration locally, so **you're good to go**! ✅

But if you need to verify, run this in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'ecommerce' 
    AND table_name = 'checkout_sessions'
);

-- Check if RPC functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('create_checkout_session', 'get_checkout_session');
```

---

## 🔐 **myPOS Dashboard Configuration**

Before going live, configure these in your myPOS merchant dashboard:

### **Webhook URL**
```
https://yourdomain.com/api/webhooks/mypos
```

### **Return URLs**
- **Success URL**: `https://yourdomain.com/order-confirmation?order_id={OrderID}`
- **Cancel URL**: `https://yourdomain.com/checkout`

---

## 🚀 **Deployment Steps**

### 1. **Prepare Production Environment**

```bash
# On your VPS
cd /path/to/your/app

# Create .env file with production values
nano .env

# Paste the updated environment variables
# Save and exit (Ctrl+X, Y, Enter)
```

---

### 2. **Build the Application**

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build
```

---

### 3. **Start Production Server**

```bash
# Using PM2 (recommended)
pm2 start "pnpm start" --name danirusev

# Or using a process manager of your choice
pnpm start
```

---

### 4. **Verify Everything Works**

#### ✅ **Test Checklist**:

1. **Site loads** → Visit https://yourdomain.com
2. **Add to cart** → Add an item
3. **Checkout form** → Fill in details
4. **Payment form** → Shows correct amount in EUR
5. **Complete test payment** → Use test card (if available)
6. **Webhook triggered** → Check logs
7. **Order created** → Check database
8. **Confirmation page** → Shows success message

---

## ⚠️ **Important Security Notes**

### **DO NOT do this:**
- ❌ Use `SKIP_WEBHOOK_VALIDATION=true` in production
- ❌ Use sandbox credentials in production
- ❌ Commit `.env` file to Git
- ❌ Share your production keys publicly

### **DO this:**
- ✅ Use real myPOS production credentials
- ✅ Enable webhook signature validation
- ✅ Use HTTPS everywhere
- ✅ Keep `.env` file secure (chmod 600)

---

## 🧪 **Test in Production (Safe Method)**

1. **Use myPOS test mode** (if they offer it)
2. **Make a small real transaction** (like 1 EUR) to verify
3. **Monitor logs** during first real payment
4. **Check database** to ensure correct amounts

---

## 📋 **Quick Pre-Launch Checklist**

- [ ] Updated all URLs to production domain
- [ ] Changed myPOS to production credentials
- [ ] Set `NEXT_PUBLIC_MYPOS_IS_SANDBOX=false`
- [ ] Removed `NEXT_PUBLIC_WEBHOOK_URL` variable
- [ ] Removed `SKIP_WEBHOOK_VALIDATION=true`
- [ ] Configured webhook URL in myPOS dashboard
- [ ] Built app: `pnpm build`
- [ ] Started production server
- [ ] Tested checkout flow with test card
- [ ] Verified order appears in database
- [ ] Confirmed amounts are correct

---

## 🎉 **You're Ready!**

Once you've done the above:
1. ✅ Your VPS with HTTPS will handle webhooks automatically
2. ✅ Payments will process through myPOS production
3. ✅ Orders will be created correctly in your database
4. ✅ Customers will see success page after payment

---

**Need Help?**
- Check Supabase logs for errors
- Check myPOS dashboard for failed transactions
- Monitor your server logs: `pm2 logs danirusev`

**Status**: Ready for production deployment! 🚀
