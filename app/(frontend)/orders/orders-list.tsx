'use client'

import {
  getExperienceThemeColor,
  getDriftThemeClasses,
  getExperienceIcon,
  getAddonIcon,
  type ThemeColor
} from '@/lib/utils'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import Image from 'next/image'
import {
  Package,
  MapPin,
  Gift,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  Ticket
} from 'lucide-react'

// Define the types based on the updated database structure
type OrderItem = {
  id: number
  quantity: number
  price: string
  title: string
  product_id: string
  variant?: string
  sku?: string
  item_type?: string
  image_url?: string
  location?: string
  addons?: string[]
  voucher_type?: string
  voucher_recipient_name?: string
  selected_date?: string
  voucher_id?: string
}

type ShippingAddress = {
  fullName: string
  address: string
  city: string
  country: string
  postalCode: string
  phoneNumber: string
  email: string
}

type Order = {
  id: number
  created_at: string
  total_price: string
  status: string
  shipping_address_snapshot: ShippingAddress
  order_items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[] | null
}

// Status configuration
const statusConfig: Record<string, { color: string, icon: React.ElementType, bgColor: string }> = {
  'Pending': { color: 'text-yellow-400', icon: Clock, bgColor: 'bg-yellow-400/10 border-yellow-400/30' },
  'pending': { color: 'text-yellow-400', icon: Clock, bgColor: 'bg-yellow-400/10 border-yellow-400/30' },
  'approved': { color: 'text-blue-400', icon: CheckCircle, bgColor: 'bg-blue-400/10 border-blue-400/30' },
  'shipped': { color: 'text-purple-400', icon: Truck, bgColor: 'bg-purple-400/10 border-purple-400/30' },
  'delivered': { color: 'text-green-400', icon: CheckCircle, bgColor: 'bg-green-400/10 border-green-400/30' },
}

