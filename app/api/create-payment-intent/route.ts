'use server'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { DRIFT_EXPERIENCES } from '@/lib/drift-data'
import { z } from 'zod'

// Zod schema for cart item validation
const cartItemSchema = z.object({
    id: z.string(),
    experienceSlug: z.string(),
    quantity: z.number().min(1),
    selectedLocation: z.string().nullable(),
    selectedVoucher: z.string().nullable(),
    voucherName: z.string().optional(),
    additionalItems: z.array(z.string()).optional(),
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
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { cartItems, personalInfo } = validation.data

        // 3. Calculate total and validate prices against drift-data.ts
        let totalAmount = 0
        const validatedItems = []

        for (const item of cartItems) {
            // Find the experience in hardcoded data
            const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)

            if (!experience) {
                return NextResponse.json(
                    { error: `Experience ${item.experienceSlug} not found` },
                    { status: 400 }
                )
            }

            // Calculate item price: base + addons + voucher
            let itemPrice = experience.price

            // Add additional items prices
            if (item.additionalItems && experience.additionalItems) {
                for (const addonId of item.additionalItems) {
                    const addon = experience.additionalItems.find(a => a.id === addonId)
                    if (addon) {
                        itemPrice += addon.price
                    }
                }
            }

            // Add voucher price
            if (item.selectedVoucher && experience.additionalItems) {
                const voucher = experience.additionalItems.find(v => v.id === item.selectedVoucher)
                if (voucher) {
                    itemPrice += voucher.price
                }
            }

            const itemTotal = itemPrice * item.quantity
            totalAmount += itemTotal

            // Get location name
            const locationName = item.selectedLocation && experience.additionalItems
                ? experience.additionalItems.find(l => l.id === item.selectedLocation)?.name || 'N/A'
                : 'N/A'

            // Get addon names
            const addonNames = item.additionalItems && experience.additionalItems
                ? item.additionalItems.map(id =>
                    experience.additionalItems?.find(a => a.id === id)?.name || id
                )
                : []

            // Get voucher type
            const voucherType = item.selectedVoucher && experience.additionalItems
                ? experience.additionalItems.find(v => v.id === item.selectedVoucher)?.name || 'Digital'
                : 'Digital'

            validatedItems.push({
                experienceSlug: item.experienceSlug,
                experienceTitle: experience.title,
                location: locationName,
                addons: addonNames,
                voucherType,
                voucherRecipientName: item.voucherName || '',
                quantity: item.quantity,
                unitPrice: itemPrice,
                totalPrice: itemTotal,
            })
        }

        // 4. Create Payment Intent with metadata
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
                // Store cart details as JSON string (Stripe metadata has 500 char limit per field)
                cartItems: JSON.stringify(validatedItems),
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
