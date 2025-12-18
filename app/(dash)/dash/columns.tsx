'use client'

import * as React from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, Clock, CheckCircle, Truck, Package, ChevronDown, ChevronRight, MapPin, Video, Disc, Gift, Smartphone, ShoppingBag, Ticket, CalendarDays } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteOrder, updateOrderStatus } from './actions'
import { toast } from 'sonner'
import Image from 'next/image'

// Order item type matching database schema
export type OrderItem = {
  id: number
  product_id: string
  quantity: number
  price: number
  title: string
  variant: string | null
  sku: string | null
  item_type: 'physical' | 'experience' | null
  image_url: string | null
  location: string | null
  addons: string[] | null
  voucher_type: string | null
  voucher_recipient_name: string | null
  selected_date: string | null
}

// This type is updated to include the new fields from our RPC function
export type Order = {
  orderId: string
  userId: string | null
  customerEmail: string | null
  customerName: string | null
  customerPhone: string | null
  customerAddress: string | null
  customerCity: string | null
  customerPostalCode: string | null
  customerCountry: string | null
  productTitles: string | null
  total: number
  status: string
  createdAt: string
  orderItems: OrderItem[]
}

// Status configuration with colors
const statusConfig: Record<string, { color: string, bgColor: string, icon: React.ComponentType<{ className?: string }> }> = {
  'Pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  'approved': { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30', icon: CheckCircle },
  'shipped': { color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/30', icon: Truck },
  'delivered': { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30', icon: Package },
}

// Icon mapping for addons
const addonIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'GoPro Заснемане': Video,
  'Допълнителни Гуми': Disc,
  'Ваучер Дигитален': Smartphone,
  'Ваучер Физически': Gift,
}

