'use server'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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

// Zod schema for cart item validation - supports both physical and experience products
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
    // Experience fields (CMS data stored in cart)
    experienceSlug: z.string().optional().nullable(),
    selectedLocation: z.string().nullable().optional(),
    selectedVoucher: z.string().nullable().optional(),
    voucherName: z.string().optional().nullable(),
    additionalItems: z.array(z.string()).optional().nullable(),
    // CMS experience stored addon data
    storedAddons: z.array(storedAddonSchema).optional().nullable(),
    storedLocationName: z.string().optional().nullable(),
    storedVoucherName: z.string().optional().nullable(),
    storedLocationUrl: z.string().optional().nullable(),
    selectedDate: z.string().optional().nullable(), // Raw ISO date for database
    storedSelectedDate: z.string().optional().nullable(), // Formatted for display
})

const requestSchema = z.object({
    cartItems: z.array(cartItemSchema),
    personalInfo: z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        phoneNumber: z.string().min(5),
        address: z.string().min(5),
        city: z.string().min(2),
        postalCode: z.string().min(3),
        country: z.string().min(2),
    }),
})

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

        // 3. Calculate total and validate prices
        let totalAmount = 0
        const validatedItems = []

        for (const item of cartItems) {
            // Check if it's a physical product or experience
            const isPhysicalProduct = item.productType === 'physical' || !item.experienceSlug

            if (isPhysicalProduct) {
                // Handle physical product
                if (!item.price || !item.title) {
                    return NextResponse.json(
                        { error: `Physical product ${item.id} missing price or title` },
                        { status: 400 }
                    )
                }

                const itemTotal = item.price * item.quantity
                totalAmount += itemTotal

                // Format variant options as string
                const optionsStr = item.selectedVariant?.options
                    ? Object.entries(item.selectedVariant.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : ''

                validatedItems.push({
                    type: 'physical',
                    productId: item.id,
                    productTitle: item.title,
                    variant: optionsStr,
                    sku: item.selectedVariant?.sku || '',
                    imageUrl: item.imageUrl || '',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: itemTotal,
                })
            } else {
                // Handle experience product - use storedAddons from cart (CMS data)
                // item.price already includes base price + all selected addons
                const itemPrice = item.price || 0
                const itemTotal = itemPrice * item.quantity
                totalAmount += itemTotal

                // Get addon names from storedAddons (CMS data stored in cart)
                const addonNames = item.storedAddons
                    ?.filter(addon => addon.type === 'standard')
                    .map(addon => addon.name) || []

                // Get location name from storedLocationName
                const locationName = item.storedLocationName || 'N/A'

                // Get voucher type from storedVoucherName
                const voucherType = item.storedVoucherName || 'Digital'

                validatedItems.push({
                    type: 'experience',
                    experienceSlug: item.experienceSlug,
                    experienceTitle: item.title || '',
                    imageUrl: item.imageUrl || '',
                    location: locationName,
                    addons: addonNames,
                    voucherType,
                    voucherRecipientName: item.voucherName || '',
                    selectedDate: item.selectedDate || null,
                    quantity: item.quantity,
                    unitPrice: itemPrice,
                    totalPrice: itemTotal,
                })
            }
        }

        // 4. Create Payment Intent with metadata
        // Split cart items to stay under Stripe's 500 char limit per field
        const itemsMetadata: Record<string, string> = {}
        validatedItems.forEach((item, index) => {
            const itemJson = JSON.stringify(item)
            itemsMetadata[`cart_${index}`] = itemJson.length <= 500
                ? itemJson
                : JSON.stringify({
                    type: item.type,
                    title: (item as any).productTitle || (item as any).experienceTitle || '',
                    qty: item.quantity,
                    total: item.totalPrice
                })
        })

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: 'bgn',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user.id,
                userEmail: personalInfo.email,
                fullName: personalInfo.fullName,
                phoneNumber: personalInfo.phoneNumber,
                address: personalInfo.address,
                city: personalInfo.city,
                postalCode: personalInfo.postalCode,
                country: personalInfo.country,
                itemCount: String(validatedItems.length),
                ...itemsMetadata,
            },
        })

        // 5. Return client secret to frontend
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount,
        })

    } catch (error) {
        console.error('Payment Intent creation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}
