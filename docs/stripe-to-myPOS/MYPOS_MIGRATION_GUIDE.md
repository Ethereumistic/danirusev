# myPOS Migration Guide - From Stripe to myPOS Embedded SDK

## 🎯 Recommended Approach: Embedded SDK

**Why Embedded SDK is the BEST choice:**
- ✅ Most similar to your current Stripe Elements implementation
- ✅ No redirect - keeps users on your website (like Stripe)
- ✅ Embedded iframe payment form (just like Stripe Elements)
- ✅ Webhook-based fulfillment (identical pattern to Stripe)
- ✅ Quick to implement with minimal UI changes

---

## 📋 Migration Overview

### Current Stripe Flow
```
User → Checkout Page → Create PaymentIntent API → 
Stripe Elements → Payment → Webhook → Order Created → Confirmation
```

### New myPOS Flow
```
User → Checkout Page → myPOS Embedded SDK → 
Payment → Webhook (URL_Notify) → Order Created → Confirmation
```

**Key Difference:** myPOS doesn't require a "create payment intent" API call first. The SDK handles everything client-side, then notifies your server via webhook.

---

## 🔧 Step-by-Step Migration

### 1. Install myPOS Package

```bash
pnpm install mypos-embedded-checkout
```

### 2. Environment Variables

**Replace in `.env`:**

```env
# Remove these Stripe variables
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# Add myPOS credentials (get from myPOS dashboard)
MYPOS_SID=000000000000010
MYPOS_WALLET_NUMBER=61938166610
MYPOS_KEY_INDEX=1
MYPOS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...your private key...
-----END RSA PRIVATE KEY-----"
MYPOS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...myPOS public key...
-----END PUBLIC KEY-----"
NEXT_PUBLIC_MYPOS_IS_SANDBOX=true
```

### 3. Create myPOS Configuration

**File:** `lib/mypos.ts`

```typescript
import crypto from 'crypto';

export const myPOSConfig = {
  sid: process.env.MYPOS_SID!,
  walletNumber: process.env.MYPOS_WALLET_NUMBER!,
  keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
  privateKey: process.env.MYPOS_PRIVATE_KEY!,
  publicKey: process.env.MYPOS_PUBLIC_KEY!,
  isSandbox: process.env.NEXT_PUBLIC_MYPOS_IS_SANDBOX === 'true',
};

// Signature generation helper
export function generateSignature(data: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(myPOSConfig.privateKey, 'base64');
}

// Signature verification helper
export function verifySignature(data: string, signature: string): boolean {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(myPOSConfig.publicKey, signature, 'base64');
}

export type MyPOSPaymentParams = {
  sid: string;
  ipcLanguage: string;
  walletNumber: string;
  amount: number;
  currency: string;
  orderID: string;
  urlNotify: string;
  urlOk: string;
  urlCancel: string;
  keyIndex: number;
  cartItems: Array<{
    article: string;
    quantity: number;
    price: number;
    currency: string;
  }>;
};
```

### 4. Update Checkout Form Component

**File:** `app/(frontend)/checkout/checkout-form.tsx`

**Key Changes:**
- Remove Stripe Elements provider
- Add myPOS Embedded SDK
- Replace PaymentElement with myPOS iframe container
- Update payment submission logic

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as MyPOSEmbedded from 'mypos-embedded-checkout'