export const columns: ColumnDef<Order>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-slate-800"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-main" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </Button>
      )
    },
  },
  {
    accessorKey: 'orderId',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-xs bg-slate-800 px-2 py-1 rounded inline-block">
        #{row.getValue('orderId')}
      </div>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Клиент',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="font-semibold text-white">{order.customerName || 'N/A'}</div>
          <div className="text-xs text-slate-500">{order.customerEmail}</div>
          <div className="text-xs text-slate-600">{order.customerPhone}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'productTitles',
    header: 'Продукти',
    cell: ({ row }) => {
      const titles = row.getValue('productTitles') as string | null
      const itemCount = row.original.orderItems?.length || 0
      const displayTitles = titles && titles.length > 60 ? `${titles.substring(0, 60)}...` : titles
      return (
        <div className="text-sm text-slate-300 max-w-[200px]">
          <div>{displayTitles || 'N/A'}</div>
          <div className="text-xs text-slate-500">{itemCount} артикул(а)</div>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-slate-400 hover:text-white"
        >
          Статус
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const config = statusConfig[status] || statusConfig['Pending']
      const StatusIcon = config.icon
      return (
        <Badge className={`${config.bgColor} ${config.color} border font-bold uppercase text-xs gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {status === 'Pending' ? 'Изчакване' :
            status === 'approved' ? 'Одобрена' :
              status === 'shipped' ? 'Изпратена' :
                status === 'delivered' ? 'Доставена' : status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className="text-sm text-slate-400">
          {date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Сума</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'))
      return (
        <div className="text-right">
          <span className="text-lg font-black text-main">{amount.toFixed(2)}</span>
          <span className="text-xs text-slate-500 ml-1">BGN</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original

      const handleDelete = async () => {
        if (!confirm('Сигурни ли сте, че искате да изтриете тази поръчка?')) {
          return
        }
        toast.promise(deleteOrder(order.orderId), {
          loading: 'Изтриване...',
          success: 'Поръчката е изтрита.',
          error: 'Грешка при изтриване.',
        })
      }

      const handleStatusUpdate = async (status: 'approved' | 'shipped' | 'delivered' | 'pending') => {
        toast.promise(updateOrderStatus(order.orderId, status), {
          loading: `Промяна на статус...`,
          success: `Статусът е обновен.`,
          error: 'Грешка при обновяване.',
        })
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-800">
              <span className="sr-only">Меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-400">Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderId)}
              className="hover:bg-slate-800"
            >
              Копирай ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem onClick={() => handleStatusUpdate('pending')} className="hover:bg-slate-800">
              <Clock className="h-4 w-4 mr-2 text-yellow-400" /> Изчакване
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('approved')} className="hover:bg-slate-800">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-400" /> Одобрена
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('shipped')} className="hover:bg-slate-800">
              <Truck className="h-4 w-4 mr-2 text-purple-400" /> Изпратена
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('delivered')} className="hover:bg-slate-800">
              <Package className="h-4 w-4 mr-2 text-green-400" /> Доставена
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-red-400 hover:bg-red-900/30" onClick={handleDelete}>
              Изтрий поръчка
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Component to render expanded row details
export function ExpandedOrderDetails({ order }: { order: Order }) {
  const orderItems = order.orderItems || []

  // Get the first selected date from experience items (if any)
  const experienceWithDate = orderItems.find(item => item.item_type === 'experience' && item.selected_date)
  const initialDate = experienceWithDate?.selected_date ? new Date(experienceWithDate.selected_date) : null

  // State for date editing
  const [isEditingDate, setIsEditingDate] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(initialDate)
  const [isConfirming, setIsConfirming] = React.useState(false)
  const [confirmError, setConfirmError] = React.useState<string | null>(null)

  // Handle date confirmation
  const handleConfirmDate = async () => {
    if (!selectedDate) return

    setIsConfirming(true)
    setConfirmError(null)

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

      const response = await fetch('/api/orders/confirm-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          orderItemId: experienceWithDate?.id,
          selectedDate: isEditingDate ? formattedDate : experienceWithDate?.selected_date,
          confirmOnly: !isEditingDate,
          orderItem: experienceWithDate, // Pass order item for voucher generation
          userId: order.userId // Pass user ID for voucher generation
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to confirm date')
      }

      // Success - reload the page to see updated status
      window.location.reload()
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : 'Failed to confirm date')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="bg-slate-950 p-6 border-t border-slate-800">
      <div className={`grid grid-cols-1 ${initialDate ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Shipping Address Section */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Адрес за доставка</h4>
          <div className="space-y-1 text-sm">
            <p className="text-white font-semibold">{order.customerName}</p>
            <p className="text-slate-300">{order.customerAddress}</p>
            <p className="text-slate-300">{order.customerCity}, {order.customerPostalCode}</p>
            <p className="text-slate-300">{order.customerCountry}</p>
            <p className="text-slate-400 mt-2">{order.customerPhone}</p>
            <p className="text-slate-400">{order.customerEmail}</p>
          </div>
        </div>

        {/* Selected Date Calendar Section - Only for experience orders with a date */}
        {initialDate && (
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-main" />
              {isEditingDate ? 'Изберете нова дата' : 'Избрана дата'}
            </h4>
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => isEditingDate && date && setSelectedDate(date)}
                className="rounded-md border border-slate-700"
                disabled={!isEditingDate}
              />
              <p className="mt-3 text-sm text-slate-300">
                {selectedDate?.toLocaleDateString('bg-BG', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              {/* Error message */}
              {confirmError && (
                <p className="mt-2 text-xs text-red-400">{confirmError}</p>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditingDate) {
                      // Cancel edit mode
                      setIsEditingDate(false)
                      setSelectedDate(initialDate)
                    } else {
                      // Enter edit mode
                      setIsEditingDate(true)
                    }
                  }}
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                >
                  {isEditingDate ? 'Отказ' : 'Промени датата'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmDate}
                  disabled={isConfirming || order.status === 'approved'}
                  className="flex-1 bg-main hover:bg-main/90 text-black font-bold"
                >
                  {isConfirming ? 'Потвърждаване...' : order.status === 'approved' ? 'Потвърдена' : 'Потвърди датата'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order Items Section */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Артикули ({orderItems.length})</h4>
          <div className="space-y-3">
            {orderItems.map((item, index) => {
              return (
                <div key={item.id || index} className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <div className="flex items-start gap-3">
                    {/* Product Image or Icon */}
                    {item.image_url ? (
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${item.item_type === 'experience' ? 'border-main/30' : 'border-purple-400/30'}`}>
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${item.item_type === 'experience' ? 'bg-main/20 border-2 border-main/30' : 'bg-purple-400/20 border-2 border-purple-400/30'}`}>
                        {item.item_type === 'experience' ? (
                          <Ticket className="h-8 w-8 text-main" />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-purple-400" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white truncate">{item.title}</h5>
                        <Badge className={`text-xs ${item.item_type === 'experience' ? 'bg-main/20 text-main border-main/30' : 'bg-purple-400/20 text-purple-400 border-purple-400/30'}`}>
                          {item.item_type === 'experience' ? 'Преживяване' : 'Продукт'}
                        </Badge>
                      </div>

                      {/* Physical Product Details */}
                      {item.item_type === 'physical' && (
                        <div className="mt-2 space-y-1">
                          {item.variant && (
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-500">Вариант:</span> <span className="text-white">{item.variant}</span>
                            </p>
                          )}
                          {item.sku && (
                            <p className="text-xs font-mono text-slate-500">SKU: {item.sku}</p>
                          )}
                        </div>
                      )}

                      {/* Experience Details */}
                      {item.item_type === 'experience' && (
                        <div className="mt-2 space-y-2">
                          {item.location && (
                            <div className="flex items-center gap-2 text-xs">
                              <MapPin className="h-3 w-3 text-main" />
                              <span className="text-slate-300">{item.location}</span>
                            </div>
                          )}
                          {item.selected_date && (
                            <div className="flex items-center gap-2 text-xs">
                              <CalendarDays className="h-3 w-3 text-main" />
                              <span className="text-slate-300">
                                {new Date(item.selected_date).toLocaleDateString('bg-BG', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {(item.addons && item.addons.length > 0) || item.voucher_type ? (
                            <div className="flex flex-wrap gap-1">
                              {item.addons?.map((addon, idx) => {
                                const AddonIcon = addonIcons[addon] || Gift
                                return (
                                  <Badge key={idx} className="text-xs bg-slate-800 text-slate-300 border-slate-700 gap-1">
                                    <AddonIcon className="h-3 w-3" />
                                    {addon}
                                  </Badge>
                                )
                              })}
                              {item.voucher_type && (
                                <Badge className="text-xs bg-slate-800 text-slate-300 border-slate-700 gap-1">
                                  {item.voucher_type.includes('Физически') || item.voucher_type.toLowerCase().includes('physical') ? (
                                    <Gift className="h-3 w-3" />
                                  ) : (
                                    <Smartphone className="h-3 w-3" />
                                  )}
                                  {item.voucher_type}
                                </Badge>
                              )}
                            </div>
                          ) : null}
                          {item.voucher_recipient_name && (
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-500">Получател:</span> <span className="text-white font-semibold">{item.voucher_recipient_name}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-500">Количество: <span className="text-white">{item.quantity}</span></span>
                        <span className="text-sm font-bold text-main">{(item.price * item.quantity).toFixed(2)} BGN</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}