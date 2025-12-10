'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { z } from 'zod'

// Zod schema for a single cart item
const cartItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.coerce.number(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
})

// Zod schema for the checkout form data
const checkoutFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  phoneNumber: z.string().min(5, 'Phone number must be at least 5 characters'),
  cartItems: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val)
      return z.array(cartItemSchema).parse(parsed)
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid cart items format.',
      })
      return z.NEVER
    }
  }),
})

// Define the shape of the state returned by the server action
export interface CheckoutFormState {
  success: boolean
  message: string | null
  fieldErrors?: Record<string, string[] | undefined>
  sessionId?: string | null
}

export async function createCheckoutSession(
  prevState: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  // FIX: Await the headers() call to get the actual Headers object.
  const headersList = await headers()
  const origin = headersList.get('origin')!
  const supabase = await createClient()

  // 1. Authenticate the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'User not authenticated.' }
  }

  // 2. Validate the form data
  const rawData = Object.fromEntries(formData.entries())
  const validation = checkoutFormSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check the fields.',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { data: validatedData } = validation

  try {
    // 3. Verify experience prices against the database
    // NOTE: Commented out for drift experiences which use hardcoded data
    // const experienceIds = validatedData.cartItems.map(item => item.id)
    // const { data: experiences, error: experiencesError } = await supabase
    //   .from('experiences')
    //   .select('id, price')
    //   .in('id', experienceIds)

    // if (experiencesError) {
    //   throw new Error(`Database error: ${experiencesError.message}`)
    // }

    // // Create a map for quick price lookup
    // const experiencePriceMap = new Map(experiences.map(p => [p.id, p.price]))

    // 4. Prepare line items for Stripe
    const line_items = validatedData.cartItems.map(item => {
      // Skip database validation for drift experiences (hardcoded in drift-data.ts)
      // const dbPrice = experiencePriceMap.get(item.id)
      // if (dbPrice === undefined) {
      //   throw new Error(`Experience with ID ${item.id} not found.`)
      // }
      // // Ensure the price from the cart matches the database price
      // if (item.price !== dbPrice) {
      //   throw new Error(
      //     `Price mismatch for product ${item.title}. Please refresh your cart.`,
      //   )
      // }
      return {
        price_data: {
          currency: 'bgn', // Change currency if needed
          product_data: {
            name: item.title,
            // You can add more product details here if you want
            metadata: {
              productId: item.id,
            },
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: item.quantity,
      }
    })

    // 5. Create the shipping address snapshot
    const shippingAddressSnapshot = {
      fullName: validatedData.fullName,
      address: validatedData.address,
      city: validatedData.city,
      postalCode: validatedData.postalCode,
      country: validatedData.country,
      phoneNumber: validatedData.phoneNumber,
      email: user.email,
    }

    // 6. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        userId: user.id,
        // We stringify the address and cart to pass them through metadata
        shippingAddress: JSON.stringify(shippingAddressSnapshot),
        cartItems: JSON.stringify(
          validatedData.cartItems.map(item => ({
            product_id: String(item.id),
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          })),
        ),
      },
    })

    if (!session.id) {
      throw new Error('Could not create Stripe session.')
    }

    // 7. Return the session ID to the client
    return {
      success: true,
      message: 'Redirecting to payment...',
      sessionId: session.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error('Checkout session creation failed:', errorMessage)
    return { success: false, message: errorMessage }
  }
}
