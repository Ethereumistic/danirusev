import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// Zod schema for stored addon from cart
const storedAddonSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    icon: z.string().optional().nullable(),
    type: z.enum(['standard', 'location', 'voucher']),
    googleMapsUrl: z.string().optional().nullable(),
})

// Zod schema for cart item validation
const cartItemSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    productType: z.enum(['physical', 'experience']).optional(),
    title: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().min(1),
    imageUrl: z.string().optional().nullable(),
    // Physical product fields
    selectedVariant: z.object({
        options: z.record(z.string()).optional(),
        sku: z.string().optional(),
    }).optional().nullable(),
    // Experience fields
    experienceSlug: z.string().optional().nullable(),
    selectedLocation: z.string().nullable().optional(),
    selectedVoucher: z.string().nullable().optional(),
    voucherName: z.string().max(16).optional().nullable(),
    additionalItems: z.array(z.string()).optional().nullable(),
    // CMS experience stored addon data
    storedAddons: z.array(storedAddonSchema).optional().nullable(),
    storedLocationName: z.string().optional().nullable(),
    storedVoucherName: z.string().optional().nullable(),
    storedLocationUrl: z.string().optional().nullable(),
    selectedDate: z.string().optional().nullable(),
    storedSelectedDate: z.string().optional().nullable(),
})

const requestSchema = z.object({
    cartItems: z.array(cartItemSchema),
    personalInfo: z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        phoneNumber: z.string().min(5),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
    }),
})

// Use service role client for order creation (similar to webhook)
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

const supabaseAdmin = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Authenticate the user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            )
        }

        // 2. Parse and validate request body
        const body = await request.json()
        const validation = requestSchema.safeParse(body)

        if (!validation.success) {
            console.error('Validation error:', validation.error.flatten())
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { cartItems, personalInfo } = validation.data

        // 3. Determine if physical address is required
        const isPhysicalRequired = cartItems.some(item =>
            item.productType === 'physical' ||
            item.storedVoucherName?.toLowerCase().includes('физически') ||
            item.storedVoucherName?.toLowerCase().includes('physical')
        )

        // 4. Manual validation if physical is required
        if (isPhysicalRequired) {
            if (!personalInfo.address || personalInfo.address.length < 5) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
            if (!personalInfo.city || personalInfo.city.length < 2) return NextResponse.json({ error: 'City is required' }, { status: 400 });
            if (!personalInfo.postalCode || personalInfo.postalCode.length < 3) return NextResponse.json({ error: 'Postal code is required' }, { status: 400 });
            if (!personalInfo.country || personalInfo.country.length < 2) return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        // 5. Process items and calculate total
        let totalAmount = 0
        const orderItems = []

        for (const item of cartItems) {
            const itemPrice = item.price || 0
            const itemTotal = itemPrice * item.quantity
            totalAmount += itemTotal

            if (item.productType === 'physical' || !item.experienceSlug) {
                // Physical product
                const optionsStr = item.selectedVariant?.options
                    ? Object.entries(item.selectedVariant.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : ''

                orderItems.push({
                    product_id: item.id,
                    title: item.title || 'Product',
                    quantity: item.quantity,
                    price: itemPrice,
                    variant: optionsStr,
                    sku: item.selectedVariant?.sku || '',
                    item_type: 'physical',
                    image_url: item.imageUrl || null,
                    location: null,
                    addons: null,
                    voucher_type: null,
                    voucher_recipient_name: null,
                    selected_date: null,
                })
            } else {
                // Experience
                const addonNames = item.storedAddons
                    ?.filter(addon => addon.type === 'standard')
                    .map(addon => addon.name) || []

                orderItems.push({
                    product_id: item.experienceSlug || item.id,
                    title: item.title || 'Experience',
                    quantity: item.quantity,
                    price: itemPrice,
                    variant: '',
                    sku: '',
                    item_type: 'experience',
                    image_url: item.imageUrl || null,
                    location: item.storedLocationName || null,
                    addons: addonNames,
                    voucher_type: item.storedVoucherName || null,
                    voucher_recipient_name: item.voucherName || null,
                    selected_date: item.selectedDate || null,
                })
            }
        }

        // 4. Create manual order ID (to satisfy idempotency or just distinguish)
        const manualOrderId = `manual_${Date.now()}_${user.id.slice(0, 8)}`

        // 5. Call Database Function to create order
        const { data: orderId, error: orderError } = await supabaseAdmin.rpc('create_order_from_webhook', {
            p_user_id: user.id,
            p_total_price: totalAmount,
            p_shipping_address_snapshot: {
                ...personalInfo,
                email: personalInfo.email,
                address: personalInfo.address || '',
                city: personalInfo.city || '',
                postalCode: personalInfo.postalCode || '',
                country: personalInfo.country || '',
            },
            p_cart_items: orderItems,
            p_stripe_payment_intent_id: manualOrderId, // Use manual ID as "payment intent"
        })

        if (orderError) {
            console.error('Error creating manual order:', orderError)
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
        }

        // 6. Update Profile
        const { error: profileError } = await supabaseAdmin.rpc('update_profile_from_checkout', {
            p_user_id: user.id,
            p_full_name: personalInfo.fullName,
            p_phone_number: personalInfo.phoneNumber,
            p_address: personalInfo.address || '',
            p_city: personalInfo.city || '',
            p_postal_code: personalInfo.postalCode || '',
            p_country: personalInfo.country || '',
            p_email: personalInfo.email,
        })

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // Still proceed since order was created
        }

        return NextResponse.json({
            success: true,
            orderId
        })

    } catch (error) {
        console.error('Manual order creation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}
