'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { Profile } from '@/types/supabase'
import { useActionState, useEffect, useMemo } from 'react'
import { useFormStatus } from 'react-dom'
import { createCheckoutSession, CheckoutFormState } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'

interface CheckoutFormProps {
  profile: Profile | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-main hover:bg-main/80 text-alt"
    >
      {pending ? 'Зареждане...' : 'Продължи към плащане'}
    </Button>
  )
}

// Initialize Stripe outside the component to avoid re-creating it on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
)

export function CheckoutForm({ profile }: CheckoutFormProps) {
  const router = useRouter()
  const { items, clearCart } = useCartStore()

  const initialState: CheckoutFormState = {
    success: false,
    message: null,
    fieldErrors: {},
    sessionId: null,
  }
  const [state, formAction] = useActionState(createCheckoutSession, initialState)

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + parseFloat(item.price as any) * item.quantity,
      0,
    )
  }, [items])

  useEffect(() => {
    const handleRedirect = async () => {
      if (state.success && state.sessionId) {
        toast.success(state.message || 'Redirecting to payment...')
        const stripe = await stripePromise
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: state.sessionId,
          })
          if (error) {
            toast.error(error.message || 'Failed to redirect to Stripe.')
          } else {
            // On successful redirect, clear the cart
            clearCart()
          }
        } else {
          toast.error('Stripe could not be loaded.')
        }
      } else if (!state.success && state.message) {
        toast.error(state.message)
      }
    }
    handleRedirect()
  }, [state, clearCart])

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p>Вашата количка е празна.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Продължи с пазаруването
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Преживяване / Продукт</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Брой: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {(parseFloat(item.price as any) * item.quantity).toFixed(
                        2,
                      )}{' '}
                      лв.
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Общо</p>
                  <p>{subtotal.toFixed(2)} лв.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Shipping Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Информация за доставка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden fields to pass cart data to the server action */}
              <input
                type="hidden"
                name="cartItems"
                value={JSON.stringify(
                  items.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                  })),
                )}
              />
              {/* The total price is now calculated on the server */}

              <div className="space-y-2">
                <Label htmlFor="fullName">Име и Фамилия</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.full_name ?? ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Тел. Номер</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  defaultValue={profile?.phone_number ?? ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={profile?.address ?? ''}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Град</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={profile?.city ?? ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Пощенски код</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    defaultValue={profile?.postal_code ?? ''}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Държава</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={profile?.country ?? ''}
                  required
                />
              </div>
              <div className="pt-4">
                <SubmitButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
