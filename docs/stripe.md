# Stripe Integration Documentation

> **Purpose**: This document provides a comprehensive explanation of how Stripe is integrated into the Dani Rusev e-commerce store for drift experiences and physical products. This serves as a complete reference for migrating to another payment provider.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Variables](#2-environment-variables)
3. [NPM Dependencies](#3-npm-dependencies)
4. [Core Stripe Configuration](#4-core-stripe-configuration)
5. [Payment Flow Architecture](#5-payment-flow-architecture)
6. [Frontend Components](#6-frontend-components)
7. [API Routes](#7-api-routes)
8. [Webhook System](#8-webhook-system)
9. [Database Integration](#9-database-integration)
10. [Order Confirmation Flow](#10-order-confirmation-flow)
11. [Manual Orders (0€ Orders)](#11-manual-orders-0-orders)
12. [Data Structures](#12-data-structures)
13. [Migration Checklist](#13-migration-checklist)

---

## 1. Overview

The store uses **Stripe Payment Intents** with **Stripe Elements** for embedded payment forms. The primary payment method is the **PaymentElement** component, which provides a unified payment experience.

### Key Features:
- **Embedded checkout** (not redirect-based Stripe Checkout)
- **Payment Intents API** for card payments
- **Webhook-based order fulfillment** (payment confirmation triggers order creation)
- **Idempotent order creation** using `stripe_payment_intent_id`
- **Support for 0€ orders** (inquiries/free items) via manual order creation

### Payment Flow Summary:
```
User fills cart → Checkout page → Create Payment Intent (API) → 
Stripe Elements form → Payment confirmation → Webhook triggers → 
Order created in Supabase → Confirmation page
```

---

## 2. Environment Variables

All Stripe-related environment variables are stored in `.env` and `.env.local`:

| Variable | Description | Used In |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Server-side secret key (sk_test_... or sk_live_...) | `lib/stripe.ts`, API routes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side publishable key (pk_test_... or pk_live_...) | `checkout-form.tsx`, `lib/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification secret (whsec_...) | `app/api/webhooks/stripe/route.ts` |

### Example `.env` entries:
```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 3. NPM Dependencies

From `package.json`:

```json
{
  "@stripe/react-stripe-js": "^5.4.1",  // React components for Stripe Elements
  "@stripe/stripe-js": "^7.3.1",        // Client-side Stripe.js SDK
  "stripe": "^20.1.0"                   // Server-side Node.js SDK
}
```

### Dependency Purposes:
- **`stripe`**: Server-side SDK for creating Payment Intents, verifying webhooks, retrieving payment details
- **`@stripe/stripe-js`**: Client-side SDK for loading Stripe.js and initializing Elements
- **`@stripe/react-stripe-js`**: React wrapper components (`Elements`, `PaymentElement`, hooks like `useStripe`, `useElements`)

---

## 4. Core Stripe Configuration

### File: `lib/stripe.ts`

```typescript
import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Client-side Stripe loader (async)
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};

// Type exports for use throughout the app
export type StripeCustomer = Stripe.Customer;
export type StripePrice = Stripe.Price;
export type StripeProduct = Stripe.Product;
export type StripePaymentIntent = Stripe.PaymentIntent;
```

### API Version Note:
The store uses API version `2025-12-15.clover`. When migrating, ensure the new provider's API compatibility or update types accordingly.

---

## 5. Payment Flow Architecture

### Detailed Flow Diagram:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CHECKOUT FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. USER ENTERS CHECKOUT PAGE (/checkout)                                  │
│     └── checkout-form.tsx loads with cart items from Zustand store         │
│                                                                             │
│  2. USER FILLS PERSONAL INFO                                               │
│     └── fullName, email, phoneNumber, address (if physical product)        │
│                                                                             │
│  3. USER CLICKS "Proceed to Payment"                                       │
│     └── Opens Terms Agreement Modal                                        │
│     └── User must agree to terms before proceeding                         │
│                                                                             │
│  4. TERMS ACCEPTED → CREATE PAYMENT INTENT                                 │
│     └── POST /api/create-payment-intent                                    │
│     └── Server validates cart items against database                       │
│     └── Server calculates total price (prevents price manipulation)        │
│     └── Server creates Stripe PaymentIntent with metadata                  │
│     └── Returns clientSecret to frontend                                   │
│                                                                             │
│  5. STRIPE ELEMENTS RENDERED                                               │
│     └── <Elements> wrapper with clientSecret                               │
│     └── <PaymentElement /> displays card input                             │
│                                                                             │
│  6. USER SUBMITS PAYMENT                                                   │
│     └── stripe.confirmPayment() called                                     │
│     └── Redirects to /order-confirmation on success                        │
│                                                                             │
│  7. WEBHOOK TRIGGERED (async, server-side)                                 │
│     └── POST /api/webhooks/stripe                                          │
│     └── Event: payment_intent.succeeded                                    │
│     └── Creates order in Supabase using RPC                                │
│     └── Updates user profile with checkout info                            │
│                                                                             │
│  8. ORDER CONFIRMATION PAGE                                                │
│     └── Fetches order details from /api/payment-intent/details             │
│     └── Displays success message and order summary                         │
│     └── Clears cart                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Frontend Components

### File: `app/(frontend)/checkout/checkout-form.tsx`

#### Key Imports:
```typescript
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
```

#### Stripe Initialization:
```typescript
// Initialize Stripe outside component to prevent re-initialization
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
```

#### PaymentForm Component (Inner Component):
```typescript
function PaymentForm({ personalInfo, onSuccess }: { personalInfo: any; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setIsProcessing(false)
    } else {
      onSuccess()  // Clear cart
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
}
```

#### Elements Provider Setup:
```typescript
<Elements
  stripe={stripePromise}
  options={{
    clientSecret,  // From /api/create-payment-intent
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#fff',
        colorBackground: '#020617',  // slate-950
        colorText: '#fff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#020617',
          border: '1px solid #1e293b',
        },
        '.Input:focus': {
          border: '1px solid #D0F61A',  // main brand color
        },
        // ... more rules
      }
    }
  }}
>
  <PaymentForm personalInfo={...} onSuccess={clearCart} />
</Elements>
```

#### Payment Intent Creation:
```typescript
const handleCreatePaymentIntent = async () => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cartItems: items.map(item => ({
        id: item.id,
        productType: item.productType,
        title: item.title,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        selectedVariant: item.selectedVariant,
        experienceSlug: item.experienceSlug,
        selectedLocation: item.selectedLocation,
        selectedVoucher: item.selectedVoucher,
        selectedDuration: item.selectedDuration,
        voucherName: item.voucherName,
        additionalItems: item.additionalItems,
        storedAddons: item.storedAddons,
        storedLocationName: item.storedLocationName,
        storedVoucherName: item.storedVoucherName,
        storedLocationUrl: item.storedLocationUrl,
        selectedDate: item.selectedDate,
        storedSelectedDate: item.storedSelectedDate,
      })),
      personalInfo: {
        fullName, email, phoneNumber, address, city, postalCode, country
      },
    }),
  })

  const data = await response.json()
  setClientSecret(data.clientSecret)  // Enables Stripe Elements
}
```

---

## 7. API Routes

### 7.1 Create Payment Intent

**File**: `app/api/create-payment-intent/route.ts`

**Purpose**: Validates cart items, calculates price server-side, creates Stripe PaymentIntent

**Key Operations**:

1. **Authenticate User** (via Supabase)
2. **Validate Request** (using Zod schema)
3. **Fetch Products from Database** (verify prices, availability)
4. **Calculate Total** (prevents client-side price manipulation)
5. **Create Payment Intent** with metadata
6. **Return Client Secret**

**Payment Intent Creation**:
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100),  // Convert to cents
  currency: 'eur',
  automatic_payment_methods: {
    enabled: true,
  },
  metadata: {
    userId: user.id,
    userEmail: personalInfo.email,
    fullName: personalInfo.fullName,
    phoneNumber: personalInfo.phoneNumber,
    address: personalInfo.address || '',
    city: personalInfo.city || '',
    postalCode: personalInfo.postalCode || '',
    country: personalInfo.country || '',
    itemCount: String(validatedItems.length),
    // Cart items split across multiple keys (Stripe 500 char limit per field)
    cart_0: JSON.stringify(item0),
    cart_1: JSON.stringify(item1),
    // ...
  },
})

return NextResponse.json({
  clientSecret: paymentIntent.client_secret,
  amount: totalAmount,
})
```

**Metadata Handling**:
- Stripe limits metadata values to 500 characters
- Cart items are serialized individually as `cart_0`, `cart_1`, etc.
- `itemCount` tracks how many cart items are stored

---

### 7.2 Payment Intent Details

**File**: `app/api/payment-intent/details/route.ts`

**Purpose**: Retrieve payment details for order confirmation page

**Flow**:
```typescript
// GET /api/payment-intent/details?payment_intent=pi_xxx

// 1. Authenticate user
// 2. Get payment_intent ID from query params
// 3. Retrieve from Stripe
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

// 4. Verify ownership (metadata.userId === user.id)
// 5. Return formatted details
return NextResponse.json({
  customerName: paymentIntent.metadata.fullName,
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  items: cartItems,
})
```

---

### 7.3 Checkout Session (Legacy)

**File**: `app/api/checkout/session/route.ts`

**Purpose**: Retrieve Stripe Checkout Session details (legacy, primarily for redirect-based checkout)

```typescript
// GET /api/checkout/session?session_id=cs_xxx
const session = await stripe.checkout.sessions.retrieve(sessionId)
return NextResponse.json(session)
```

---

### 7.4 Checkout Route (Legacy)

**File**: `app/api/checkout/route.ts`

**Purpose**: Create Stripe Checkout Session (legacy redirect-based flow)

**Note**: This is NOT the primary payment method. The store uses embedded PaymentElement instead.

---

## 8. Webhook System

**File**: `app/api/webhooks/stripe/route.ts`

### Webhook Verification:
```typescript
export async function POST(req: Request) {
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 },
    )
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  return NextResponse.json({ received: true })
}
```

### Payment Intent Succeeded Handler:
```typescript
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // Extract metadata
  const {
    userId, userEmail, fullName, phoneNumber,
    address, city, postalCode, country, itemCount
  } = paymentIntent.metadata || {}

  // Reconstruct cart items from split metadata
  const cartItems = reconstructCartItems(paymentIntent.metadata)

  // Build shipping address
  const shippingAddress = {
    fullName, email: userEmail, phoneNumber,
    address, city, postalCode, country,
  }

  // Calculate total from cart items
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)

  // Transform to database format
  const orderItems = cartItems.map(item => ({
    product_id: item.productId || item.experienceSlug,
    title: item.productTitle || item.experienceTitle,
    quantity: item.quantity,
    price: item.unitPrice,
    variant: item.variant || '',
    sku: item.sku || '',
    item_type: item.type,
    image_url: item.imageUrl,
    location: item.location,
    addons: item.addons,
    voucher_type: item.voucherType,
    voucher_recipient_name: item.voucherRecipientName,
    selected_date: item.selectedDate,
  }))

  // Create order via Supabase RPC (idempotent)
  await supabase.rpc('create_order_from_webhook', {
    p_user_id: userId,
    p_total_price: totalPrice,
    p_shipping_address_snapshot: shippingAddress,
    p_cart_items: orderItems,
    p_stripe_payment_intent_id: paymentIntent.id,  // For idempotency
  })

  // Update user profile
  await supabase.rpc('update_profile_from_checkout', {
    p_user_id: userId,
    p_full_name: fullName,
    p_phone_number: phoneNumber,
    p_address: address,
    p_city: city,
    p_postal_code: postalCode,
    p_country: country,
    p_email: userEmail,
  })
}
```

### Cart Reconstruction Helper:
```typescript
function reconstructCartItems(metadata: Record<string, string>): any[] {
  const itemCount = parseInt(metadata.itemCount || '0')
  const items: any[] = []

  for (let i = 0; i < itemCount; i++) {
    const itemJson = metadata[`cart_${i}`]
    if (itemJson) {
      try {
        items.push(JSON.parse(itemJson))
      } catch (e) {
        console.error(`Failed to parse cart_${i}:`, e)
      }
    }
  }

  return items
}
```

### Webhook Endpoint Configuration:
- **URL**: `https://yourdomain.com/api/webhooks/stripe`
- **Events to listen for**: `payment_intent.succeeded`
- **Legacy event (disabled)**: `checkout.session.completed` (was causing duplicate orders)

---

## 9. Database Integration

### Supabase Tables Used:

#### `ecommerce.orders`
```sql
- id: bigint (auto-generated)
- user_id: uuid (FK to auth.users)
- created_at: timestamp
- total_price: numeric(10,2)
- status: text ('pending', 'approved', 'shipped', 'delivered', 'cancelled')
- shipping_address_snapshot: jsonb
- stripe_payment_intent_id: text (UNIQUE - used for idempotency)
```

#### `ecommerce.order_items`
```sql
- id: bigint (auto-generated)
- order_id: bigint (FK to orders)
- product_id: text
- quantity: integer
- price: numeric(10,2)
- title: text
- variant: text
- sku: text
- item_type: text ('physical', 'experience')
- location: text
- addons: jsonb
- voucher_type: text
- voucher_recipient_name: text
- image_url: text
- selected_date: date
```

#### `ecommerce.vouchers`
```sql
- id: uuid
- order_item_id: integer (FK to order_items)
- user_id: uuid (FK to profiles)
- product_slug: text
- selected_date: date
- expiry_date: date
- addons: jsonb
- voucher_recipient_name: text
- location: text
- status: text ('pending', 'active', 'redeemed', 'expired')
- redeemed_at: timestamp
- redeemed_by: uuid
```

#### `ecommerce.profiles`
```sql
- id: uuid (FK to auth.users)
- full_name: text
- email: text
- phone_number: text
- address: text
- city: text
- postal_code: text
- country: text
- billing_address: jsonb
```

### Supabase RPC Functions:

#### `create_order_from_webhook`
**Parameters**:
- `p_user_id`: uuid
- `p_total_price`: numeric
- `p_shipping_address_snapshot`: jsonb
- `p_cart_items`: jsonb array
- `p_stripe_payment_intent_id`: text

**Purpose**: Creates order + order items atomically, with idempotency check on `stripe_payment_intent_id`

#### `update_profile_from_checkout`
**Parameters**:
- `p_user_id`: uuid
- `p_full_name`: text
- `p_phone_number`: text
- `p_address`: text
- `p_city`: text
- `p_postal_code`: text
- `p_country`: text
- `p_email`: text

**Purpose**: Updates user profile with checkout information

---

## 10. Order Confirmation Flow

**File**: `app/(frontend)/order-confirmation/page.tsx`

### URL Parameters:
- `?payment_intent=pi_xxx` - For Stripe payments
- `?order_id=123` - For manual/0€ orders

### Flow:
```typescript
// 1. Get params
const paymentIntent = searchParams.get('payment_intent')
const orderIdParam = searchParams.get('order_id')

// 2. Clear cart immediately
clearCart()

// 3. Fetch order details
const endpoint = paymentIntent
  ? `/api/payment-intent/details?payment_intent=${paymentIntent}`
  : `/api/orders/details?order_id=${orderIdParam}`

const res = await fetch(endpoint)
const data = await res.json()

// 4. Display confirmation
```

---

## 11. Manual Orders (0€ Orders)

**File**: `app/api/create-manual-order/route.ts`

For orders with `total = 0€` (inquiries, free items), the system bypasses Stripe:

### Flow:
1. User clicks "Confirm Request" (instead of "Proceed to Payment")
2. POST to `/api/create-manual-order`
3. Server validates cart items
4. Creates a pseudo payment intent ID: `manual_{timestamp}_{userId.slice(0,8)}`
5. Calls same `create_order_from_webhook` RPC
6. Redirects to `/order-confirmation?order_id={orderId}`

### Key Difference:
```typescript
const manualOrderId = `manual_${Date.now()}_${user.id.slice(0, 8)}`

await supabaseAdmin.rpc('create_order_from_webhook', {
  // ...
  p_stripe_payment_intent_id: manualOrderId,  // Not a real Stripe ID
})
```

---

## 12. Data Structures

### Cart Item (Frontend):
```typescript
interface CartItem {
  id: string;
  cartItemId: string;
  title: string;
  price: number;
  quantity: number;
  productType: 'physical' | 'experience';
  
  // Physical products
  selectedVariant?: { options: Record<string, string>; sku?: string };
  
  // Experiences
  experienceSlug?: string;
  selectedLocation?: string;
  selectedVoucher?: string;
  selectedDuration?: string;
  additionalItems?: string[];
  voucherName?: string;
  selectedDate?: string;
  
  // Stored display data
  storedAddons?: Array<{
    id: string;
    name: string;
    price: number;
    icon?: string;
    type: 'standard' | 'location' | 'voucher' | 'duration';
  }>;
  storedLocationName?: string;
  storedVoucherName?: string;
  storedDurationName?: string;
  imageUrl?: string;
  themeColor?: string;
}
```

### Validated Item (Server):
```typescript
interface ValidatedItem {
  type: 'physical' | 'experience';
  productId?: string;
  experienceSlug?: string;
  productTitle?: string;
  experienceTitle?: string;
  variant?: string;
  sku?: string;
  imageUrl?: string;
  location?: string;
  addons?: string[];
  voucherType?: string;
  voucherRecipientName?: string;
  selectedDate?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

### Payment Intent Metadata:
```typescript
{
  userId: string;
  userEmail: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  itemCount: string;
  cart_0: string;  // JSON stringified item
  cart_1: string;
  // ... cart_N
}
```

---

## 13. Migration Checklist

When migrating to a new payment provider, replace/update the following:

### Dependencies to Remove:
- [ ] `stripe` (server SDK)
- [ ] `@stripe/stripe-js` (client SDK)
- [ ] `@stripe/react-stripe-js` (React components)

### Environment Variables to Replace:
- [ ] `STRIPE_SECRET_KEY` → New provider's secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → New provider's client key
- [ ] `STRIPE_WEBHOOK_SECRET` → New provider's webhook secret

### Files to Modify:

| File | Changes Needed |
|------|----------------|
| `lib/stripe.ts` | Replace with new provider initialization |
| `lib/checkout.ts` | Update checkout/payment intent functions |
| `app/(frontend)/checkout/checkout-form.tsx` | Replace Elements/PaymentElement with new UI |
| `app/api/create-payment-intent/route.ts` | Replace PaymentIntent creation with new API |
| `app/api/payment-intent/details/route.ts` | Replace payment retrieval logic |
| `app/api/webhooks/stripe/route.ts` | Rewrite for new provider's webhook format |
| `app/api/checkout/route.ts` | Update or remove if not needed |
| `app/api/checkout/session/route.ts` | Update or remove if not needed |
| `app/(frontend)/order-confirmation/page.tsx` | Update query params if needed |

### Database Considerations:
- [ ] `stripe_payment_intent_id` column can be renamed to `payment_provider_reference_id`
- [ ] Keep idempotency logic using the new provider's transaction ID
- [ ] `create_order_from_webhook` RPC can remain, just update parameter name

### Webhook Considerations:
- [ ] New endpoint URL for new provider
- [ ] New signature verification logic
- [ ] Map new provider's event types to handlers
- [ ] Ensure idempotent order creation still works

### Frontend Behavior to Preserve:
- [ ] Terms agreement modal before payment
- [ ] Loading states during payment
- [ ] Error handling and toast notifications
- [ ] Cart clearing after successful payment
- [ ] Redirect to confirmation page

### Payment Features Currently Used:
- [x] One-time payments (no subscriptions currently live)
- [x] EUR currency
- [x] Card payments (via automatic_payment_methods)
- [x] Embedded payment form (not redirect)
- [x] Webhook-based fulfillment
- [ ] Subscriptions (commented out, not implemented)

---

## Summary

The Stripe integration uses the modern **Payment Intents + Elements** approach rather than the redirect-based Checkout Sessions. Key touchpoints are:

1. **`lib/stripe.ts`** - Core SDK initialization
2. **`checkout-form.tsx`** - Frontend payment form with Elements
3. **`/api/create-payment-intent`** - Server-side Payment Intent creation
4. **`/api/webhooks/stripe`** - Webhook handler for order fulfillment
5. **Supabase RPCs** - `create_order_from_webhook`, `update_profile_from_checkout`

The architecture ensures:
- **Security**: Prices are validated server-side
- **Idempotency**: `stripe_payment_intent_id` prevents duplicate orders
- **Reliability**: Webhook-based fulfillment ensures orders aren't lost
