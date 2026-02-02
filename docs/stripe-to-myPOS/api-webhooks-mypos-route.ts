// app/api/webhooks/mypos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    validateWebhook,
    parseWebhookData,
    type MyPOSWebhookData
} from '@/lib/mypos';
import { createClient } from '@supabase/supabase-js';

// Create admin client for database operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * myPOS Webhook Handler
 * 
 * This endpoint receives payment notifications from myPOS when a payment
 * is completed. It verifies the signature, validates the payment, and
 * creates an order in the database.
 * 
 * CRITICAL: This endpoint MUST respond with "OK" (status 200) for myPOS
 * to consider the webhook successfully delivered. Any other response will
 * cause myPOS to mark the transaction as failed.
 */
export async function POST(request: NextRequest) {
    console.log('=== myPOS Webhook Received ===');

    try {
        // Parse form data from myPOS
        const formData = await request.formData();
        const webhookData = parseWebhookData(formData);

        console.log('Webhook Data:', {
            OrderID: webhookData.OrderID,
            TransactionID: webhookData.TransactionID,
            Amount: webhookData.Amount,
            TransactionStatus: webhookData.TransactionStatus,
        });

        // Validate signature and transaction status
        const validation = validateWebhook(webhookData);

        if (!validation.isValid) {
            console.error('Webhook validation failed:', validation.error);

            // Still respond with OK to prevent myPOS from retrying
            // but don't create the order
            return new NextResponse('OK', { status: 200 });
        }

        // Extract customer information
        const {
            OrderID,
            TransactionID,
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
            CardType,
            CardLast4Digits,
        } = webhookData;

        // Retrieve stored checkout data
        // Note: You need to store this data before payment
        // See implementation note below
        const checkoutData = await retrieveCheckoutData(OrderID);

        if (!checkoutData) {
            console.error('No checkout data found for order:', OrderID);
            return new NextResponse('OK', { status: 200 });
        }

        // Check if order already exists (idempotency)
        const { data: existingOrder } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('stripe_payment_intent_id', TransactionID) // reusing this column for myPOS
            .single();

        if (existingOrder) {
            console.log('Order already exists, skipping creation:', existingOrder.id);
            return new NextResponse('OK', { status: 200 });
        }

        // Create order in database using RPC
        const { data: order, error: orderError } = await supabaseAdmin.rpc(
            'create_order_from_webhook',
            {
                p_user_id: checkoutData.userId,
                p_stripe_payment_intent_id: TransactionID, // myPOS transaction ID
                p_amount_total: parseFloat(Amount),
                p_currency: Currency,
                p_customer_email: CustomerEmail || checkoutData.email,
                p_customer_phone: CustomerPhone || checkoutData.phoneNumber,
                p_full_name: CustomerFirstNames && CustomerFamilyName
                    ? `${CustomerFirstNames} ${CustomerFamilyName}`
                    : checkoutData.fullName,
                p_address: CustomerAddress || checkoutData.address,
                p_city: CustomerCity || checkoutData.city,
                p_postal_code: CustomerZIPCode || checkoutData.postalCode,
                p_country: CustomerCountry || checkoutData.country,
                p_cart_items: JSON.stringify(checkoutData.cartItems),
            }
        );

        if (orderError) {
            console.error('Error creating order:', orderError);
            // Still respond with OK to prevent retries
            return new NextResponse('OK', { status: 200 });
        }

        console.log('Order created successfully:', order);

        // Update user profile with checkout information
        if (checkoutData.userId && (CustomerEmail || checkoutData.email)) {
            await supabaseAdmin.rpc('update_profile_from_checkout', {
                p_user_id: checkoutData.userId,
                p_full_name: checkoutData.fullName,
                p_phone_number: CustomerPhone || checkoutData.phoneNumber,
                p_address: CustomerAddress || checkoutData.address,
                p_city: CustomerCity || checkoutData.city,
                p_postal_code: CustomerZIPCode || checkoutData.postalCode,
                p_country: CustomerCountry || checkoutData.country,
                p_email: CustomerEmail || checkoutData.email,
            });
        }

        // Clean up checkout data
        await deleteCheckoutData(OrderID);

        // CRITICAL: Respond with "OK" for myPOS
        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);

        // Still respond with OK to prevent infinite retries
        // Log the error for investigation
        return new NextResponse('OK', { status: 200 });
    }
}

/**
 * Retrieve checkout data stored before payment
 * 
 * Implementation options:
 * 1. Redis cache (recommended for production)
 * 2. Database temporary table
 * 3. Supabase table with TTL
 */
async function retrieveCheckoutData(orderID: string) {
    try {
        // Option 1: Using Supabase temporary storage
        const { data } = await supabaseAdmin
            .from('checkout_sessions')
            .select('*')
            .eq('order_id', orderID)
            .single();

        return data;

        // Option 2: Using Redis (if you have it set up)
        // const redis = createRedisClient();
        // const data = await redis.get(`checkout:${orderID}`);
        // return data ? JSON.parse(data) : null;

    } catch (error) {
        console.error('Error retrieving checkout data:', error);
        return null;
    }
}

/**
 * Delete checkout data after order creation
 */
async function deleteCheckoutData(orderID: string) {
    try {
        // Option 1: Supabase
        await supabaseAdmin
            .from('checkout_sessions')
            .delete()
            .eq('order_id', orderID);

        // Option 2: Redis
        // const redis = createRedisClient();
        // await redis.del(`checkout:${orderID}`);

    } catch (error) {
        console.error('Error deleting checkout data:', error);
    }
}

/**
 * Handle GET requests (for testing/verification)
 */
export async function GET() {
    return NextResponse.json({
        message: 'myPOS Webhook Endpoint',
        status: 'active',
    });
}

// Export route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';