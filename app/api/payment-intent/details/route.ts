'use server'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Authenticate the user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            )
        }

        // Get payment_intent ID from query params
        const searchParams = request.nextUrl.searchParams
        const paymentIntentId = searchParams.get('payment_intent')

        if (!paymentIntentId) {
            return NextResponse.json(
                { error: 'Missing payment_intent parameter' },
                { status: 400 }
            )
        }

        // Retrieve the Payment Intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

        // Verify this payment belongs to the authenticated user
        if (paymentIntent.metadata.userId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized access to this payment' },
                { status: 403 }
            )
        }

        // Parse cart items from metadata
        const cartItems = JSON.parse(paymentIntent.metadata.cartItems || '[]')

        // Return formatted details for the confirmation page
        return NextResponse.json({
            customerName: paymentIntent.metadata.fullName,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            items: cartItems,
        })

    } catch (error) {
        console.error('Payment Intent retrieval error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}
