'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface PaymentIntentDetails {
  customerName: string
  amount: number
  currency: string
  items: Array<{
    experienceTitle: string
    location: string
    addons: string[]
    voucherType: string
    voucherRecipientName: string
    quantity: number
  }>
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')
  const { clearCart } = useCartStore()

  const [details, setDetails] = useState<PaymentIntentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (paymentIntent) {
      // Clear the cart as soon as we land on this page with a payment intent
      clearCart()

      const fetchPaymentDetails = async () => {
        try {
          const res = await fetch(`/api/payment-intent/details?payment_intent=${paymentIntent}`)
          if (!res.ok) throw new Error('Payment not found')
          const data = await res.json()
          setDetails(data)
        } catch (err) {
          setError(true)
        } finally {
          setLoading(false)
        }
      }
      fetchPaymentDetails()
    } else {
      setError(true)
      setLoading(false)
    }
  }, [paymentIntent, clearCart])

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
              Плащането е успешно!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-white text-center">
              Благодарим Ви, {details?.customerName || 'клиент'}! Вашата поръчка се обработва.
            </p>

            {details && details.items.length > 0 && (
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Детайли на поръчката</h3>
                <div className="space-y-3">
                  {details.items.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-black text-white uppercase text-sm mb-1">{item.experienceTitle}</h4>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>📍 {item.location}</p>
                        {item.addons.length > 0 && (
                          <p>➕ {item.addons.join(', ')}</p>
                        )}
                        <p>🎟️ {item.voucherType}</p>
                        {item.voucherRecipientName && (
                          <p>🎁 За: {item.voucherRecipientName}</p>
                        )}
                        <p className="text-main font-bold">Брой: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Обща сума:</span>
                  <span className="text-2xl font-black text-main">
                    {(details.amount / 100).toFixed(2)} {details.currency.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <p className="text-slate-400 text-center text-sm">
              Ще получите имейл за потвърждение съвсем скоро с всички детайли за вашето преживяване.
            </p>

            <div className="pt-4 flex justify-center space-x-4">
              <Button asChild className="bg-main text-black font-black uppercase hover:bg-main/90">
                <Link href="/xp">Още Преживявания</Link>
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
