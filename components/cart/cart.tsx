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
import { Minus, Plus, Trash, MapPin, Gift, CalendarDays, Clock, ShoppingBag, Trophy, Disc, CarTaxiFront, Car, Gauge, PartyPopper, Flag } from "lucide-react"
import Link from "next/link"
import { getBorderColor, getTextColor, getBgColor, getBorderStyle, getDriftThemeClasses, getExperienceIcon, getAddonIcon } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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
                  const theme = getDriftThemeClasses(item.themeColor)
                  const ExperienceIcon = getExperienceIcon(item.themeColor || 'main')

                  return (
                    <div key={item.cartItemId} className="space-y-3">
                      <div className={`relative bg-slate-900 rounded-xl border-2 ${theme.borderFaded} p-4 hover:border-slate-700 transition-all group overflow-hidden`}>
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50 pointer-events-none`} />
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8  z-10"
                          onClick={() => removeItem(item.cartItemId)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>

                        <div className="flex items-start gap-4">
                          {/* Experience Image with colored border */}
                          {item.imageUrl ? (
                            <div className={`relative flex-shrink-0 h-24 w-24 rounded-xl overflow-hidden shadow-lg border-4 ${theme.borderStyle} ${theme.border}`}>
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`relative flex-shrink-0 h-24 w-24 rounded-xl flex items-center justify-center ${theme.bgFaded} border-4 ${theme.borderStyle} ${theme.border} shadow-lg shadow-black/50`}>
                              <ExperienceIcon className={`h-10 w-10 ${theme.text} opacity-50`} />
                            </div>
                          )}

                          {/* Type Badge - Top Right */}


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
                              <span className="text-sm font-bold text-slate-400">€</span>
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
                                className={`h-7 w-7 rounded-lg ${theme.bg} border-transparent hover:opacity-90 text-black`}
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

                        {/* Experience Options & Addons */}
                        {item.productType === 'experience' && (
                          <div className="mt-4 space-y-4">
                            {/* Meta Pills (Location & Date) */}
                            {(item.storedLocationName || item.storedSelectedDate) && (
                              <div className="flex flex-wrap gap-2">
                                {item.storedLocationName && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 border border-white/10 backdrop-blur-md">
                                    <MapPin className={`h-3.5 w-3.5 ${theme.text}`} />
                                    <span className="text-lg font-black uppercase text-white leading-none">
                                      {item.storedLocationName}
                                    </span>
                                  </div>
                                )}
                                {item.storedSelectedDate && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 border border-white/10 backdrop-blur-md">
                                    <CalendarDays className={`h-3.5 w-3.5 ${theme.text}`} />
                                    <span className="text-lg font-black uppercase text-white leading-none">
                                      {item.storedSelectedDate}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detailed Options (Voucher, Duration & Addons) */}
                            {(() => {
                              const displayAddons = item.storedAddons?.filter(addon =>
                                ['standard', 'voucher', 'duration'].includes(addon.type)
                              ) || [];

                              if (displayAddons.length === 0) return null;

                              return (
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                                    Избрани Опции
                                  </h4>
                                  <div className="flex flex-col gap-2">
                                    {displayAddons.map((addon) => (
                                      <div
                                        key={addon.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${theme.bgFaded} border-2 ${theme.borderFaded} transition-colors`}
                                      >
                                        {(() => {
                                          const IconComponent = getAddonIcon(addon.name, addon.icon, addon.type);

                                          if (IconComponent) {
                                            return (
                                              <div className={`p-1 rounded-lg bg-black/40 border ${theme.borderFaded}`}>
                                                <IconComponent className={`h-3.5 w-3.5 ${theme.text}`} />
                                              </div>
                                            );
                                          }

                                          // Default bullet for standard addons
                                          return <div className={`w-2 h-2 rounded-full ${theme.bg} shadow-sm shadow-black shrink-0`} />;
                                        })()}

                                        <div className="flex-1">
                                          <span className="text-xs font-black text-white uppercase tracking-tight">
                                            {addon.name}
                                          </span>
                                        </div>
                                        {addon.price > 0 && (
                                          <span className={`text-sm font-black ${theme.text}`}>
                                            +{addon.price} €
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Voucher Name Input - Only for experiences */}
                        {item.experienceSlug && (
                          <div className={`mt-4 p-4 rounded-xl ${theme.bgFaded} border border-white/10 space-y-3`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Gift className={`h-3.5 w-3.5 ${theme.text}`} />
                                <Label htmlFor={`voucher-name-${item.cartItemId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                  Име на ваучера
                                </Label>
                              </div>
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
                              className="bg-black/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-main h-9 text-sm"
                            />
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
                <span className="text-sm font-medium text-white">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Доставка</span>
                <span className="text-xs text-slate-500">При плащане</span>
              </div>
              <Separator className="bg-slate-800 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white uppercase">Общо</span>
                <span className="text-2xl font-black text-main">{subtotal.toFixed(2)} €</span>
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-main/20 blur-[100px] rounded-full scale-150" />

            <div className="relative flex flex-col items-center gap-6">
              {/* Main Decorative Icon Container */}
              <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-2 border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                <ShoppingBag className="w-20 h-20 text-slate-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-main/30 blur-xl" />
                </div>
                {/* Floating Experience Icons - Larger and Better Distributed */}
                <div className="absolute -top-8  p-3 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl rotate-12 z-20">
                  <CarTaxiFront className="w-6 h-6 text-taxi" />
                </div>
                <div className="absolute top-1/3 -right-8 -translate-y-1/2 p-3 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl rotate-6 z-20">
                  <Car className="w-6 h-6 text-rent" />
                </div>
                <div className="absolute -bottom-4 p-3 right-1 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl -rotate-12 z-20">
                  <Gauge className="w-6 h-6 text-mix" />
                </div>
                <div className="absolute -bottom-4 left-1 p-3 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl rotate-12 z-20">
                  <PartyPopper className="w-6 h-6 text-event" />
                </div>
                <div className="absolute top-1/3 -left-8 -translate-y-1/2 p-3 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl -rotate-6 z-20">
                  <Flag className="w-6 h-6 text-day" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Твоята количка е празна
            </h2>
            <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed mx-auto font-medium">
              Изглежда още нямаш добавени преживявания. Вземи я напълни ;)
            </p>
          </div>

          <Button
            asChild
            variant="main"
            className="w-full max-w-[240px] h-12 bg-main text-black font-black uppercase tracking-widest hover:bg-main/90 transition-all hover:scale-[1.05] shadow-[0_0_30px_-5px_rgba(208,246,26,0.3)]"
            onClick={closeSheet}
          >
            <Link href="/#drift-experiences">
              Преживявания →
            </Link>
          </Button>

        </div>
      )}
    </SheetContent>
  )
}