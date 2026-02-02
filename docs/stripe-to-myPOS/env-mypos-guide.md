# myPOS Configuration
# ==========================================
# Get these from your myPOS Merchant Dashboard
# https://merchant.mypos.com/

# Store ID (SID) - Your myPOS checkout store identifier
MYPOS_SID=000000000000010

# Wallet Number - Your myPOS account number (also called Client Number)
MYPOS_WALLET_NUMBER=61938166610

# Key Index - Which key pair you're using (usually 1)
MYPOS_KEY_INDEX=1

# Private Key - Your RSA private key for signing requests
# Generate this in myPOS dashboard or use openssl:
# openssl genrsa -out private.pem 2048
# Then paste the ENTIRE key including BEGIN/END lines
MYPOS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...your private key content...
...keep all lines...
-----END RSA PRIVATE KEY-----"

# Public Key - myPOS's public key for verifying webhooks
# Get this from myPOS dashboard
MYPOS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...myPOS public key content...
-----END PUBLIC KEY-----"

# Sandbox Mode - Set to 'true' for testing, 'false' for production
NEXT_PUBLIC_MYPOS_IS_SANDBOX=true

# ==========================================
# OLD STRIPE VARIABLES - CAN BE REMOVED
# ==========================================
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ==========================================
# TESTING CREDENTIALS (from myPOS docs)
# ==========================================
# Use these for initial testing:
# 
# Test SID: 000000000000010
# Test Wallet: 61938166610
# Test Card: 4006092001004
# Test CVV: 111
# Test 3D Secure: 111111
# Test Expiry: Any future date

# ==========================================
# IMPORTANT NOTES
# ==========================================
# 1. Never commit real credentials to version control
# 2. Generate your own RSA key pair for production
# 3. Webhook URL must be HTTPS (SSL required)
# 4. Configure webhook URL in myPOS dashboard after deployment
# 5. Test thoroughly with test credentials before going live


Please write a concise step by step guide on how to setup, create, get credentials from myPOS merchant dashboard, i know i will be putting them in my .env.local file