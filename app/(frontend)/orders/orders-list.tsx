'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, MapPin, Gift, Clock, CheckCircle, Truck, ShoppingBag, Ticket, Smartphone, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'


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
      <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50">
        <ShoppingBag className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Все още нямате поръчки</h2>
        <p className="text-slate-500">
          Когато направите поръчка, тя ще се появи тук.
        </p>
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
                  <p className="text-xs font-bold text-slate-500">BGN</p>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-800">
                <div className="p-5 space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-black text-sm text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Продукти / Преживявания
                    </h3>
                    <div className="space-y-3">
                      {order.order_items.map(item => {
                        return (
                          <div
                            key={item.id}
                            className="bg-slate-950 border border-slate-800 rounded-lg p-4"
                          >
                            <div className="flex gap-4 items-start">
                              {/* Product Image or Icon */}
                              {item.image_url ? (
                                <div className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${item.item_type === 'experience' ? 'border-main/30' : 'border-purple-400/30'}`}>
                                  <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${item.item_type === 'experience' ? 'bg-main/20 border-2 border-main/30' : 'bg-purple-400/20 border-2 border-purple-400/30'}`}>
                                  {item.item_type === 'experience' ? (
                                    <Ticket className="h-10 w-10 text-main" />
                                  ) : (
                                    <ShoppingBag className="h-10 w-10 text-purple-400" />
                                  )}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-white">{item.title}</p>
                                  <Badge className={`text-xs ${item.item_type === 'experience' ? 'bg-main/20 text-main border-main/30' : 'bg-purple-400/20 text-purple-400 border-purple-400/30'}`}>
                                    {item.item_type === 'experience' ? 'Преживяване' : 'Продукт'}
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

                                {/* Experience details */}
                                {item.item_type === 'experience' && (
                                  <div className="mt-2 space-y-1">
                                    {item.location && (
                                      <p className="text-sm text-slate-400 flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-main" /> {item.location}
                                      </p>
                                    )}
                                    {item.selected_date && (
                                      <Badge className="text-xs bg-main/20 text-main border-main/30 gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        {new Date(item.selected_date).toLocaleDateString('bg-BG', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric'
                                        })}
                                      </Badge>
                                    )}
                                    {(item.addons && item.addons.length > 0) || item.voucher_type ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.addons?.map((addon, idx) => (
                                          <Badge key={idx} className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                                            {addon}
                                          </Badge>
                                        ))}
                                        {item.voucher_type && (
                                          <Badge className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                                            {item.voucher_type}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : null}
                                    {item.voucher_recipient_name && (
                                      <p className="text-sm text-slate-400 flex items-center gap-2">
                                        <Gift className="h-3 w-3" /> Име на ваучер: <span className="text-white font-semibold">{item.voucher_recipient_name}</span>
                                      </p>
                                    )}
                                  </div>
                                )}

                                <p className="text-sm text-slate-500 mt-2">
                                  Количество: {item.quantity}
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-black text-main">
                                  {parseFloat(item.price).toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-500">BGN</p>
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
