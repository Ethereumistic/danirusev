import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};

export type StripeCustomer = Stripe.Customer;
export type StripePrice = Stripe.Price;
export type StripeProduct = Stripe.Product;
export type StripePaymentIntent = Stripe.PaymentIntent; 