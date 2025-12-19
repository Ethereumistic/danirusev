import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Stripe } from 'stripe'

// Supabase client with service role key for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Helper to reconstruct cart items from split metadata
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

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  console.log('✅ Received payment_intent.succeeded event.')
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  const {
    userId,
    userEmail,
    fullName,
    phoneNumber,
    address,
    city,
    postalCode,
    country,
    itemCount
  } = paymentIntent.metadata || {}

  if (!userId || !itemCount) {
    console.error(`🚫 Missing required metadata in payment intent: ${paymentIntent.id}`)
    console.error('Metadata:', paymentIntent.metadata)
    throw new Error(`Missing required metadata in payment intent: ${paymentIntent.id}`)
  }

  console.log(`[INFO] Processing payment for user: ${userId}, items: ${itemCount}`)

  // Reconstruct cart items from split metadata
  const cartItems = reconstructCartItems(paymentIntent.metadata)
  console.log(`[INFO] Reconstructed ${cartItems.length} cart items`)
  console.log('[DEBUG] Raw cart items:', JSON.stringify(cartItems, null, 2))

  // Build shipping address snapshot
  const shippingAddress = {
    fullName: fullName || '',
    email: userEmail || '',
    phoneNumber: phoneNumber || '',
    address: address || '',
    city: city || '',
    postalCode: postalCode || '',
    country: country || '',
  }

  // Calculate total from cart items
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)

  // Transform cart items to match database format
  const orderItems = cartItems.map(item => ({
    product_id: item.productId || item.experienceSlug || '',
    title: item.productTitle || item.experienceTitle || item.title || '',
    quantity: item.quantity || item.qty || 1,
    price: item.unitPrice || item.total / (item.qty || 1) || 0,
    variant: item.variant || '',
    sku: item.sku || '',
    item_type: item.type || 'physical',
    image_url: item.imageUrl || null,
    // Experience-specific fields
    location: item.location || null,
    addons: item.addons || null, // Already an array, don't stringify
    voucher_type: item.voucherType || null,
    voucher_recipient_name: item.voucherRecipientName || null,
    selected_date: item.selectedDate || null,
  }))

  console.log('[DEBUG] Mapped order items to send to RPC:', JSON.stringify(orderItems, null, 2))

  // Call the database function to create the order (with idempotency via payment intent ID)
  const { data: orderId, error } = await supabase.rpc('create_order_from_webhook', {
    p_user_id: userId,
    p_total_price: totalPrice,
    p_shipping_address_snapshot: shippingAddress,
    p_cart_items: orderItems,
    p_stripe_payment_intent_id: paymentIntent.id,
  })

  if (error) {
    console.error('❌ Error calling create_order_from_webhook:', error)
    throw new Error(`Database RPC error: ${error.message}`)
  }

  // Update user profile with checkout personal info
  const { error: profileError } = await supabase.rpc('update_profile_from_checkout', {
    p_user_id: userId,
    p_full_name: fullName || '',
    p_phone_number: phoneNumber || '',
    p_address: address || '',
    p_city: city || '',
    p_postal_code: postalCode || '',
    p_country: country || '',
    p_email: userEmail || '',
  })

  if (profileError) {
    // Log but don't fail the order creation
    console.error('⚠️ Error updating profile:', profileError)
  } else {
    console.log(`✅ Profile updated for user: ${userId}`)
  }

  console.log(`✅✅✅ Order successfully created for payment: ${paymentIntent.id}`)
}

// ============================================
// LEGACY HANDLER - DISABLED TO PREVENT DUPLICATE ORDERS
// This was creating orders WITHOUT stripe_payment_intent_id, causing duplicates.
// If you need redirect-based Stripe Checkout in the future, re-enable this
// but make sure to pass the payment_intent_id for idempotency.
// ============================================
// async function handleCheckoutSessionCompleted(event: Stripe.Event) {
//   console.log('✅ Received checkout.session.completed event (legacy).')
//   const session = event.data.object as Stripe.Checkout.Session
//
//   const { userId, shippingAddress, cartItems } = session.metadata || {}
//   if (!userId || !shippingAddress || !cartItems) {
//     throw new Error(`🚫 Missing metadata in checkout session: ${session.id}`)
//   }
//
//   console.log(`[INFO] Legacy checkout session: ${session.id}`)
//
//   // NOTE: This was missing p_stripe_payment_intent_id, causing duplicates!
//   const { error } = await supabase.rpc('create_order_from_webhook', {
//     p_user_id: userId,
//     p_total_price: session.amount_total! / 100,
//     p_shipping_address_snapshot: JSON.parse(shippingAddress),
//     p_cart_items: JSON.parse(cartItems),
//     p_stripe_payment_intent_id: session.payment_intent as string, // FIXED!
//   })
//
//   if (error) {
//     console.error('❌ Error calling create_order_from_webhook:', error)
//     throw new Error(`Database RPC error: ${error.message}`)
//   }
//
//   console.log(`✅✅✅ Order successfully processed for session: ${session.id}`)
// }

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
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`❌ Webhook signature verification failed: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payments from embedded checkout
        await handlePaymentIntentSucceeded(event)
        break
      // DISABLED: checkout.session.completed was causing duplicate orders
      // case 'checkout.session.completed':
      //   await handleCheckoutSessionCompleted(event)
      //   break
      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook handler failed for event ${event.type}: ${errorMessage}`)
    return NextResponse.json(
      { message: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}