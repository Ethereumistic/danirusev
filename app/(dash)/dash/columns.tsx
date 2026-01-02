'use client'

import * as React from 'react'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, Clock, CheckCircle, Truck, Package, ChevronDown, ChevronRight, MapPin, Video, Disc, Gift, Smartphone, ShoppingBag, Ticket, CalendarDays, Edit2, UserPlus, Check, X } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { deleteOrder, updateOrderStatus, updateVoucherRecipientName, confirmOrderDate } from './actions'
import { toast } from 'sonner'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import {
  getExperienceThemeColor,
  getDriftThemeClasses,
  getExperienceIcon,
  getExperienceThumbnail,
  type ThemeColor,
  cn
} from '@/lib/utils'

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
  voucher_id: string | null
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

// Status configuration with normalized lowercase keys
const statusConfig: Record<string, { color: string, bgColor: string, label: string, icon: React.ComponentType<{ className?: string }> }> = {
  'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', label: 'Изчакване', icon: Clock },
  'approved': { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30', label: 'Одобрена', icon: CheckCircle },
  'shipped': { color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/30', label: 'Изпратена', icon: Truck },
  'delivered': { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30', label: 'Доставена', icon: Package },
  'cancelled': { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/30', label: 'Отказна', icon: X },
}

// Icon mapping for addons
const addonIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'GoPro Заснемане': Video,
  'Допълнителни Гуми': Disc,
  'Ваучер Дигитален': Smartphone,
  'Ваучер Физически': Gift,
  '30 мин': Clock,
  '60 мин': Clock,
  '90 мин': Clock,
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
      const orderItems = row.original.orderItems || []

      return (
        <div className="flex flex-col gap-2 max-w-[250px]">
          <div className="flex -space-x-2 overflow-hidden">
            {orderItems.slice(0, 4).map((item, i) => {
              const themeColor = item.item_type === 'experience'
                ? getExperienceThemeColor(item.title)
                : 'main'
              const theme = getDriftThemeClasses(themeColor)
              const ItemIcon = item.item_type === 'experience' ? getExperienceIcon(themeColor) : ShoppingBag

              return (
                <div
                  key={i}
                  className={`relative w-8 h-8 rounded-full border-2 border-slate-900 ${theme.bg} flex items-center justify-center shadow-lg`}
                  title={item.title}
                >
                  <ItemIcon className="h-4 w-4 text-black" />
                </div>
              )
            })}
            {orderItems.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                +{orderItems.length - 4}
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-slate-300 truncate">
            {titles || 'N/A'}
          </div>
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
      const status = (row.getValue('status') as string || 'pending').toLowerCase()
      const config = statusConfig[status] || statusConfig['pending']
      const StatusIcon = config.icon
      return (
        <Badge className={cn(config.bgColor, config.color, "border font-bold uppercase text-xs gap-1")}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
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
          <span className="text-xs text-slate-500 ml-1">EUR</span>
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
          <DropdownMenuContent align="end" className="bg-slate-900/90 backdrop-blur-xl border-slate-800 p-2 min-w-[180px] shadow-2xl rounded-2xl">
            <DropdownMenuLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Управление</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderId)}
              className="hover:bg-white/5 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3"
            >
              Копирай ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
            <DropdownMenuItem onClick={() => handleStatusUpdate('pending')} className="hover:bg-yellow-400/10 focus:bg-yellow-400/10 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 transition-colors">
              <Clock className="h-4 w-4 mr-3 text-yellow-400" /> Изчакване
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('approved')} className="hover:bg-blue-400/10 focus:bg-blue-400/10 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 transition-colors">
              <CheckCircle className="h-4 w-4 mr-3 text-blue-400" /> Одобрена
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('shipped')} className="hover:bg-purple-400/10 focus:bg-purple-400/10 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 transition-colors">
              <Truck className="h-4 w-4 mr-3 text-purple-400" /> Изпратена
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('delivered')} className="hover:bg-green-400/10 focus:bg-green-400/10 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 transition-colors">
              <Package className="h-4 w-4 mr-3 text-green-400" /> Доставена
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
            <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 transition-colors" onClick={handleDelete}>
              Изтрий поръчка
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Component to handle individual experience confirmation

export function ExpandedOrderDetails({ order }: { order: Order }) {
  const orderItems = order.orderItems || []
  const experiences = orderItems.filter(item => item.item_type === 'experience')

  // Use main project theme for overall summary containers
  const mainTheme = getDriftThemeClasses('main')

  // Experience specific theme for headers if needed
  const primaryExperience = experiences[0]
  const themeColor = primaryExperience ? getExperienceThemeColor(primaryExperience.title) : 'main'
  const expTheme = getDriftThemeClasses(themeColor)

  return (
    <div className="bg-slate-950/80 p-8 border-t border-slate-800/50 shadow-inner overflow-visible">
      <div className="flex flex-col gap-10 overflow-visible">

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-visible">

          {/* Customer & Summary Column (Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px] self-start z-10">
            {/* Customer Info Card */}
            <div className={cn(
              "bg-slate-900/50 rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden group",
              mainTheme.borderFaded
            )}>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className={cn("w-1 h-3 rounded-full", mainTheme.bg)} />
                Поръчител
              </h4>

              <div className="space-y-6">
                <div>
                  <p className="text-2xl font-black text-white tracking-tight leading-none mb-1">{order.customerName}</p>
                  <p className="text-sm font-bold text-slate-500">{order.customerEmail}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <MapPin className={cn("h-5 w-5", mainTheme.text)} />
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-500 font-bold uppercase text-[9px] mb-0.5">Адрес за доставка</p>
                      <p className="text-white font-bold leading-relaxed">
                        {order.customerAddress}<br />
                        {order.customerCity}, {order.customerPostalCode}<br />
                        {order.customerCountry}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <Smartphone className={cn("h-5 w-5", mainTheme.text)} />
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[9px] mb-0.5">Телефон</p>
                      <p className="text-white font-black">{order.customerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className={cn(
              "bg-slate-900/90 border-2 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500",
              mainTheme.border,
              mainTheme.shadow
            )}>
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", mainTheme.bg)} />
                  Резюме на поръчката
                </h4>
                <div className="bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <Package className={cn("h-3.5 w-3.5", mainTheme.text)} />
                  <span className="text-white font-black text-[10px] uppercase tracking-widest">{orderItems.length} бр.</span>
                </div>
              </div>

              {/* Order Item Icons Rendering */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                {orderItems.map((item, i) => {
                  const itemThemeColor = item.item_type === 'experience' ? getExperienceThemeColor(item.title) : 'main'
                  const itemTheme = getDriftThemeClasses(itemThemeColor)
                  const ItemIcon = item.item_type === 'experience' ? getExperienceIcon(itemThemeColor) : ShoppingBag

                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center border-2 border-slate-950 shadow-xl relative group/sum-item transition-all duration-300 hover:scale-110",
                        itemTheme.bg
                      )}
                      title={item.title}
                    >
                      <ItemIcon className="h-5.5 w-5.5 text-black" />
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] font-black px-2 py-1.5 rounded-lg opacity-0 group-hover/sum-item:opacity-100 transition-all duration-300 whitespace-nowrap border border-white/10 pointer-events-none z-50 shadow-2xl translate-y-2 group-hover/sum-item:translate-y-0">
                        {item.title}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-4 relative z-10">

                <div className="pt-2 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Обща сума</p>
                    <p className={cn("text-4xl font-black tracking-tighter italic", mainTheme.text)}>
                      {order.total.toFixed(2)}
                      <span className="text-xs ml-1.5 not-italic opacity-40 uppercase tracking-widest font-bold">EUR</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  {(() => {
                    const currentStatus = (order.status || 'pending').toLowerCase()
                    const config = statusConfig[currentStatus] || statusConfig['pending']
                    const StatusIcon = config.icon

                    const handleStatusUpdate = async (newStatus: string) => {
                      toast.promise(updateOrderStatus(order.orderId, newStatus as any), {
                        loading: `Промяна на статус към ${statusConfig[newStatus]?.label}...`,
                        success: `Статусът е обновен на ${statusConfig[newStatus]?.label}.`,
                        error: 'Грешка при обновяване.',
                      })
                    }

                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full h-12 rounded-xl border font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98]",
                              config.bgColor,
                              config.color,
                              currentStatus === 'pending' ? 'animate-pulse' : ''
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {config.label}
                            <ChevronDown className="h-3 w-3 ml-auto opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border-white/10 p-2 min-w-[200px] shadow-2xl rounded-2xl z-[100]">
                          <DropdownMenuLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Промяна на статус</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
                          {Object.entries(statusConfig).map(([key, cfg]) => {
                            const ItemIcon = cfg.icon
                            return (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => handleStatusUpdate(key)}
                                className={cn(
                                  "rounded-xl cursor-pointer text-xs font-bold py-2.5 px-3 mb-1 flex items-center gap-3 focus:bg-white/5",
                                  currentStatus === key ? "bg-white/5 border border-white/10" : "opacity-90"
                                )}
                              >
                                <div className={cn("p-1.5 rounded-lg bg-slate-950/50 border border-white/5", cfg.color)}>
                                  <ItemIcon className="h-3.5 w-3.5" />
                                </div>
                                <span className={cfg.color}>{cfg.label}</span>
                                {currentStatus === key && <Check className="h-3.5 w-3.5 ml-auto text-main" />}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Items Management Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 h-full">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className={cn("w-1 h-3 rounded-full", expTheme.bg)} />
                Управление на артикули ({orderItems.length})
              </h4>

              <div className="flex flex-col gap-4">
                {orderItems.map((item, index) => {
                  const themeColor = item.item_type === 'experience'
                    ? getExperienceThemeColor(item.title)
                    : 'main'
                  const theme = getDriftThemeClasses(themeColor)
                  const ItemIcon = item.item_type === 'experience' ? getExperienceIcon(themeColor) : ShoppingBag

                  return (
                    <div key={item.id || index} className={`group relative bg-slate-950 p-6 rounded-2xl border-2 ${theme.borderFaded} transition-all flex flex-col xl:flex-row gap-8 shadow-xl overflow-hidden`}>

                      {/* Left Side: Product Info (Columnar) */}
                      <div className="flex-1 min-w-0 flex flex-col gap-5">
                        {/* Title Row */}
                        <div className="flex flex-col gap-4">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight leading-none break-words">
                              {item.title}
                            </h5>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-black text-slate-500 mt-2">
                              <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 tracking-widest">{item.quantity}x</span>
                              <span className={`${theme.text} bg-white/5 px-2 py-0.5 rounded`}>{item.price.toFixed(2)} EUR</span>
                              {item.variant && <span className="text-slate-400">| {item.variant}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Image & Main Details Row */}
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Image Under Title */}
                          <div className={cn(
                            "w-full md:w-32 h-48 md:h-32 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-900 border-2 transition-transform group-hover:scale-[1.01] overflow-hidden",
                            theme.border,
                            theme.borderStyle
                          )}>
                            {item.image_url ? (
                              <div className="relative w-full h-full">
                                <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                              </div>
                            ) : (
                              <ItemIcon className={cn("h-12 w-12 opacity-50", theme.text)} />
                            )}
                          </div>

                          <div className="flex-1 space-y-4 pb-32">
                            {/* Location Badge */}
                            {item.location && (
                              <div className="flex items-center gap-2 text-slate-300 text-xs font-black uppercase tracking-widest bg-slate-900 px-3 py-2 rounded-xl border border-white/5 w-fit">
                                <MapPin className="h-3.5 w-3.5 text-main" />
                                {item.location}
                              </div>
                            )}

                            {/* Addons Grid */}
                            {((item.addons && item.addons.length > 0) || item.voucher_type) && (
                              <div className="flex flex-wrap gap-2">
                                {item.addons?.map((addon, aIdx) => {
                                  const AddonIcon = addonIcons[addon] || Package
                                  return (
                                    <Badge key={aIdx} className="bg-slate-900 hover:bg-slate-800 text-[10px] font-black text-slate-300 border border-white/5 px-3 py-1.5 gap-2 rounded-xl">
                                      <AddonIcon className={cn("h-3.5 w-3.5", theme.text)} />
                                      {addon}
                                    </Badge>
                                  )
                                })}
                                {item.voucher_type && (
                                  <Badge className={cn(
                                    "bg-white/5 text-[10px] font-black uppercase border px-3 py-1.5 rounded-xl gap-2 shadow-lg",
                                    theme.text,
                                    theme.borderFaded
                                  )}>
                                    <Ticket className="h-3.5 w-3.5" />
                                    {item.voucher_type}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Absolute Bottom-Left Corner Elements */}
                      <div className="absolute bottom-6 left-6 flex flex-col items-start gap-4 z-20 pointer-events-auto">
                        <RecipientManager item={item} theme={theme} />

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {item.voucher_id ? (
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20 shadow-lg shadow-green-400/5 group/active">
                              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/20 shadow-lg shadow-yellow-400/5 animate-pulse">
                              <Clock className="h-3.5 w-3.5 text-yellow-400" />
                              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Experience Management */}
                      {item.item_type === 'experience' && (
                        <div className="flex items-center justify-center border-t xl:border-t-0 xl:border-l border-white/5 pt-8 xl:pt-0 xl:pl-8 min-w-fit">
                          <ExperienceInlineManagement
                            item={item}
                            orderId={order.orderId}
                            userId={order.userId}
                            theme={theme}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-component to manage voucher recipient name
function RecipientManager({ item, theme }: { item: OrderItem, theme: any }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [newName, setNewName] = React.useState(item.voucher_recipient_name || '')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleUpdate = async () => {
    if (!newName.trim()) {
      toast.error('Моля въведете име')
      return
    }

    setIsLoading(true)
    try {
      await updateVoucherRecipientName(item.id, newName)
      toast.success('Името е обновено')
      setIsEditing(false)
    } catch (error) {
      toast.error('Грешка при обновяване')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-slate-900 p-4 rounded-2xl border border-main/20 w-full max-w-sm flex flex-col gap-3 shadow-2xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Промяна на получател</p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Име на получател..."
            className="bg-slate-950 border-white/10 text-white font-black uppercase text-sm h-10 rounded-xl"
            autoFocus
          />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-green-400/10 text-green-400" onClick={handleUpdate} disabled={isLoading}>
              <Check className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-red-400/10 text-red-400" onClick={() => { setIsEditing(false); setNewName(item.voucher_recipient_name || '') }}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group/recipient inline-block">
      {item.voucher_recipient_name ? (
        <div className="bg-slate-800/50 p-3 px-4 rounded-xl border border-white/5 flex items-center justify-between gap-6 transition-colors hover:border-main/20 cursor-default">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Получател на Ваучера</p>
            <p className={cn("text-lg font-black uppercase italic leading-none", theme.text)}>{item.voucher_recipient_name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover/recipient:opacity-100 transition-opacity text-slate-500 hover:text-white"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-10 border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-main/40 hover:bg-main/5 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
          onClick={() => setIsEditing(true)}
        >
          <UserPlus className="h-4 w-4" />
          Добави Име на Получател
        </Button>
      )}
    </div>
  )
}

function ExperienceInlineManagement({
  item,
  orderId,
  userId,
  theme
}: {
  item: OrderItem
  orderId: string
  userId: string | null
  theme: any
}) {
  const initialDate = item.selected_date ? new Date(item.selected_date) : null
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(initialDate)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleUpdate = async (isConfirmOnly: boolean) => {
    if (!selectedDate) return
    setIsConfirming(true)
    try {
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

      await confirmOrderDate({
        orderId,
        orderItemId: item.id,
        selectedDate: formattedDate,
        confirmOnly: isConfirmOnly,
        orderItem: item,
        userId
      })

      toast.success(isConfirmOnly ? 'Потвърдено!' : 'Променено!')
      // revalidatePath in the action will refresh the data without a full page reload
      setIsEditMode(false)
    } catch (error) {
      toast.error('Грешка при обновяване')
    } finally {
      setIsConfirming(false)
      setIsEditMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Inline Calendar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Избрана Дата</span>
          <span className={`text-xs font-black ${theme.text} uppercase tracking-tight flex items-center gap-2`}>
            <CalendarDays className="h-3.5 w-3.5" />
            {selectedDate ? selectedDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
          </span>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-2xl border border-white/5 shadow-inner">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            defaultMonth={selectedDate || undefined}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date)
                setIsEditMode(true)
              }
            }}
            className="rounded-xl"
            classNames={{
              selected: `![&_button]:${theme.bg} ![&_button]:text-black ![&_button]:font-black`,
              today: "![&_button]:text-main ![&_button]:underline",
              head_cell: "text-slate-500 font-black uppercase text-[9px] tracking-widest w-8",
              cell: "h-8 w-8 text-center text-xs p-0 relative",
              button: "h-8 w-8 p-0 font-bold aria-selected:opacity-100 mb-1 rounded-lg",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!item.voucher_id ? (
          <Button
            size="sm"
            onClick={() => handleUpdate(true)}
            disabled={isConfirming || !selectedDate}
            className={`h-12 w-full ${theme.bg} hover:opacity-90 text-black font-black uppercase tracking-widest text-[11px] shadow-lg shadow-main/5 active:scale-[0.98] transition-all rounded-xl`}
          >
            {isConfirming ? '...' : 'Потвърди Дата'}
          </Button>
        ) : isEditMode ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedDate(initialDate)
                setIsEditMode(false)
              }}
              className="h-12 px-4 border-white/5 text-[11px] font-black uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 transition-all rounded-xl"
            >
              Отказ
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdate(false)}
              disabled={isConfirming}
              className={`h-12 flex-1 ${theme.bg} hover:opacity-90 text-black font-black uppercase tracking-widest text-[11px] shadow-lg shadow-main/5 active:scale-[0.98] transition-all rounded-xl`}
            >
              Запази Промяна
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-12 w-full border-green-400/20 text-green-400 font-black uppercase tracking-widest text-[10px] bg-green-400/5 rounded-xl opacity-60 cursor-default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Датата е Потвърдена
          </Button>
        )}
      </div>
    </div>
  )
}