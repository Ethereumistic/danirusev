'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { Profile } from '@/types/supabase'
import { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { MapPin, Video, Disc, Camera, Fuel, Trash, Plus, Minus, Smartphone, Gift } from 'lucide-react'
import { DRIFT_EXPERIENCES } from '@/lib/drift-data'
import { getBorderColor, getTextColor, getBgColor, getBorderStyle } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CheckoutFormProps {
  profile: Profile | null
}

// Icon mapping for additional items
const additionalItemIcons: { [key: string]: any } = {
  'gopro': Video,
  'extra-tires': Disc,
  'extra-fuel': Fuel,
  'photo-session': Camera,
  'voucher-digital': Smartphone,
  'voucher-physical': Gift,
  'location-tryavna': MapPin,
  'location-sevlievo': MapPin,
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
  const { items, removeItem, increaseQuantity, decreaseQuantity, toggleCartItemAdditional, updateCartItemLocation, updateCartItemVoucher, updateCartItemVoucherName, clearCart } = useCartStore()
  const [hoveredAddon, setHoveredAddon] = useState<string | null>(null)

  // Personal info state
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? '')
  const [country, setCountry] = useState(profile?.country ?? 'България')

  // Payment Intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  // Calculate item total price including addons and vouchers (per unit)
  const getItemTotalPrice = (item: any): number => {
    let total = parseFloat(item.price) || 0 // Ensure we start with a valid number

    if (item.additionalItems && item.additionalItems.length > 0 && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)
      if (experience && experience.additionalItems) {
        item.additionalItems.forEach((additionalId: string) => {
          const additionalItem = experience.additionalItems?.find(add => add.id === additionalId)
          if (additionalItem && additionalItem.price > 0) {
            total += additionalItem.price
          }
        })
      }
    }

    // Add selected voucher price
    if (item.selectedVoucher && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)
      if (experience && experience.additionalItems) {
        const voucherItem = experience.additionalItems.find(add => add.id === item.selectedVoucher)
        if (voucherItem && voucherItem.price > 0) {
          total += voucherItem.price
        }
      }
    }

    return total
  }

  // Calculate subtotal including additional items and vouchers
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      let itemTotal = getItemTotalPrice(item) * item.quantity

      // Add additional items prices
      if (item.additionalItems && item.additionalItems.length > 0 && item.experienceSlug) {
        const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)
        if (experience && experience.additionalItems) {
          item.additionalItems.forEach(additionalId => {
            const additionalItem = experience.additionalItems?.find(add => add.id === additionalId)
            if (additionalItem && additionalItem.price > 0) {
              itemTotal += additionalItem.price * item.quantity
            }
          })
        }
      }

      // Add selected voucher price
      if (item.selectedVoucher && item.experienceSlug) {
        const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)
        if (experience && experience.additionalItems) {
          const voucherItem = experience.additionalItems.find(add => add.id === item.selectedVoucher)
          if (voucherItem && voucherItem.price > 0) {
            itemTotal += voucherItem.price * item.quantity
          }
        }
      }

      return acc + itemTotal
    }, 0)
  }, [items])

  // Create Payment Intent when ready to pay
  const handleCreatePaymentIntent = async () => {
    // Validate personal info
    if (!fullName || !email || !phoneNumber || !address || !city || !postalCode || !country) {
      toast.error('Моля, попълнете всички полета')
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
            experienceSlug: item.experienceSlug,
            quantity: item.quantity,
            selectedLocation: item.selectedLocation,
            selectedVoucher: item.selectedVoucher,
            voucherName: item.voucherName,
            additionalItems: item.additionalItems,
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
      toast.success('Готово за плащане')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Грешка при създаване на плащане')
    } finally {
      setIsLoadingPayment(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-white">Вашата количка е празна</div>
          <p className="text-slate-400">Добавете преживявания или продукти за да продължите.</p>
          <Button onClick={() => router.push('/xp')} className="mt-4 bg-main hover:bg-main/90 text-black font-bold">
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
                const experience = item.experienceSlug
                  ? DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug)
                  : null
                const itemTotalPrice = getItemTotalPrice(item)

                return (
                  <div
                    key={item.id}
                    className="relative bg-slate-950 rounded-xl border-2 border-slate-800 p-4 hover:border-slate-700 transition-all group"
                  >
                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => removeItem(item.id)}
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
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={`h-7 w-7 rounded-lg ${getBgColor(item.themeColor)} border-transparent hover:opacity-90 text-black`}
                            onClick={() => increaseQuantity(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Dropdowns Row - Location and Voucher side by side */}
                    <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                      {/* Location Dropdown */}
                      {(() => {
                        if (!experience || !experience.additionalItems) return null
                        const locationItems = experience.additionalItems.filter(addItem => addItem.isLocation)
                        if (locationItems.length === 0) return null

                        const selectedLocation = item.selectedLocation || locationItems[0]?.id
                        const selectedLocationDetails = locationItems.find(loc => loc.id === selectedLocation)

                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 w-full justify-start"
                              >
                                <MapPin className="h-3 w-3 mr-2 shrink-0" />
                                <span className="truncate">{selectedLocationDetails?.name || 'Location'}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="bg-slate-900 border-slate-800 z-[60000] w-[200px]"
                              sideOffset={5}
                            >
                              {locationItems.map((location) => (
                                <DropdownMenuItem
                                  key={location.id}
                                  onClick={() => updateCartItemLocation(item.id, location.id)}
                                  className={`cursor-pointer ${selectedLocation === location.id
                                    ? getTextColor(item.themeColor)
                                    : 'text-slate-300'
                                    } hover:bg-slate-800`}
                                >
                                  <MapPin className="h-3 w-3 mr-2" />
                                  {location.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      })()}

                      {/* Voucher Dropdown */}
                      {(() => {
                        if (!experience || !experience.additionalItems) return null
                        const voucherItems = experience.additionalItems.filter(addItem => addItem.isVoucher)
                        if (voucherItems.length === 0) return null

                        const selectedVoucher = item.selectedVoucher || 'voucher-digital'
                        const selectedVoucherDetails = voucherItems.find(v => v.id === selectedVoucher)
                        const VoucherIcon = selectedVoucherDetails ? additionalItemIcons[selectedVoucherDetails.id] : Smartphone

                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 w-full justify-start"
                              >
                                {VoucherIcon && <VoucherIcon className="h-3 w-3 mr-2 shrink-0" />}
                                <span className="truncate">{selectedVoucherDetails?.name || 'Voucher'}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-900 border-slate-800 z-[60000] w-[200px]"
                              sideOffset={5}
                            >
                              {voucherItems.map((voucher) => {
                                const Icon = additionalItemIcons[voucher.id]
                                return (
                                  <DropdownMenuItem
                                    key={voucher.id}
                                    onClick={() => updateCartItemVoucher(item.id, voucher.id)}
                                    className={`cursor-pointer ${selectedVoucher === voucher.id
                                      ? getTextColor(item.themeColor)
                                      : 'text-slate-300'
                                      } hover:bg-slate-800`}
                                  >
                                    {Icon && <Icon className="h-3 w-3 mr-2" />}
                                    {voucher.name} {voucher.price > 0 && `+${voucher.price} BGN`}
                                  </DropdownMenuItem>
                                )
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      })()}
                    </div>

                    {/* Additional Items - Show ALL available items in full-width rows */}
                    {(() => {
                      if (!experience || !experience.additionalItems) return null
                      // Filter out Location AND Vouchers for the list below
                      const regularItems = experience.additionalItems.filter(addItem => !addItem.isLocation && !addItem.isVoucher)
                      if (regularItems.length === 0) return null

                      const selectedAdditionals = item.additionalItems || []

                      return (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Допълнения</h4>
                          <div className="flex flex-col gap-2">
                            {regularItems.map((additionalItem) => {
                              const isSelected = selectedAdditionals.includes(additionalItem.id)
                              const IconComponent = additionalItemIcons[additionalItem.id]
                              const addonKey = `${item.id}-${additionalItem.id}`

                              return (
                                <div
                                  key={additionalItem.id}
                                  onClick={() => toggleCartItemAdditional(item.id, additionalItem.id)}
                                  onMouseEnter={() => setHoveredAddon(addonKey)}
                                  onMouseLeave={() => setHoveredAddon(null)}
                                  className={`
                                    relative flex items-center gap-3 p-3 rounded-lg cursor-pointer
                                    transition-all duration-200
                                    ${isSelected
                                      ? `bg-slate-800 border-2 ${getBorderColor(item.themeColor)}`
                                      : 'bg-slate-900/50 border-2 border-slate-700/50 opacity-40 hover:opacity-70'
                                    }
                                  `}
                                >
                                  {/* Plus/Minus Icon Overlay on Hover */}
                                  <div className={`
                                    absolute inset-0 flex items-center justify-center
                                    bg-black/60 rounded-lg transition-opacity duration-200 z-10
                                    ${hoveredAddon === addonKey ? 'opacity-100' : 'opacity-0'}
                                  `}>
                                    {isSelected ? (
                                      <Minus className="h-6 w-6 text-red-400" />
                                    ) : (
                                      <Plus className={`h-6 w-6 ${getTextColor(item.themeColor)}`} />
                                    )}
                                  </div>

                                  {/* Icon */}
                                  {IconComponent && (
                                    <IconComponent
                                      className={`h-5 w-5 flex-shrink-0 ${isSelected ? getTextColor(item.themeColor) : 'text-slate-500'
                                        }`}
                                    />
                                  )}

                                  {/* Name and Price */}
                                  <div className="flex-1">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-500'
                                      }`}>
                                      {additionalItem.name}
                                    </span>
                                  </div>

                                  {/* Price */}
                                  {additionalItem.price > 0 && (
                                    <span className={`text-base font-black ${isSelected ? getTextColor(item.themeColor) : 'text-slate-600'
                                      }`}>
                                      +{additionalItem.price} BGN
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Voucher Name Input */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <Label htmlFor={`voucher-name-${item.id}`} className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                        Име на ваучера
                      </Label>
                      <Input
                        id={`voucher-name-${item.id}`}
                        type="text"
                        placeholder="Име на получателя (по избор)"
                        value={item.voucherName || ''}
                        onChange={(e) => updateCartItemVoucherName(item.id, e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-main h-10"
                      />

                    </div>
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
          {/* Personal Information Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-white uppercase">Лична Информация</CardTitle>
              <p className="text-sm text-slate-400">Попълнете данните си преди да продължите</p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-700 text-white focus:border-main"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-white uppercase">Плащане</CardTitle>
              <p className="text-sm text-slate-400">Сигурно плащане чрез Stripe</p>
            </CardHeader>
            <CardContent>
              {!clientSecret ? (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}