export default function CheckoutForm() {
  const router = useRouter()
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'BG',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  
  // Get cart items (your existing cart logic)
  const cartItems = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  
  const totalAmount = cartItems.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  )

  // Initialize myPOS payment when ready
  useEffect(() => {
    if (!showPaymentForm) return

    const orderID = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const paymentParams = {
      sid: process.env.NEXT_PUBLIC_MYPOS_SID!,
      ipcLanguage: 'en',
      walletNumber: process.env.NEXT_PUBLIC_MYPOS_WALLET_NUMBER!,
      amount: totalAmount,
      currency: 'EUR',
      orderID: orderID,
      urlNotify: `${window.location.origin}/api/webhooks/mypos`,
      urlOk: `${window.location.origin}/order-confirmation?order_id=${orderID}`,
      urlCancel: `${window.location.origin}/checkout`,
      keyIndex: 1,
      cartItems: cartItems.map(item => ({
        article: item.title,
        quantity: item.quantity,
        price: item.price,
        currency: 'EUR',
      })),
    }

    const callbackParams = {
      isSandbox: process.env.NEXT_PUBLIC_MYPOS_IS_SANDBOX === 'true',
      onSuccess: function (data: any) {
        console.log('Payment successful:', data)
        // Clear cart and redirect
        clearCart()
        router.push(`/order-confirmation?order_id=${orderID}`)
      },
      onError: function (error: any) {
        console.error('Payment error:', error)
        toast.error('Payment failed. Please try again.')
        setIsProcessing(false)
      },
      onMessageReceived: function (messages: any) {
        console.log('Payment messages:', messages)
      },
    }

    MyPOSEmbedded.createPayment(
      'mypos-embedded-checkout',
      paymentParams,
      callbackParams
    )
  }, [showPaymentForm, cartItems, totalAmount, clearCart, router])

  const handleProceedToPayment = async () => {
    // Validate personal info
    if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phoneNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    // Store personal info in session/local storage if needed
    sessionStorage.setItem('checkoutPersonalInfo', JSON.stringify(personalInfo))
    
    // Show payment form
    setShowPaymentForm(true)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {!showPaymentForm ? (
        <div className="space-y-4">
          {/* Personal Information Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo(prev => ({...prev, phoneNumber: e.target.value}))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Add other fields as needed */}
            </div>

            <button
              onClick={handleProceedToPayment}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Payment (€{totalAmount.toFixed(2)})
            </button>
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {/* Your existing cart display */}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          
          {/* myPOS Embedded Payment Form */}
          <div 
            id="mypos-embedded-checkout" 
            className="min-h-[620px]"
          />
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Secure payment powered by myPOS
          </p>
        </div>
      )}
    </div>
  )
}
```

### 5. Create Webhook Handler

**File:** `app/api/webhooks/mypos/route.ts`

This replaces your Stripe webhook at `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifySignature, myPOSConfig } from '@/lib/mypos'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract all parameters
    const params: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString()
    }

    console.log('myPOS Webhook received:', params)

    // Verify signature
    const signature = params.Signature || ''
    delete params.Signature // Remove signature before verifying
    
    // Build data string for verification (keys in alphabetical order)
    const sortedKeys = Object.keys(params).sort()
    const dataString = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
    
    const isValid = verifySignature(dataString, signature)
    
    if (!isValid) {
      console.error('Invalid signature')
      return new NextResponse('Invalid signature', { status: 400 })
    }

    // Extract payment details
    const {
      IPCmethod,
      OrderID,
      Amount,
      Currency,
      CustomerEmail,
      CustomerFirstNames,
      CustomerFamilyName,
      CustomerPhone,
      CustomerCountry,
      CustomerCity,
      CustomerZIPCode,
      CustomerAddress,
      TransactionStatus, // 1 = success, 2 = pending, 0 = failed
      TransactionID,
      CardType,
      CardLast4Digits,
    } = params

    // Check if payment was successful
    if (TransactionStatus !== '1') {
      console.log('Payment not successful:', TransactionStatus)
      return new NextResponse('OK', { status: 200 })
    }

    // Retrieve stored cart data from session
    // You'll need to store this during checkout
    const cartData = JSON.parse(params.CartData || '[]')

    // Create order in database
    const { data: order, error } = await supabaseAdmin.rpc('create_order_from_webhook', {
      p_user_id: params.UserID, // You need to pass this during checkout
      p_payment_provider_reference_id: TransactionID,
      p_amount_total: parseFloat(Amount),
      p_currency: Currency,
      p_customer_email: CustomerEmail,
      p_customer_phone: CustomerPhone,
      p_full_name: `${CustomerFirstNames} ${CustomerFamilyName}`,
      p_address: CustomerAddress,
      p_city: CustomerCity,
      p_postal_code: CustomerZIPCode,
      p_country: CustomerCountry,
      p_cart_items: JSON.stringify(cartData),
    })

    if (error) {
      console.error('Error creating order:', error)
      return new NextResponse('Error creating order', { status: 500 })
    }

    console.log('Order created successfully:', order)

    // IMPORTANT: Respond with "OK"
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 500 })
  }
}
```

### 6. Update Database Schema

**Minor update needed:**

```sql
-- Rename column (optional - you can keep stripe_payment_intent_id)
ALTER TABLE orders 
ADD COLUMN payment_provider_reference_id TEXT;

