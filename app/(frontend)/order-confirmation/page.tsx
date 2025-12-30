'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { CheckCircle, Package } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderDetails {
  customerName: string
  amount: number
  currency: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')
  const orderIdParam = searchParams.get('order_id')
  const { clearCart } = useCartStore()

  const [details, setDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (paymentIntent || orderIdParam) {
      // Clear the cart
      clearCart()

      const fetchDetails = async () => {
        try {
          const endpoint = paymentIntent
            ? `/api/payment-intent/details?payment_intent=${paymentIntent}`
            : `/api/orders/details?order_id=${orderIdParam}`

          const res = await fetch(endpoint)
          if (!res.ok) throw new Error('Order not found')
          const data = await res.json()
          setDetails(data)
        } catch (err) {
          setError(true)
        } finally {
          setLoading(false)
        }
      }
      fetchDetails()
    } else {
      setError(true)
      setLoading(false)
    }
  }, [paymentIntent, orderIdParam, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-col items-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full bg-slate-800" />
              <Skeleton className="h-10 w-3/4 bg-slate-800" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-6 w-full bg-slate-800" />
              <Skeleton className="h-5 w-full bg-slate-800" />
              <div className="pt-4 flex justify-center space-x-4">
                <Skeleton className="h-10 w-32 bg-slate-800" />
                <Skeleton className="h-10 w-40 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-black uppercase">Грешка</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Невалидна поръчка или възникна грешка.</p>
              <Button asChild variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                <Link href="/">Начало</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-main" />
            <CardTitle className="text-4xl text-main font-black uppercase text-center">
              {details?.amount === 0 ? 'Заявката е изпратена!' : 'Плащането е успешно!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-white">
                Благодарим Ви, {details?.customerName || ''}!
              </p>
              <p className="text-slate-400">
                Вашата поръчка беше приета и се обработва.
              </p>
            </div>

            {details && details.amount > 0 && (
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Обща сума:</span>
                  <span className="text-2xl font-black text-main">
                    {(details.amount / 100).toFixed(2)} {details.currency.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <p className="text-slate-400 text-center text-sm">
              {details?.amount === 0
                ? 'Ще Ви се обадим скоро за да обсъдим всички детайли за Вашето преживяване.'
                : 'Ако сте закупили преживяване, ще Ви се обадим скоро с всички детайли за Вашето преживяване.'}
            </p>

            <div className="pt-4 flex justify-center space-x-4">
              <Button asChild className="bg-main text-black font-black uppercase hover:bg-main/90">
                <Link href="/orders"><Package /> Моите поръчки</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                <Link href="/">Начало</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
