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
import { Minus, Plus, Trash, MapPin, Camera, Fuel, Smartphone, Gift, Video, Disc } from "lucide-react"
import Link from "next/link"
import { DRIFT_EXPERIENCES } from "@/lib/drift-data"
import { getBorderColor, getTextColor, getBgColor, getBorderStyle } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
};

export function Cart({ closeSheet }: { closeSheet: () => void }) {
  const { items, removeItem, increaseQuantity, decreaseQuantity, toggleCartItemAdditional, updateCartItemLocation, updateCartItemVoucher, updateCartItemVoucherName } = useCartStore()
  const [hoveredAddon, setHoveredAddon] = useState<string | null>(null)

  // Calculate subtotal including additional items and vouchers
  const subtotal = items.reduce((acc, item) => {
    let itemTotal = item.price * item.quantity;

    // Add additional items prices
    if (item.additionalItems && item.additionalItems.length > 0 && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
      if (experience && experience.additionalItems) {
        item.additionalItems.forEach(additionalId => {
          const additionalItem = experience.additionalItems?.find(add => add.id === additionalId);
          if (additionalItem && additionalItem.price > 0) {
            itemTotal += additionalItem.price * item.quantity;
          }
        });
      }
    }

    // Add selected voucher price
    if (item.selectedVoucher && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
      if (experience && experience.additionalItems) {
        const voucherItem = experience.additionalItems.find(add => add.id === item.selectedVoucher);
        if (voucherItem && voucherItem.price > 0) {
          itemTotal += voucherItem.price * item.quantity;
        }
      }
    }

    return acc + itemTotal;
  }, 0)

  // Calculate item total price including addons and vouchers (per unit)
  const getItemTotalPrice = (item: any) => {
    let total = item.price;

    if (item.additionalItems && item.additionalItems.length > 0 && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
      if (experience && experience.additionalItems) {
        item.additionalItems.forEach((additionalId: string) => {
          const additionalItem = experience.additionalItems?.find(add => add.id === additionalId);
          if (additionalItem && additionalItem.price > 0) {
            total += additionalItem.price;
          }
        });
      }
    }

    // Add selected voucher price
    if (item.selectedVoucher && item.experienceSlug) {
      const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
      if (experience && experience.additionalItems) {
        const voucherItem = experience.additionalItems.find(add => add.id === item.selectedVoucher);
        if (voucherItem && voucherItem.price > 0) {
          total += voucherItem.price;
        }
      }
    }

    return total;
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
                    <div key={item.id} className="space-y-3">
                      <div className="relative bg-slate-900 rounded-xl border-2 border-slate-800 p-4 hover:border-slate-700 transition-all group">
                        {/* Delete Button */}
                        <Button
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
                                onClick={() => decreaseQuantity(item.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                              <Button
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

                        {/* Dropdowns Row - MOVED HERE for Full Width */}
                        <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                          {/* Location Dropdown */}
                          {(() => {
                            if (!item.experienceSlug) return null;
                            const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
                            if (!experience || !experience.additionalItems) return null;
                            const locationItems = experience.additionalItems.filter(addItem => addItem.isLocation);
                            if (locationItems.length === 0) return null;

                            const selectedLocation = item.selectedLocation || locationItems[0]?.id;
                            const selectedLocationDetails = locationItems.find(loc => loc.id === selectedLocation);

                            return (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
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
                            );
                          })()}

                          {/* Voucher Dropdown */}
                          {(() => {
                            if (!item.experienceSlug) return null;
                            const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
                            if (!experience || !experience.additionalItems) return null;
                            const voucherItems = experience.additionalItems.filter(addItem => addItem.isVoucher);
                            if (voucherItems.length === 0) return null;

                            const selectedVoucher = item.selectedVoucher || 'voucher-digital';
                            const selectedVoucherDetails = voucherItems.find(v => v.id === selectedVoucher);
                            const VoucherIcon = selectedVoucherDetails ? additionalItemIcons[selectedVoucherDetails.id] : Smartphone;

                            return (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
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
                                    const Icon = additionalItemIcons[voucher.id];
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
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            );
                          })()}
                        </div>

                        {/* Additional Items - Show ALL available items in full-width rows */}
                        {(() => {
                          if (!item.experienceSlug) return null;

                          const experience = DRIFT_EXPERIENCES.find(exp => exp.slug === item.experienceSlug);
                          if (!experience || !experience.additionalItems) return null;

                          // Filter out location and voucher items, show only regular additional items
                          const regularItems = experience.additionalItems.filter(addItem => !addItem.isLocation && !addItem.isVoucher);
                          if (regularItems.length === 0) return null;

                          const selectedAdditionals = item.additionalItems || [];

                          return (
                            <div className="mt-4 pt-4 border-t border-slate-800">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Допълнения</h4>
                              <div className="flex flex-col gap-2">
                                {regularItems.map((additionalItem) => {
                                  const isSelected = selectedAdditionals.includes(additionalItem.id);
                                  const IconComponent = additionalItemIcons[additionalItem.id];

                                  const addonKey = `${item.id}-${additionalItem.id}`;

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
                                  );
                                })}
                              </div>
                            </div>
                          );
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
                          <p className="text-xs text-slate-500 mt-1">
                            Ако купувате ваучера като подарък, можете да въведете името на получателя
                          </p>
                        </div>
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