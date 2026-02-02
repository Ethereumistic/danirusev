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
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
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
        const { data: checkoutData, error: fetchError } = await supabaseAdmin
            .from('checkout_sessions')
            .select('*')
            .eq('order_id', OrderID)
            .single();

        if (fetchError || !checkoutData) {
            console.error('No checkout data found for order:', OrderID, fetchError);
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

        // Build shipping address snapshot
        const shippingAddress = {
            fullName: CustomerFirstNames && CustomerFamilyName
                ? `${CustomerFirstNames} ${CustomerFamilyName}`
                : checkoutData.full_name,
            email: CustomerEmail || checkoutData.email,
            phoneNumber: CustomerPhone || checkoutData.phone_number,
            address: CustomerAddress || checkoutData.address || '',
            city: CustomerCity || checkoutData.city || '',
            postalCode: CustomerZIPCode || checkoutData.postal_code || '',
            country: CustomerCountry || checkoutData.country || '',
        };

        // Transform cart items to match database format
        const orderItems = checkoutData.cart_items.map((item: any) => ({
            product_id: item.productId || item.experienceSlug || '',
            title: item.productTitle || item.experienceTitle || item.title || '',
            quantity: item.quantity || 1,
            price: item.unitPrice || 0,
            variant: item.variant || '',
            sku: item.sku || '',
            item_type: item.type || 'physical',
            image_url: item.imageUrl || null,
            // Experience-specific fields
            location: item.location || null,
            addons: item.addons || null,
            voucher_type: item.voucherType || null,
            voucher_recipient_name: item.voucherRecipientName || null,
            selected_date: item.selectedDate || null,
        }));

        console.log('[DEBUG] Mapped order items to send to RPC:', JSON.stringify(orderItems, null, 2));

        // Create order in database using RPC
        const { data: orderId, error: orderError } = await supabaseAdmin.rpc(
            'create_order_from_webhook',
            {
                p_user_id: checkoutData.user_id,
                p_total_price: parseFloat(Amount),
                p_shipping_address_snapshot: shippingAddress,
                p_cart_items: orderItems,
                p_stripe_payment_intent_id: TransactionID, // myPOS transaction ID
            }
        );

        if (orderError) {
            console.error('Error creating order:', orderError);
            // Still respond with OK to prevent retries
            return new NextResponse('OK', { status: 200 });
        }

        console.log('Order created successfully:', orderId);

        // Update user profile with checkout information
        if (checkoutData.user_id) {
            const { error: profileError } = await supabaseAdmin.rpc('update_profile_from_checkout', {
                p_user_id: checkoutData.user_id,
                p_full_name: shippingAddress.fullName,
                p_phone_number: shippingAddress.phoneNumber,
                p_address: shippingAddress.address,
                p_city: shippingAddress.city,
                p_postal_code: shippingAddress.postalCode,
                p_country: shippingAddress.country,
                p_email: shippingAddress.email,
            });

            if (profileError) {
                // Log but don't fail the order creation
                console.error('⚠️ Error updating profile:', profileError);
            } else {
                console.log(`✅ Profile updated for user: ${checkoutData.user_id}`);
            }
        }

        // Clean up checkout data
        await supabaseAdmin
            .from('checkout_sessions')
            .delete()
            .eq('order_id', OrderID);

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
