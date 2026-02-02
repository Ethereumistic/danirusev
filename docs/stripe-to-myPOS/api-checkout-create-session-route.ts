// app/api/checkout/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateOrderID } from '@/lib/mypos';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create Checkout Session
 * 
 * This endpoint stores checkout data before the user proceeds to payment.
 * The data is retrieved later by the webhook when payment completes.
 * 
 * This replaces the Stripe "create payment intent" endpoint.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            userId,
            cartItems,
            personalInfo,
        } = body;

        // Validate request
        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        if (!personalInfo?.fullName || !personalInfo?.email || !personalInfo?.phoneNumber) {
            return NextResponse.json(
                { error: 'Missing required personal information' },
                { status: 400 }
            );
        }

        // Validate cart items against database
        const validatedItems = await validateCartItems(cartItems);

        if (!validatedItems) {
            return NextResponse.json(
                { error: 'Invalid cart items' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = validatedItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0
        );

        // Generate unique order ID
        const orderID = generateOrderID();

        // Store checkout session
        // Option 1: Using Supabase table (create this table)
        const { error: sessionError } = await supabaseAdmin
            .from('checkout_sessions')
            .insert({
                order_id: orderID,
                user_id: userId,
                email: personalInfo.email,
                full_name: personalInfo.fullName,
                phone_number: personalInfo.phoneNumber,
                address: personalInfo.address,
                city: personalInfo.city,
                postal_code: personalInfo.postalCode,
                country: personalInfo.country,
                cart_items: validatedItems,
                total_amount: totalAmount,
                currency: 'EUR',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            });

        if (sessionError) {
            console.error('Error creating checkout session:', sessionError);
            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            );
        }

        // Option 2: Using Redis (if available)
        // const redis = createRedisClient();
        // await redis.setex(
        //   `checkout:${orderID}`,
        //   86400, // 24 hours TTL
        //   JSON.stringify({
        //     userId,
        //     ...personalInfo,
        //     cartItems: validatedItems,
        //     totalAmount,
        //   })
        // );

        // Return order ID and payment configuration
        return NextResponse.json({
            orderID,
            totalAmount,
            currency: 'EUR',
            cartItems: validatedItems.map(item => ({
                article: item.productTitle || item.experienceTitle,
                quantity: item.quantity,
                price: item.unitPrice,
                currency: 'EUR',
            })),
        });

    } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Validate cart items against database
 * This prevents price manipulation
 */
async function validateCartItems(cartItems: any[]) {
    try {
        const validatedItems = [];

        for (const item of cartItems) {
            let validatedItem: any;

            if (item.productType === 'physical') {
                // Validate physical product
                const { data: product } = await supabaseAdmin
                    .from('products')
                    .select('id, title, price, variants')
                    .eq('id', item.id)
                    .single();

                if (!product) continue;

                // Find variant price if applicable
                let variantPrice = product.price;
                if (item.selectedVariant && product.variants) {
                    const variant = product.variants.find((v: any) =>
                        JSON.stringify(v.options) === JSON.stringify(item.selectedVariant.options)
                    );
                    if (variant) variantPrice = variant.price;
                }

                validatedItem = {
                    type: 'physical',
                    productId: product.id,
                    productTitle: product.title,
                    variant: item.selectedVariant ? JSON.stringify(item.selectedVariant.options) : null,
                    sku: item.selectedVariant?.sku || null,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    unitPrice: variantPrice,
                    totalPrice: variantPrice * item.quantity,
                };

            } else if (item.productType === 'experience') {
                // Validate experience
                const { data: experience } = await supabaseAdmin
                    .from('experiences')
                    .select('id, title, slug, base_price, locations, addons, vouchers, durations')
                    .eq('slug', item.experienceSlug)
                    .single();

                if (!experience) continue;

                let totalPrice = experience.base_price;

                // Calculate addon prices
                if (item.additionalItems?.length > 0 && experience.addons) {
                    for (const addonId of item.additionalItems) {
                        const addon = experience.addons.find((a: any) => a.id === addonId);
                        if (addon) totalPrice += addon.price;
                    }
                }

                // Add location price
                if (item.selectedLocation && experience.locations) {
                    const location = experience.locations.find((l: any) => l.id === item.selectedLocation);
                    if (location) totalPrice += location.price;
                }

                // Add voucher price
                if (item.selectedVoucher && experience.vouchers) {
                    const voucher = experience.vouchers.find((v: any) => v.type === item.selectedVoucher);
                    if (voucher) totalPrice += voucher.price;
                }

                // Add duration price
                if (item.selectedDuration && experience.durations) {
                    const duration = experience.durations.find((d: any) => d.id === item.selectedDuration);
                    if (duration) totalPrice += duration.price;
                }

                validatedItem = {
                    type: 'experience',
                    experienceSlug: experience.slug,
                    experienceTitle: experience.title,
                    imageUrl: item.imageUrl,
                    location: item.selectedLocation,
                    addons: item.additionalItems || [],
                    voucherType: item.selectedVoucher,
                    voucherRecipientName: item.voucherName,
                    selectedDate: item.selectedDate,
                    quantity: item.quantity,
                    unitPrice: totalPrice,
                    totalPrice: totalPrice * item.quantity,
                };
            }

            if (validatedItem) {
                validatedItems.push(validatedItem);
            }
        }

        return validatedItems.length > 0 ? validatedItems : null;

    } catch (error) {
        console.error('Error validating cart items:', error);
        return null;
    }
}

// Export route segment config
export const dynamic = 'force-dynamic';