export function OrdersList({ orders }: OrdersListProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50">
        <ShoppingBag className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Нямате поръчки</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Когато направите поръчка, тя ще се появи тук.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="bg-main hover:bg-main/90 text-black font-bold px-8">
            <Link href="/#drift-experiences">Разгледай преживяванията</Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800 text-white font-bold px-8">
            <Link href="/shop">Магазин</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedOrder === order.id
        const status = statusConfig[order.status] || statusConfig['Pending']
        const StatusIcon = status.icon

        return (
          <div
            key={order.id}
            className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
          >
            {/* Order Header - Clickable */}
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="w-full p-5 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className={`p-3 rounded-xl ${status.bgColor}`}>
                  <StatusIcon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div>
                  <p className="font-black text-lg text-white">Поръчка #{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  className={`${status.bgColor} ${status.color} border font-bold uppercase text-xs px-3 py-1`}
                >
                  {order.status === 'Pending' ? 'Изчакване' :
                    order.status === 'approved' ? 'Одобрена' :
                      order.status === 'shipped' ? 'Изпратена' :
                        order.status === 'delivered' ? 'Доставена' : order.status}
                </Badge>
                <div className="text-right">
                  <p className="text-2xl font-black text-main">{parseFloat(order.total_price).toFixed(2)}</p>
                  <p className="text-xs font-bold text-slate-500">EUR</p>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-800">
                <div className="p-4 md:p-5 space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-black text-sm text-slate-400 uppercase mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Продукти / Преживявания
                    </h3>
                    <div className="space-y-4">
                      {order.order_items.map(item => {
                        // Get theme color for experiences
                        const themeColor = item.item_type === 'experience'
                          ? getExperienceThemeColor(item.title)
                          : 'main'
                        const theme = getDriftThemeClasses(themeColor)
                        const ExperienceIcon = getExperienceIcon(themeColor)
                        const selectedDate = item.selected_date ? new Date(item.selected_date) : undefined

                        // Experience item - premium themed card
                        if (item.item_type === 'experience') {
                          const hasAddons = (item.addons && item.addons.length > 0) || item.voucher_type;

                          return (
                            <div
                              key={item.id}
                              className={`relative rounded-2xl overflow-hidden border-2 ${theme.borderFaded} ${theme.shadow} transition-all hover:scale-[1.005]`}
                            >
                              {/* Gradient background */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />

                              {/* Left accent bar */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bg}`} />

                              <div className="relative bg-slate-950/90 p-5 lg:p-7 ml-1.5">
                                {/* Desktop Grid / Mobile Stack */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

                                  {/* Column 1: Experience Meta & Image */}
                                  <div className="flex flex-col h-full">
                                    <div className="flex flex-col gap-4">
                                      <h4 className={`font-black text-xl md:text-2xl text-white uppercase tracking-tight`}>
                                        {item.title}
                                      </h4>

                                      {/* Image with absolute badges */}
                                      <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border-4 ${theme.border} ${theme.borderStyle} shadow-2xl shadow-black/80 ring-1 ring-white/5`}>
                                        {item.image_url ? (
                                          <Image
                                            src={item.image_url}
                                            alt={item.title}
                                            fill
                                            className="object-cover scale-105"
                                          />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center ${theme.bgFaded}`}>
                                            <ExperienceIcon className={`h-20 w-20 ${theme.text}`} />
                                          </div>
                                        )}

                                        {/* Type Badge - Top Right */}
                                        <div className="absolute top-3 right-3">
                                          <Badge className={`text-[10px] md:text-xs font-black uppercase px-2 py-1 ${theme.bg} text-black border-none shadow-lg`}>
                                            Преживяване
                                          </Badge>
                                        </div>

                                        {/* Location - Bottom Left */}
                                        {item.location && (
                                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                            <MapPin className={`h-4 w-4 ${theme.text}`} />
                                            <span className="text-white text-[11px] md:text-xs font-black uppercase leading-none">
                                              {item.location}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Voucher Recipient Box - PUSHED TO BOTTOM */}
                                    {item.voucher_recipient_name && (
                                      <div className={`mt-auto pt-6`}>
                                        <div className={`p-4 rounded-2xl ${theme.bgFaded} border border-white/5 flex items-center gap-4 w-full md:w-fit`}>
                                          <div className={`p-2.5 rounded-xl bg-black/40 border ${theme.borderFaded}`}>
                                            <Gift className={`h-5 w-5 ${theme.text}`} />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Име на ваучер:</span>
                                            <span className={`font-black tracking-tight uppercase ${theme.text}`}>{item.voucher_recipient_name}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Column 2: Addons & Booking Status */}
                                  <div className="flex flex-col h-full lg:pt-14">
                                    {/* Addons at top */}
                                    {hasAddons && (
                                      <div className="flex flex-col gap-4">
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Добавки към пакет</span>
                                        <div className="flex flex-col gap-2.5">
                                          {item.addons?.map((addon, idx) => {
                                            const IconComponent = getAddonIcon(addon);
                                            return (
                                              <div
                                                key={idx}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight ${theme.bgFaded} ${theme.text} border-2 ${theme.borderFaded} w-fit flex items-center gap-3 transition-all`}
                                              >
                                                {IconComponent ? (
                                                  <IconComponent className="h-4 w-4" />
                                                ) : (
                                                  <div className={`w-1.5 h-1.5 rounded-full ${theme.bg} shadow-sm shadow-black shrink-0`} />
                                                )}
                                                {addon}
                                              </div>
                                            )
                                          })}
                                          {item.voucher_type && (() => {
                                            const IconComponent = getAddonIcon(item.voucher_type, undefined, 'voucher');
                                            return (
                                              <div
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight ${theme.bgFaded} ${theme.text} border-2 ${theme.borderFaded} w-fit flex items-center gap-3 transition-all`}
                                              >
                                                {IconComponent ? (
                                                  <IconComponent className="h-4 w-4" />
                                                ) : (
                                                  <div className={`w-1.5 h-1.5 rounded-full ${theme.bg} shadow-sm shadow-black shrink-0`} />
                                                )}
                                                {item.voucher_type}
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      </div>
                                    )}

                                    {/* Booking Confirmation / Status - PUSHED TO BOTTOM */}
                                    <div className="mt-auto pt-6">
                                      <div className={`p-4 rounded-2xl border-2 ${item.voucher_id ? 'border-main/30 bg-main/5' : 'border-red-500/30 bg-red-500/5'} max-w-[280px]`}>
                                        <div className="flex items-start gap-3">
                                          <div className={`mt-0.5 p-1.5 rounded-lg ${item.voucher_id ? 'bg-main/20 text-main' : 'bg-red-500/20 text-red-400'}`}>
                                            {item.voucher_id ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                          </div>
                                          <p className={`text-[13px] font-bold leading-relaxed ${item.voucher_id ? 'text-main' : 'text-red-400'}`}>
                                            {item.voucher_id
                                              ? 'Датата е одобрена!'
                                              : 'Датата все още НЕ е одобрена, очаквайте обаждане в най-скоро време!'}
                                          </p>
                                        </div>

                                        {/* View Voucher Button - ONLY IF VOUCHER EXISTS */}
                                        {item.voucher_id && (
                                          <div className="mt-4 pt-4 border-t border-main/20">
                                            <Button
                                              asChild
                                              className="w-full bg-main hover:bg-main/80 text-slate-950 font-black uppercase text-[11px] tracking-widest gap-2 shadow-lg shadow-main/20"
                                            >
                                              <Link href={`/vouchers#voucher-${item.voucher_id}`}>
                                                <Ticket className="h-4 w-4" />
                                                Виж Ваучер
                                              </Link>
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 3: Calendar & Price */}
                                  <div className="flex flex-col h-full lg:items-end w-full lg:ml-auto">
                                    {/* Top Content: Date & Calendar */}
                                    <div className="flex flex-col gap-4 lg:items-end w-full lg:w-fit">
                                      {selectedDate && (
                                        <>
                                          <h4 className={`font-black text-xl md:text-2xl text-white uppercase tracking-tight lg:text-right w-full`}>
                                            {selectedDate.toLocaleDateString('bg-BG', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric'
                                            })}
                                          </h4>

                                          <div className={`rounded-2xl border-2 ${theme.borderFaded} bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40 w-fit lg:ml-auto pointer-events-none select-none`}>
                                            <Calendar
                                              mode="single"
                                              selected={selectedDate}
                                              month={selectedDate}
                                              className="p-3 !w-full lg:!w-auto"
                                              classNames={{
                                                months: "flex flex-col",
                                                month: "space-y-3",
                                                caption: "flex justify-center pt-1 relative items-center mb-2",
                                                caption_label: `text-xs font-black uppercase tracking-widest ${theme.text}`,
                                                nav: "hidden",
                                                table: "w-full border-collapse",
                                                weekdays: "flex justify-between",
                                                weekday: "text-slate-600 rounded-md w-8 font-black text-[9px] uppercase",
                                                week: "flex w-full mt-1 justify-between",
                                                day: "p-0 w-8 h-8",
                                                selected: `![&_button]:data-[selected-single=true]:${theme.bg} ![&_button]:data-[selected-single=true]:text-slate-950 ![&_button]:data-[selected-single=true]:font-black ![&_button]:data-[selected-single=true]:opacity-100 ![&_button]:data-[selected-single=true]:shadow-xl ![&_button]:data-[selected-single=true]:scale-110 !z-10`,
                                                today: "![&_button]:bg-transparent ![&_button]:text-white ![&_button]:underline ![&_button]:underline-offset-4 ![&_button]:decoration-2 ![&_button]:decoration-white/30",
                                                outside: "text-slate-800 opacity-20",
                                                disabled: "text-slate-100",
                                              }}
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Price Section - PUSHED TO BOTTOM */}
                                    <div className="mt-auto pt-6 flex flex-col lg:items-end w-full border-t border-white/5 lg:border-none">
                                      <div className="flex flex-col lg:items-end">
                                        <div className="flex items-baseline gap-2">
                                          <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${theme.text}`}>
                                            {parseFloat(item.price).toFixed(2)}
                                          </span>
                                          <span className="text-sm font-black text-slate-500">EUR</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mt-1">
                                          Количество: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          )
                        }



                        // Regular product item
                        return (
                          <div
                            key={item.id}
                            className="bg-slate-950 border border-slate-800 rounded-lg p-4"
                          >
                            <div className="flex gap-4 items-start">
                              {/* Product Image or Icon */}
                              {item.image_url ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                                  <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-400/20 border border-purple-400/30">
                                  <ShoppingBag className="h-8 w-8 text-purple-400" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-white">{item.title}</p>
                                  <Badge className="text-xs bg-purple-400/20 text-purple-400 border-purple-400/30">
                                    Продукт
                                  </Badge>
                                </div>

                                {/* Variant badges */}
                                {item.variant && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {item.variant.split(', ').map((v, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300"
                                      >
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* SKU */}
                                {item.sku && (
                                  <p className="text-xs text-slate-600 font-mono mt-2">
                                    SKU: {item.sku}
                                  </p>
                                )}

                                <p className="text-sm text-slate-500 mt-2">
                                  Количество: {item.quantity}
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-black text-purple-400">
                                  {parseFloat(item.price).toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-500">EUR</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-slate-800" />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-black text-sm text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Адрес за доставка
                    </h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm">
                      <p className="font-bold text-white">{order.shipping_address_snapshot.fullName}</p>
                      <p className="text-slate-400 mt-1">{order.shipping_address_snapshot.address}</p>
                      <p className="text-slate-400">
                        {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.postalCode}
                      </p>
                      <p className="text-slate-400">{order.shipping_address_snapshot.country}</p>
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <p className="text-slate-400">{order.shipping_address_snapshot.email}</p>
                        <p className="text-slate-400">{order.shipping_address_snapshot.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