-- Or just use the existing column with myPOS transaction IDs
-- The stripe_payment_intent_id column can store myPOS TransactionID

-- Update RPC function signature
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  -- ... existing parameters ...
  p_payment_provider_reference_id TEXT -- renamed from p_stripe_payment_intent_id
)
-- ... rest of function ...
```

### 7. Remove Stripe API Route

**Delete or comment out:**
- `app/api/create-payment-intent/route.ts` (not needed with myPOS)
- `app/api/payment-intent/details/route.ts` (will need modification)

### 8. Update Order Confirmation Page

**File:** `app/(frontend)/order-confirmation/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('order_id')
  const [orderDetails, setOrderDetails] = useState(null)
  
  useEffect(() => {
    if (!orderID) return
    
    // Fetch order details from your database
    async function fetchOrder() {
      const res = await fetch(`/api/orders/details?order_id=${orderID}`)
      const data = await res.json()
      setOrderDetails(data)
    }
    
    fetchOrder()
  }, [orderID])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✓ Payment Successful!
      </h1>
      <p>Your order has been confirmed.</p>
      <p>Order ID: {orderID}</p>
      {/* Display order details */}
    </div>
  )
}
```

---

## 🔐 Security & Signature Generation

myPOS requires RSA signature for security. Here's how to generate it:

### Generate Signature (Server-Side Only)

```typescript
import crypto from 'crypto'

function generateMyPOSSignature(params: Record<string, any>): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort()
  
  // Build data string
  const dataString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  // Sign with private key
  const sign = crypto.createSign('SHA256')
  sign.update(dataString)
  sign.end()
  
  return sign.sign(privateKey, 'base64')
}
```

**Important:** Signature generation must happen server-side because you can't expose your private key to the client.

---

## 🧪 Testing

### Test Credentials (from myPOS docs)

```typescript
const TEST_CONFIG = {
  sid: '000000000000010',
  walletNumber: '61938166610',
  keyIndex: 1,
  isSandbox: true,
}
```

### Test Card Numbers

```
Card Number: 4006092001004
CVV: 111
Expiry: Any future date
3D Secure password: 111111
```

---

## 📊 Comparison Chart

| Feature | Stripe | myPOS Embedded SDK |
|---------|--------|-------------------|
| Payment Form | Elements (iframe) | Embedded SDK (iframe) |
| Redirect | No | No |
| Payment Intent | Yes (API call needed) | No (handled by SDK) |
| Webhook | `payment_intent.succeeded` | `IPCPurchaseNotify` |
| Client SDK | `@stripe/stripe-js` | `mypos-embedded-checkout` |
| 3D Secure | Automatic | Automatic |
| Mobile Optimized | Yes | Yes |

---

## ✅ Migration Checklist

- [ ] Install `mypos-embedded-checkout` package
- [ ] Add myPOS credentials to environment variables
- [ ] Create `lib/mypos.ts` configuration file
- [ ] Update checkout form component
- [ ] Create myPOS webhook handler at `/api/webhooks/mypos`
- [ ] Update database RPC function (optional column rename)
- [ ] Update order confirmation page
- [ ] Remove old Stripe API routes
- [ ] Test with myPOS test credentials
- [ ] Configure webhook URL in myPOS dashboard
- [ ] Test full payment flow
- [ ] Update terms & conditions (payment processor name)
- [ ] Go live with production credentials

---

## 🚨 Important Notes

1. **Webhook URL Must Be HTTPS** - myPOS requires SSL
2. **Webhook Must Respond "OK"** - Critical for myPOS to consider it successful
3. **Signature Verification** - Always verify webhook signatures
4. **iFrame Minimum Size** - 320px width × 620px height
5. **Store User Data** - Since there's no "create payment intent" API, store user checkout data in sessionStorage or your backend before showing payment form

---

## 📞 Support

- myPOS Docs: https://developers-old.mypos.com/en/doc/online_payments/v1_4
- myPOS Support: Check their developer portal for contact info

---

**Migration Time Estimate:** 4-6 hours for a developer familiar with the codebase.

Good luck with your migration! 🚀