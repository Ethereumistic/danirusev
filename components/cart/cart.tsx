"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/stores/cart-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Minus, Plus, Trash, MapPin, Gift, CalendarDays } from "lucide-react"
import Link from "next/link"
import { getBorderColor, getTextColor, getBgColor, getBorderStyle } from "@/lib/utils"

export function Cart({ closeSheet }: { closeSheet: () => void }) {
  const { items, removeItem, increaseQuantity, decreaseQuantity, updateCartItemVoucherName } = useCartStore()

  // Calculate subtotal - for CMS experiences, item.price already includes all addons
  const subtotal = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0)

  // Item total price is just the price (already includes addons for experiences)
  const getItemTotalPrice = (item: any): number => {
    return item.price ?? 0;
  };

  return (
    <SheetContent className="flex w-full flex-col px-6 sm:max-w-lg z-[50000] bg-slate-950">
      <SheetHeader className="space-y-2.5 pr-6 pb-4">
        <SheetTitle className="text-2xl font-black text-white">Количка ({items.length})</SheetTitle>
        <p className="text-sm text-slate-400">Прегледайте вашите избрани преживявания</p>
      </SheetHeader>
      {items.length > 0 ? (
        <>
          <div className="flex-1 flex w-full flex-col pr-6 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="flex flex-col gap-4 pb-4 pr-4">
                {items.map((item) => {
                  return (
                    <div key={item.cartItemId} className="space-y-3">
                      <div className="relative bg-slate-900 rounded-xl border-2 border-slate-800 p-4 hover:border-slate-700 transition-all group">
                        {/* Delete Button */}
                        <Button
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
                                {getItemTotalPrice(item).toFixed(2)}
                              </span>
                              <span className="text-sm font-bold text-slate-400">BGN</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-lg border-slate-700 bg-slate-800 hover:bg-slate-700"
                                onClick={() => decreaseQuantity(item.cartItemId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                              <Button
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
                            <Label htmlFor={`voucher-name-${item.cartItemId}`} className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                              Име на ваучера
                            </Label>
                            <Input
                              id={`voucher-name-${item.cartItemId}`}
                              type="text"
                              placeholder="Име на получателя (по избор)"
                              value={item.voucherName || ''}
                              onChange={(e) => updateCartItemVoucherName(item.cartItemId, e.target.value)}
                              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-main h-10"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Ако купувате ваучера като подарък, можете да въведете името на получателя
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          {/* Gradient overlay for smooth transition to footer */}
          <div className="flex-shrink-0 relative pr-6  ">
            <div className="absolute inset-x-0 top-0 h-12  pointer-events-none" />
            <div className="relative space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
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
            <SheetFooter>
              <Button
                variant="main"
                asChild
                className="w-full h-12 bg-main text-black font-black uppercase tracking-wider hover:bg-main/90 transition-all hover:scale-[1.02]"
                onClick={closeSheet}
              >
                <Link href="/checkout">Продължи Напред →</Link>
              </Button>
            </SheetFooter>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center space-y-4">
          <div aria-hidden="true" className="relative mb-4 h-40 w-40 text-muted-foreground opacity-50">
            <Image src="/file.svg" fill alt="Empty shopping cart" />
          </div>
          <div className="text-xl font-bold text-white">Вашата количка е празна</div>
          <div className="text-sm text-slate-400 text-center max-w-sm">
            Добавете преживявания или продукти за да ги видите тук.
          </div>
        </div>
      )}
    </SheetContent>
  )
}