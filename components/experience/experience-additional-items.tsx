'use client'

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check, CalendarDays, Info } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { getThemeClasses, type ThemeColor } from "./types"
import type { AdditionalItem } from "@/types/payload-types"
import { useCartStore } from "@/lib/stores/cart-store"
import { Calendar } from "@/components/ui/calendar"

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
    const selections = driftSelections[experienceId] || { additionalItems: [], selectedLocation: null, selectedDate: null }

    // Separate items by type
    const regularItems = items.filter(item => item.type === 'standard')
    const locationItems = items.filter(item => item.type === 'location')
    const voucherItems = items.filter(item => item.type === 'voucher')

    // Initialize with default selections - preselect first free option
    React.useEffect(() => {
        let needsUpdate = false
        let newLocation = selections.selectedLocation
        let newAdditionalItems = [...selections.additionalItems]

        // Auto-select first location if none selected
        if (!selections.selectedLocation && locationItems.length > 0) {
            newLocation = locationItems[0]?.id || locationItems[0]?.name.toLowerCase().replace(/\s+/g, '-')
            needsUpdate = true
        }

        // Auto-select first voucher (prioritize free ones)
        if (voucherItems.length > 0) {
            const hasVoucher = voucherItems.some(v => {
                const voucherId = v.id || v.name.toLowerCase().replace(/\s+/g, '-')
                return selections.additionalItems.includes(voucherId)
            })
            if (!hasVoucher) {
                // Find free voucher first, otherwise first one
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
            updateDriftSelections(experienceId, newAdditionalItems, newLocation)
        }
    }, [experienceId, locationItems, voucherItems, selections.additionalItems, selections.selectedLocation, updateDriftSelections])

    const toggleItem = (item: AdditionalItem) => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')

        if (item.type === 'location') {
            // For location items, toggle single selection
            const newLocation = selections.selectedLocation === itemId ? null : itemId
            updateDriftSelections(experienceId, selections.additionalItems, newLocation)
        } else if (item.type === 'voucher') {
            // For voucher items, toggle single selection (mutually exclusive)
            let currentItems = [...selections.additionalItems]
            // Remove all other vouchers
            currentItems = currentItems.filter(id => !voucherItems.some(v => {
                const vid = v.id || v.name.toLowerCase().replace(/\s+/g, '-')
                return vid === id
            }))
            // Toggle the clicked voucher
            if (!selections.additionalItems.includes(itemId)) {
                currentItems.push(itemId)
            }
            updateDriftSelections(experienceId, currentItems, selections.selectedLocation)
        } else {
            // For regular items, toggle multi-selection
            const currentItems = new Set(selections.additionalItems)
            if (currentItems.has(itemId)) {
                currentItems.delete(itemId)
            } else {
                currentItems.add(itemId)
            }
            updateDriftSelections(experienceId, Array.from(currentItems), selections.selectedLocation)
        }
    }

    // Render a single item card
    const renderItemCard = (item: AdditionalItem, isSelected: boolean, isCompact: boolean = false) => {
        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
        const IconComponent = getIconComponent(item.icon)

        return (
            <Card
                key={itemId}
                onClick={() => toggleItem(item)}
                className={`
                    relative cursor-pointer transition-all duration-300
                    bg-slate-900 border-2
                    hover:scale-[1.02] hover:shadow-lg
                    ${isSelected
                        ? `${theme.border} ${theme.bgFaded}`
                        : 'border-slate-800 hover:border-slate-700'
                    }
                `}
            >
                {/* Selected Checkmark */}
                {isSelected && (
                    <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${theme.bg}`}>
                        <Check className="h-3 w-3 text-black font-bold" />
                    </div>
                )}

                <CardContent className="px-4 flex items-center gap-4">
                    {/* Icon - only if provided */}
                    {IconComponent && (
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isSelected ? theme.bgFaded : 'bg-slate-800'}`}>
                            <IconComponent className={`h-6 w-6 ${isSelected ? theme.text : 'text-slate-400'}`} />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                        <h4 className={`font-bold text-base ${!isCompact && 'mb-1'} ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {item.name}
                        </h4>
                        {/* Show description only for standard items or if provided */}
                        {item.description && !isCompact && (
                            <p className="text-xs text-slate-500">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Price - only if > 0 */}
                    {item.price && item.price > 0 && (
                        <div className={`text-xl font-black ${isSelected ? theme.text : 'text-slate-400'}`}>
                            +{item.price} BGN
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-2">
            {/* Regular Items - Full Width */}
            {regularItems.map((item) => {
                const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                const isSelected = selections.additionalItems.includes(itemId)
                return renderItemCard(item, isSelected, false)
            })}

            {/* Voucher Selector - Two Columns */}
            {voucherItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {voucherItems.map((item) => {
                        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                        const isSelected = selections.additionalItems.includes(itemId)
                        return renderItemCard(item, isSelected, true)
                    })}
                </div>
            )}

            {/* Location Selector - Two Columns */}
            {locationItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {locationItems.map((item) => {
                        const itemId = item.id || item.name.toLowerCase().replace(/\s+/g, '-')
                        const isSelected = selections.selectedLocation === itemId
                        return renderItemCard(item, isSelected, true)
                    })}
                </div>
            )}

            {/* Date Picker Section */}
            <Card className={`bg-slate-900 border-2 ${selections.selectedDate ? `${theme.border} ${theme.bgFaded}` : 'border-slate-800'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${selections.selectedDate ? theme.bgFaded : 'bg-slate-800'}`}>
                            <CalendarDays className={`h-6 w-6 ${selections.selectedDate ? theme.text : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-base ${selections.selectedDate ? 'text-white' : 'text-slate-300'}`}>
                                Предпочитана дата
                            </h4>
                            {selections.selectedDate && (
                                <p className={`text-sm font-semibold ${theme.text}`}>
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
                                // Format as YYYY-MM-DD to prevent timezone shift
                                const formattedDate = date
                                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                    : null
                                updateDriftSelections(
                                    experienceId,
                                    selections.additionalItems,
                                    selections.selectedLocation,
                                    formattedDate
                                )
                            }}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border border-slate-700"
                        />
                    </div>

                    {/* Info note about date confirmation */}
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
