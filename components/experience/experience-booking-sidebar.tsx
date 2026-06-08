'use client'

import * as React from "react"
import { ShoppingCart, Trophy, MapPin, ExternalLink, Clock, PhoneCall, Copy, Check } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getThemeClasses, getImageUrl, type ThemeColor, getAddonIcon } from "./types"
import { PATTERN_COMPONENTS } from "@/components/experience/patterns"
import { useCartStore } from "@/lib/stores/cart-store"
import type { ExperienceProduct } from "@/types/payload-types"
import { formatBGN } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

function CopyButton({ number }: { number: string }) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(number)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older mobile browsers
            const el = document.createElement('textarea')
            el.value = number
            el.setAttribute('readonly', '')
            el.style.position = 'absolute'
            el.style.left = '-9999px'
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <button
            onClick={handleCopy}
            aria-label="Копирай номера"
            className="flex items-center justify-center w-14 h-full min-h-[60px] rounded-xl bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all shrink-0"
        >
            {copied ? (
                <Check className="w-5 h-5 text-green-400" />
            ) : (
                <Copy className="w-5 h-5" />
            )}
        </button>
    )
}

interface ExperienceBookingSidebarProps {
    experience: ExperienceProduct
}

export function ExperienceBookingSidebar({ experience }: ExperienceBookingSidebarProps) {
    const onlineCheckoutEnabled = process.env.NEXT_PUBLIC_ONLINE_CHECKOUT !== 'false'
    const themeColor = (experience.visuals?.themeColor || 'main') as ThemeColor
    const theme = getThemeClasses(themeColor)
    const pattern = experience.visuals?.pattern || 'none'

    // Kill-switch dialog state
    const [offlineDialogOpen, setOfflineDialogOpen] = React.useState(false)

    // Read selections from Zustand store
    const { driftSelections, updateDriftSelections, addItem } = useCartStore()
    const selections = driftSelections[experience.id] || { additionalItems: [], selectedLocation: null, selectedDuration: null, selectedDate: null }

    // Calculate total price
    const basePrice = experience.price || 0
    const hasPrice = typeof experience.price === 'number' && experience.price > 0

    // Get duration add-ons
    const durationAddons = experience.additionalItems?.filter(item => item.type === 'duration') || []
    const selectedDurationItem = durationAddons.find(item => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
        return itemId === selections.selectedDuration
    })

    const additionalPrice = experience.additionalItems
        ?.filter(item => {
            const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
            return selections.additionalItems.includes(itemId) || itemId === selections.selectedDuration
        })
        .reduce((sum, item) => sum + (item.price || 0), 0) || 0

    // Only calculate total if base price exists OR if a duration is selected (for by requirements case)
    const totalPrice = (hasPrice || selectedDurationItem) ? basePrice + additionalPrice : 0

    // Get selected location details
    const selectedLocationItem = experience.additionalItems?.find(item => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
        return item.type === 'location' && itemId === selections.selectedLocation
    })
    const selectedLocationName = selectedLocationItem?.name || 'Не е избрана локация'
    const googleMapsUrl = selectedLocationItem?.googleMapsUrl

    // Get first image for cart
    const firstImage = experience.gallery?.[0]
    const imageUrl = firstImage ? getImageUrl(firstImage) : '/placeholder-drift.jpg'

    // Function to add experience to cart
    const handleAddToCart = () => {
        // Validation: Check if date is selected
        if (!selections.selectedDate) {
            toast.error("Моля, изберете дата за вашето преживяване", {
                description: "Избраната дата е предпочитана и ще бъде потвърдена по телефон след покупката.",
                position: "bottom-right",
            })

            const dateSelector = document.getElementById(`date-selector-${experience.id}`)
            if (dateSelector) {
                dateSelector.scrollIntoView({ behavior: 'smooth', block: 'center' })
                dateSelector.classList.add('wiggle')
                setTimeout(() => {
                    dateSelector.classList.remove('wiggle')
                }, 4000)
            }
            return
        }
        // Build whatYouGet array from included items + selected additional items
        const whatYouGet = experience.included?.map(i => i.item) || []

        // Get all selected additional items with their data
        const selectedAddonsData = experience.additionalItems
            ?.filter(item => {
                const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                return selections.additionalItems.includes(itemId) || itemId === selections.selectedLocation || itemId === selections.selectedDuration
            })
            .map(item => ({
                id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
                name: item.name,
                price: item.price || 0,
                icon: item.icon,
                type: item.type as any,
                googleMapsUrl: item.googleMapsUrl,
            })) || []

        // Add selected additional items names to whatYouGet
        const selectedAdditionalNames = experience.additionalItems
            ?.filter(item => {
                const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                return selections.additionalItems.includes(itemId)
            })
            .map(item => item.name) || []
        whatYouGet.push(...selectedAdditionalNames)

        // Add location
        if (selectedLocationName && selectedLocationName !== 'Не е избрана локация') {
            whatYouGet.push(`📍 ${selectedLocationName}`)
        }

        // Find selected voucher details
        const selectedVoucherItem = experience.additionalItems?.find(item => {
            const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
            return item.type === 'voucher' && selections.additionalItems.includes(itemId)
        })

        addItem({
            id: `${experience.id}-${Date.now()}`,
            productType: 'experience',
            title: experience.title,
            price: totalPrice,
            icon: experience.visuals?.iconName || 'Car',
            whatYouGet,
            additionalItems: selections.additionalItems,
            selectedLocation: selections.selectedLocation,
            selectedVoucher: selectedVoucherItem?.id || selectedVoucherItem?.name.toLowerCase().replace(/\s+/g, '-') || null,
            selectedDuration: selections.selectedDuration,
            experienceSlug: experience.slug,
            imageUrl,
            themeColor,
            selectedDate: selections.selectedDate,
            // Store addon data for cart display (no DRIFT_EXPERIENCES lookup needed)
            storedAddons: selectedAddonsData,
            storedLocationName: selectedLocationName !== 'Не е избрана локация' ? selectedLocationName : undefined,
            storedVoucherName: selectedVoucherItem?.name,
            storedDurationName: selectedDurationItem?.name,
            storedLocationUrl: googleMapsUrl,
            storedSelectedDate: selections.selectedDate
                ? new Date(selections.selectedDate).toLocaleDateString('bg-BG', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
                : undefined,
        })
    }

    // Get pattern component
    const PatternComponent = PATTERN_COMPONENTS[pattern]

    return (
        <div className="mt-4">
            <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden relative">
                {/* Pattern strip at top */}
                {PatternComponent && (
                    <div className="absolute top-0 left-0 right-0 h-15 overflow-hidden">
                        <PatternComponent className="opacity-100" />
                    </div>
                )}

                <CardHeader className="pb-4 mt-4 border-b border-slate-800 bg-slate-950/50 relative">
                    <div className="pt-2">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
                                Резервация
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-bold">Pro Equipment</span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">
                            {experience.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">{experience.subtitle || ''}</p>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* Base Price Display */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-500">Базова цена</span>
                            {hasPrice ? (
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    {experience.price}
                                    <span className={`text-sm font-bold ml-1 ${theme.text}`}>
                                        €
                                    </span>
                                </span>
                            ) : (
                                <span className={`text-xl font-black uppercase tracking-tight ${theme.text}`}>
                                    ПО ДОГОВАРЯНЕ
                                </span>
                            )}
                        </div>
                        <div className="bg-slate-800 px-3 py-1 rounded text-xs font-medium text-slate-300">
                            {selectedDurationItem ? selectedDurationItem.name : (experience.duration || '60 мин')}
                        </div>
                    </div>

                    {/* Selected Location with Google Maps Button */}
                    {selectedLocationItem && (
                        <>
                            <Separator className="bg-slate-800" />
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Локация</h4>
                                {googleMapsUrl ? (
                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${theme.border} ${theme.bgFaded} hover:scale-[1.02] transition-all cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin className={`w-5 h-5 ${theme.text}`} />
                                            <span className="text-white font-medium">{selectedLocationName}</span>
                                        </div>
                                        <ExternalLink className={`w-4 h-4 ${theme.text}`} />
                                    </a>
                                ) : (
                                    <div className={`flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/50`}>
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-300">{selectedLocationName}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Selected Additional Items */}
                    {(selections.additionalItems.length > 0 || selections.selectedDuration) && (
                        <>
                            <Separator className="bg-slate-800" />
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Допълнения</h4>

                                {/* Additional Services */}
                                {experience.additionalItems
                                    ?.filter(item => {
                                        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                                        // Include regular selected addons OR the selected duration
                                        return (selections.additionalItems.includes(itemId) && item.type !== 'location') ||
                                            (item.type === 'duration' && itemId === selections.selectedDuration)
                                    })
                                    .map(item => {
                                        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                                        const IconComponent = getAddonIcon(item.name, item.icon, item.type)

                                        return (
                                            <div key={itemId} className={`flex items-center justify-between p-3 rounded-lg border-2 ${theme.border} ${theme.bgFaded} transition-all`}>
                                                <div className="flex items-center gap-3">
                                                    {IconComponent ? (
                                                        <IconComponent className={`w-5 h-5 ${theme.text}`} />
                                                    ) : (
                                                        <div className={`w-5 h-5 rounded-full ${theme.bg}`} />
                                                    )}
                                                    <span className="text-white font-medium text-sm">{item.name}</span>
                                                </div>
                                                {item.price && item.price > 0 ? (
                                                    <span className={`font-bold text-sm ${theme.text}`}>
                                                        +{item.price} €
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-bold uppercase">Вкл.</span>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        </>
                    )}

                    {/* Total Price - Only show if has base price OR duration is selected */}
                    {(hasPrice || selectedDurationItem) && (
                        <>
                            <Separator className="bg-slate-800" />
                            <div className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-white">Обща цена</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">
                                        {totalPrice}
                                        <span className={`text-lg font-bold ml-1 ${theme.text}`}>
                                            €
                                        </span>
                                    </span>
                                </div>

                                {(() => {
                                    const bgnPrice = formatBGN(totalPrice);
                                    if (!bgnPrice) return null;

                                    return (
                                        <div className="flex justify-end">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                / <span className="text-slate-400">{bgnPrice} лв.</span>
                                            </span>
                                        </div>
                                    );
                                })()}

                            </div>
                        </>
                    )}


                    {/* Kill-switch Dialog */}
                    <Dialog open={offlineDialogOpen} onOpenChange={setOfflineDialogOpen}>
                        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-sm sm:max-w-md w-[calc(100%-2rem)] rounded-2xl p-8">
                            <DialogHeader className="flex flex-col items-center gap-4 text-center">
                                <div className="p-4 bg-slate-800 rounded-full">
                                    <PhoneCall className="w-10 h-10 text-amber-400" />
                                </div>
                                <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight text-white">
                                    Моля обадете се на телефон:
                                </DialogTitle>
                                <DialogDescription className="text-sm sm:text-base text-slate-400 font-medium">
                                    Временно онлайн резервациите не работят.
                                </DialogDescription>
                                <div className="flex items-center gap-2 w-full">
                                    <a
                                        href="tel:+359882726020"
                                        className="flex-1 inline-flex items-center text-nowrap justify-center gap-3 px-6 py-4 rounded-xl bg-mix text-black font-black text-xl sm:text-2xl hover:bg-amber-300 transition-all hover:scale-105 shadow-lg shadow-amber-400/20"
                                    >
                                        <PhoneCall className="w-6 h-6 shrink-0" />
                                        +359 882726020
                                    </a>
                                    <CopyButton number="+359882726020" />
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    {/* Add to Cart Button */}
                    <Button
                        variant="default"
                        onClick={onlineCheckoutEnabled ? handleAddToCart : () => setOfflineDialogOpen(true)}
                        className="w-full h-14 text-lg font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
                    >
                        <span className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Добави в Количката
                        </span>
                    </Button>

                    <div className={`p-5 rounded-xl border-2 ${theme.border} ${theme.bgFaded} space-y-4 shadow-xl`}>
                        <div className="flex items-center gap-2 justify-center">
                            <LucideIcons.CreditCard className={`w-5 h-5 ${theme.text}`} />
                            <span className="text-white font-black text-xs uppercase tracking-widest">
                                Начин на плащане
                            </span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-center text-white font-black uppercase italic tracking-tight">
                                * Плащането се извършва <span className={`${theme.text}`}>ОНЛАЙН</span> *
                            </p>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-wide">
                                    За наложен платеж се обадете:
                                </p>
                                <a
                                    href="tel:+359882726020"
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 border-2 ${theme.border} text-white font-black text-sm hover:scale-105 transition-all shadow-lg`}
                                >
                                    <LucideIcons.Phone className={`w-4 h-4 ${theme.text}`} />
                                    +359 88 272 6020
                                </a>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div >
    )
}
