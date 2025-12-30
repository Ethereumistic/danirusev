'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { Profile } from '@/types/supabase'
import { useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { MapPin, Trash, Plus, Minus, Gift, CalendarDays } from 'lucide-react'
import { getBorderColor, getTextColor, getBgColor, getBorderStyle } from '@/lib/utils'

interface CheckoutFormProps {
  profile: Profile | null
}

// Initialize Stripe outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment Form Component (wrapped in Elements)
function PaymentForm({
  personalInfo,
  onSuccess
}: {
  personalInfo: any
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        setIsProcessing(false)
      } else {
        // Payment succeeded, redirect will happen automatically
        onSuccess()
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 bg-main text-black font-black uppercase tracking-wider hover:bg-main/90 transition-all hover:scale-[1.02]"
      >
        {isProcessing ? 'Обработване...' : 'Плати Сега →'}
      </Button>
    </form>
  )
}

export function CheckoutForm({ profile }: CheckoutFormProps) {
  const router = useRouter()
  const { items, removeItem, increaseQuantity, decreaseQuantity, updateCartItemVoucherName, clearCart } = useCartStore()

  // Personal info state
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? '')
  const [country, setCountry] = useState(profile?.country ?? 'България')

  // Checkout logic states
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  // Determine if physical address is required
  const isPhysicalRequired = useMemo(() => {
    return items.some(item =>
      item.productType === 'physical' ||
      item.storedVoucherName?.toLowerCase().includes('физически') ||
      item.storedVoucherName?.toLowerCase().includes('physical')
    )
  }, [items])

  // Accordion state - open by default
  const [personalInfoOpen, setPersonalInfoOpen] = useState<string | undefined>('personal-info')

  // Item total price - for CMS experiences, price already includes all addons
  const getItemTotalPrice = (item: any): number => {
    return parseFloat(item.price) || 0;
  }

  // Calculate subtotal - for CMS experiences, item.price already includes all addons
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0)
  }, [items])

  // Create Payment Intent when ready to pay
  const handleCreatePaymentIntent = async () => {
    // Validate personal info
    if (!fullName || !email || !phoneNumber) {
      toast.error('Моля, попълнете основните данни')
      return
    }

    if (isPhysicalRequired && (!address || !city || !postalCode || !country)) {
      toast.error('Моля, попълнете адресните данни за доставка')
      return
    }

    setIsLoadingPayment(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(item => ({
            id: item.id,
            productType: item.productType,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            // Physical product fields
            selectedVariant: item.selectedVariant,
            // Experience fields
            experienceSlug: item.experienceSlug,
            selectedLocation: item.selectedLocation,
            selectedVoucher: item.selectedVoucher,
            voucherName: item.voucherName,
            additionalItems: item.additionalItems,
            // CMS experience stored addon data
            storedAddons: item.storedAddons,
            storedLocationName: item.storedLocationName,
            storedVoucherName: item.storedVoucherName,
            storedLocationUrl: item.storedLocationUrl,
            selectedDate: item.selectedDate, // Raw ISO date for database
            storedSelectedDate: item.storedSelectedDate, // Formatted for display
          })),
          personalInfo: {
            fullName,
            email,
            phoneNumber,
            address,
            city,
            postalCode,
            country,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      // Close personal info accordion to make room for Stripe element
      setPersonalInfoOpen(undefined)
      toast.success('Готово за плащане')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Грешка при създаване на плащане')
    } finally {
      setIsLoadingPayment(false)
    }
  }

  // Handle Manual Checkout for 0 BGN orders
  const handleManualCheckout = async () => {
    if (!fullName || !email || !phoneNumber) {
      toast.error('Моля, попълнете основните данни')
      return
    }

    if (isPhysicalRequired && (!address || !city || !postalCode || !country)) {
      toast.error('Моля, попълнете адресните данни за доставка')
      return
    }

    setIsSubmittingManual(true)

    try {
      const response = await fetch('/api/create-manual-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(item => ({
            id: item.id,
            productType: item.productType,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            selectedVariant: item.selectedVariant,
            experienceSlug: item.experienceSlug,
            selectedLocation: item.selectedLocation,
            selectedVoucher: item.selectedVoucher,
            voucherName: item.voucherName,
            additionalItems: item.additionalItems,
            storedAddons: item.storedAddons,
            storedLocationName: item.storedLocationName,
            storedVoucherName: item.storedVoucherName,
            storedLocationUrl: item.storedLocationUrl,
            selectedDate: item.selectedDate,
            storedSelectedDate: item.storedSelectedDate,
          })),
          personalInfo: {
            fullName,
            email,
            phoneNumber,
            address,
            city,
            postalCode,
            country,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const data = await response.json()
      toast.success('Вашата заявка беше изпратена успешно!')
      clearCart()
      router.push(`/order-confirmation?order_id=${data.orderId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Грешка при изпращане на заявката')
    } finally {
      setIsSubmittingManual(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-white">Вашата количка е празна</div>
          <p className="text-slate-400">Добавете преживявания или продукти за да продължите.</p>
          <Button onClick={() => router.push('/#drift-experiences')} className="mt-4 bg-main hover:bg-main/90 text-black font-bold">
            Разгледай Преживявания
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side: Order Summary */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white uppercase">Вашата Поръчка ({items.length})</CardTitle>
            <p className="text-sm text-slate-400">Прегледайте избраните преживявания преди плащане</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map(item => {
                const itemTotalPrice = getItemTotalPrice(item)

                return (
                  <div
                    key={item.cartItemId}
                    className="relative bg-slate-950 rounded-xl border-2 border-slate-800 p-4 hover:border-slate-700 transition-all group"
                  >
                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>

                    <div className="flex items-start gap-4">
                      {/* Experience Image with colored border */}
                      {item.imageUrl ? (
                        <div className={`relative flex-shrink-0 h-24 w-24 rounded-xl overflow-hidden shadow-lg border-4 ${getBorderStyle(item.themeColor)} ${getBorderColor(item.themeColor)}`}>
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`relative flex-shrink-0 h-24 w-24 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border-4 ${getBorderStyle(item.themeColor)} ${getBorderColor(item.themeColor)}`}>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="font-black text-base text-white uppercase italic tracking-tight line-clamp-2 mb-2">
                          {item.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-2xl font-black ${getTextColor(item.themeColor)}`}>
                            {itemTotalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-slate-400">BGN</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg border-slate-700 bg-slate-800 hover:bg-slate-700"
                            onClick={() => decreaseQuantity(item.cartItemId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={`h-7 w-7 rounded-lg ${getBgColor(item.themeColor)} border-transparent hover:opacity-90 text-black`}
                            onClick={() => increaseQuantity(item.cartItemId)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Physical Product: Variant Options Display */}
                    {item.productType === 'physical' && item.selectedVariant?.options && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.selectedVariant.options).map(([key, val]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300"
                            >
                              {key}: <span className="text-white font-bold">{String(val)}</span>
                            </span>
                          ))}
                        </div>
                        {item.selectedVariant.sku && (
                          <p className="text-xs text-slate-500 mt-2 font-mono">
                            SKU: {item.selectedVariant.sku}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Experience: Static display of location and voucher */}
                    {item.productType === 'experience' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                        {/* Location Display */}
                        {item.storedLocationName && (
                          <div className="h-8 px-3 flex items-center text-xs border border-slate-700 bg-slate-800 rounded-md w-full">
                            <MapPin className="h-3 w-3 mr-2 shrink-0" />
                            <span className="truncate text-slate-300">{item.storedLocationName}</span>
                          </div>
                        )}

                        {/* Voucher Display */}
                        {item.storedVoucherName && (
                          <div className="h-8 px-3 flex items-center text-xs border border-slate-700 bg-slate-800 rounded-md w-full">
                            <Gift className="h-3 w-3 mr-2 shrink-0" />
                            <span className="truncate text-slate-300">{item.storedVoucherName}</span>
                          </div>
                        )}

                        {/* Selected Date Display */}
                        {item.storedSelectedDate && (
                          <div className="h-8 px-3 flex items-center text-xs border border-slate-700 bg-slate-800 rounded-md w-full col-span-2">
                            <CalendarDays className="h-3 w-3 mr-2 shrink-0" />
                            <span className="truncate text-slate-300">{item.storedSelectedDate}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Experience: Static display of selected addons */}
                    {item.productType === 'experience' && item.storedAddons && item.storedAddons.length > 0 && (
                      (() => {
                        const standardAddons = item.storedAddons.filter(addon => addon.type === 'standard');
                        if (standardAddons.length === 0) return null;

                        return (
                          <div className="mt-4 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Избрани Допълнения</h4>
                            <div className="flex flex-col gap-2">
                              {standardAddons.map((addon) => (
                                <div
                                  key={addon.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg bg-slate-800 border-2 ${getBorderColor(item.themeColor)}`}
                                >
                                  <div className="flex-1">
                                    <span className="text-sm font-bold text-white">
                                      {addon.name}
                                    </span>
                                  </div>
                                  {addon.price > 0 && (
                                    <span className={`text-base font-black ${getTextColor(item.themeColor)}`}>
                                      +{addon.price} BGN
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Voucher Name Input - Only for experiences */}
                    {item.experienceSlug && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor={`voucher-name-${item.cartItemId}`} className="text-xs font-bold text-slate-400 uppercase block">
                            Име на ваучера
                          </Label>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {item.voucherName?.length || 0}/16
                          </span>
                        </div>
                        <Input
                          id={`voucher-name-${item.cartItemId}`}
                          type="text"
                          maxLength={16}
                          placeholder="Име на получателя (по избор)"
                          value={item.voucherName || ''}
                          onChange={(e) => updateCartItemVoucherName(item.cartItemId, e.target.value.slice(0, 16))}
                          className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-main h-10"
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              <Separator className="bg-slate-800 my-4" />

              <div className="space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Междинна сума</span>
                  <span className="text-sm font-medium text-white">{subtotal.toFixed(2)} BGN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Доставка</span>
                  <span className="text-xs text-slate-500">При плащане</span>
                </div>
                <Separator className="bg-slate-800 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white uppercase">Общо</span>
                  <span className="text-2xl font-black text-main">{subtotal.toFixed(2)} BGN</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Personal Information & Payment */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Personal Information Accordion */}
          <Accordion
            type="single"
            collapsible
            value={personalInfoOpen}
            onValueChange={setPersonalInfoOpen}
            className="w-full"
          >
            <AccordionItem value="personal-info" className="border-none">
              <Card className="bg-slate-900 border-slate-800">
                <AccordionTrigger className="w-full px-6 py-4 hover:no-underline">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-2xl font-black text-white uppercase">Лична Информация</span>
                    <span className="text-sm text-slate-400">Попълнете данните си преди да продължите</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-300 font-bold">Име и Фамилия</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-700 text-white focus:border-main"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300 font-bold">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-700 text-white focus:border-main"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-slate-300 font-bold">Тел. Номер</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-700 text-white focus:border-main"
                      />
                    </div>
                    {isPhysicalRequired && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-slate-300 font-bold">Адрес</Label>
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-700 text-white focus:border-main"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-slate-300 font-bold">Град</Label>
                            <Input
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                              className="bg-slate-950 border-slate-700 text-white focus:border-main"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-slate-300 font-bold">Пощенски код</Label>
                            <Input
                              id="postalCode"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              required
                              className="bg-slate-950 border-slate-700 text-white focus:border-main"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-slate-300 font-bold">Държава</Label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                <img src="https://flagcdn.com/bg.svg" alt="Bulgaria" className="w-5 h-auto rounded-sm" />
                              </div>
                              <Input
                                id="country"
                                value="България"
                                disabled
                                className="bg-slate-900 border-slate-700 text-white pl-12 disabled:opacity-100 disabled:cursor-default"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>

          {/* Payment Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-white uppercase">Плащане</CardTitle>
              <p className="text-sm text-slate-400">Сигурно плащане чрез Stripe</p>
            </CardHeader>
            <CardContent>
              {subtotal > 0 ? (
                !clientSecret ? (
                  <Button
                    onClick={handleCreatePaymentIntent}
                    disabled={isLoadingPayment}
                    className="w-full h-12 bg-main text-black font-black uppercase tracking-wider hover:bg-main/90 transition-all hover:scale-[1.02]"
                  >
                    {isLoadingPayment ? 'Подготовка...' : 'Продължи към плащане →'}
                  </Button>
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      personalInfo={{ fullName, email, phoneNumber, address, city, postalCode, country }}
                      onSuccess={clearCart}
                    />
                  </Elements>
                )
              ) : (
                <Button
                  onClick={handleManualCheckout}
                  disabled={isSubmittingManual}
                  className="w-full h-12 bg-main text-black font-black uppercase tracking-wider hover:bg-main/90 transition-all hover:scale-[1.02]"
                >
                  {isSubmittingManual ? 'Изпращане...' : 'Потвърди Заявка →'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}