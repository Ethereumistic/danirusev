
// 'use server'

export const dynamic = 'force-dynamic'

// export interface CreateCheckoutParams {
//   items: {
//     price: string; // Stripe price ID
//     quantity: number;
//   }[];
//   successUrl: string;
//   cancelUrl: string;
//   metadata?: Record<string, string>;
// }

// export async function createCheckoutSession({
//   items,
//   successUrl,
//   cancelUrl,
//   metadata = {},
// }: CreateCheckoutParams) {
//   const session = await stripe.checkout.sessions.create({
//     mode: 'payment',
//     payment_method_types: ['card'],
//     line_items: items,
//     success_url: successUrl,
//     cancel_url: cancelUrl,
//     metadata,
//   });

//   return session;
// }

// export async function createPaymentIntent({
//   amount,
//   currency = 'usd',
//   metadata = {},
// }: {
//   amount: number;
//   currency?: string;
//   metadata?: Record<string, string>;
// }) {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount,
//     currency,
//     metadata,
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   return paymentIntent;
// } 