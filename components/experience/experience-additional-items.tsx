'use client'

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check, CalendarDays, Info } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { getThemeClasses, type ThemeColor } from "./types"
import type { AdditionalItem } from "@/types/payload-types"
import { useCartStore } from "@/lib/stores/cart-store"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface ExperienceAdditionalItemsProps {
    items: AdditionalItem[]
    themeColor?: ThemeColor
    experienceId: string
}

/**
 * Get Lucide icon component by name, with fallback
 */
function getIconComponent(iconName?: string) {
    if (!iconName) return null
    const Icon = (LucideIcons as any)[iconName]
    return Icon || null
}

export function ExperienceAdditionalItems({
    items,
    themeColor = 'main',
    experienceId
}: ExperienceAdditionalItemsProps) {
    const theme = getThemeClasses(themeColor)

    // Use Zustand store for selections
    const { driftSelections, updateDriftSelections } = useCartStore()
    const selections = driftSelections[experienceId] || {
        additionalItems: [],
        selectedLocation: null,
        selectedDuration: null,
        selectedDate: null
    }

    // Separate items by type
    const regularItems = items.filter(item => item.type === 'standard')
    const locationItems = items.filter(item => item.type === 'location')
    const voucherItems = items.filter(item => item.type === 'voucher')
    const durationItems = items.filter(item => item.type === 'duration')

    // Group single-choice cards (vouchers and locations)
    const singleChoiceCards = [...voucherItems, ...locationItems]
    const isOddCount = singleChoiceCards.length % 2 !== 0

    // Initialize with default selections - preselect first duration and free voucher
    React.useEffect(() => {
        let needsUpdate = false
        let newLocation = selections.selectedLocation
        let newDuration = selections.selectedDuration
        let newAdditionalItems = [...selections.additionalItems]

        // Auto-select first location if none selected
        if (!selections.selectedLocation && locationItems.length > 0) {
            newLocation = locationItems[0]?.id || locationItems[0]?.name.toLowerCase().replace(/\s+/g, '-')
            needsUpdate = true
        }

        // Auto-select first duration if none selected
        if (!selections.selectedDuration && durationItems.length > 0) {
            newDuration = durationItems[0]?.id || durationItems[0]?.name.toLowerCase().replace(/\s+/g, '-')
            needsUpdate = true
        }

        // Auto-select first voucher (prioritize free ones)
        if (voucherItems.length > 0) {
            const hasVoucher = voucherItems.some(v => {
                const voucherId = v.id || v.name.toLowerCase().replace(/\s+/g, '-')
                return selections.additionalItems.includes(voucherId)
            })
            if (!hasVoucher) {
                const freeVoucher = voucherItems.find(v => !v.price || v.price === 0)
                const defaultVoucher = freeVoucher || voucherItems[0]
                if (defaultVoucher) {
                    const voucherId = defaultVoucher.id || defaultVoucher.name.toLowerCase().replace(/\s+/g, '-')
                    newAdditionalItems.push(voucherId)
                    needsUpdate = true
                }
            }
        }

        if (needsUpdate) {
            updateDriftSelections(experienceId, newAdditionalItems, newLocation, newDuration)
        }
    }, [experienceId, locationItems, voucherItems, durationItems, selections.additionalItems, selections.selectedLocation, selections.selectedDuration, updateDriftSelections])

    const toggleItem = (item: AdditionalItem) => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')

        if (item.type === 'location') {
            const newLocation = selections.selectedLocation === itemId ? null : itemId
            updateDriftSelections(experienceId, selections.additionalItems, newLocation, selections.selectedDuration)
        } else if (item.type === 'voucher') {
            let currentItems = [...selections.additionalItems]
            currentItems = currentItems.filter(id => !voucherItems.some(v => {
                const vid = v.id || v.name.toLowerCase().replace(/\s+/g, '-')
                return vid === id
            }))
            if (!selections.additionalItems.includes(itemId)) {
                currentItems.push(itemId)
            }
            updateDriftSelections(experienceId, currentItems, selections.selectedLocation, selections.selectedDuration)
        } else if (item.type === 'duration') {
            const newDuration = selections.selectedDuration === itemId ? null : itemId
            updateDriftSelections(experienceId, selections.additionalItems, selections.selectedLocation, newDuration)
        } else {
            const currentItems = new Set(selections.additionalItems)
            if (currentItems.has(itemId)) {
                currentItems.delete(itemId)
            } else {
                currentItems.add(itemId)
            }
            updateDriftSelections(experienceId, Array.from(currentItems), selections.selectedLocation, selections.selectedDuration)
        }
    }

    const renderItemCard = (item: AdditionalItem, isSelected: boolean, isCompact: boolean = false) => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
        const IconComponent = getIconComponent(item.icon)

        return (
            <Card
                key={itemId}
                onClick={() => toggleItem(item)}
                className={cn(
                    "relative cursor-pointer transition-all duration-300 bg-slate-900 border-2 hover:scale-[1.02] hover:shadow-lg",
                    isSelected ? `${theme.border} ${theme.bgFaded}` : 'border-slate-800 hover:border-slate-700'
                )}
            >
                {isSelected && (
                    <div className={cn("absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center", theme.bg)}>
                        <Check className="h-3 w-3 text-black font-bold" />
                    </div>
                )}
                <CardContent className="px-4 flex items-center gap-4">
                    {IconComponent && (
                        <div className={cn("p-3 rounded-xl flex-shrink-0", isSelected ? theme.bgFaded : 'bg-slate-800')}>
                            <IconComponent className={cn("h-6 w-6", isSelected ? theme.text : 'text-slate-400')} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className={cn("font-bold text-base", !isCompact && 'mb-1', isSelected ? 'text-white' : 'text-slate-300')}>
                            {item.name}
                        </h4>
                        {item.description && !isCompact && <p className="text-xs text-slate-500">{item.description}</p>}
                    </div>
                    {/* Price - only if > 0 */}
                    {item.price && item.price > 0 && (
                        <div className={cn("text-xl font-black", isSelected ? theme.text : 'text-slate-400')}>
                            +{item.price} €
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    const renderDurationGrid = (isCompact: boolean = false) => (
        <div className={cn("grid grid-cols-3 gap-2", !isCompact && "col-span-2")}>
            {durationItems.map((item) => {
                const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                const isSelected = selections.selectedDuration === itemId

                return (
                    <Card
                        key={itemId}
                        onClick={() => toggleItem(item)}
                        className={cn(
                            "relative cursor-pointer transition-all duration-300 bg-slate-900 border-2 py-4 px-2 h-full flex flex-col hover:scale-[1.02] hover:shadow-lg text-center",
                            isSelected
                                ? `${theme.border} ${theme.bgFaded}`
                                : 'border-slate-800 hover:border-slate-700'
                        )}
                    >
                        {/* Selected Checkmark */}
                        {isSelected && (
                            <div className={cn(
                                "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center",
                                theme.bg
                            )}>
                                <Check className="h-3 w-3 text-black font-bold" />
                            </div>
                        )}

                        {/* CENTERED NAME */}
                        <div className="flex flex-1 items-center justify-center">
                            <h4
                                className={cn(
                                    "font-bold text-sm uppercase tracking-tight",
                                    isSelected ? 'text-white' : 'text-slate-400'
                                )}
                            >
                                {item.name}
                            </h4>
                        </div>

                        {/* PRICE AT BOTTOM */}
                        <div
                            className={cn(
                                "text-xs font-black -mt-8",
                                isSelected ? theme.text : 'text-slate-500'
                            )}
                        >
                            +{item.price || 0} €
                        </div>
                    </Card>
                )
            })}
        </div>
    )



    return (
        <div className="space-y-4">
            {/* Regular Items */}
            {regularItems.map((item) => renderItemCard(item, selections.additionalItems.includes(item.id || item.name.toLowerCase().replace(/\s+/g, '-')), false))}

            {/* Single Choice Items (Vouchers & Locations) with Dynamic Duration Placement */}
            {singleChoiceCards.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {singleChoiceCards.map((item, index) => {
                        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                        const isSelected = item.type === 'location'
                            ? selections.selectedLocation === itemId
                            : selections.additionalItems.includes(itemId)

                        return (
                            <React.Fragment key={itemId}>
                                {renderItemCard(item, isSelected, true)}
                                {index === singleChoiceCards.length - 1 && isOddCount && durationItems.length > 0 && (
                                    renderDurationGrid(true)
                                )}
                            </React.Fragment>
                        )
                    })}
                    {!isOddCount && durationItems.length > 0 && renderDurationGrid(false)}
                </div>
            ) : (
                /* Fallback if no single choice items: just show durations */
                durationItems.length > 0 && renderDurationGrid(false)
            )}

            {/* Date Picker Section */}
            <Card className={cn("bg-slate-900 border-2", selections.selectedDate ? `${theme.border} ${theme.bgFaded}` : 'border-slate-800')}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn("p-3 rounded-xl", selections.selectedDate ? theme.bgFaded : 'bg-slate-800')}>
                            <CalendarDays className={cn("h-6 w-6", selections.selectedDate ? theme.text : 'text-slate-400')} />
                        </div>
                        <div>
                            <h4 className={cn("font-bold text-base", selections.selectedDate ? 'text-white' : 'text-slate-300')}>
                                Предпочитана дата
                            </h4>
                            {selections.selectedDate && (
                                <p className={cn("text-sm font-semibold", theme.text)}>
                                    {new Date(selections.selectedDate).toLocaleDateString('bg-BG', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selections.selectedDate ? new Date(selections.selectedDate) : undefined}
                            onSelect={(date) => {
                                const formattedDate = date
                                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                    : null
                                updateDriftSelections(
                                    experienceId,
                                    selections.additionalItems,
                                    selections.selectedLocation,
                                    selections.selectedDuration,
                                    formattedDate
                                )
                            }}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border border-slate-700"
                        />
                    </div>
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-slate-800 border border-slate-700">
                        <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400">
                            Избраната дата е предпочитана и ще бъде потвърдена по телефон след покупката.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
