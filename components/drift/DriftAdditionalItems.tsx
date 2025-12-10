'use client';

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { AdditionalItem, ThemeColor } from "@/lib/drift-data";
import { useCartStore } from "@/lib/stores/cart-store";

interface DriftAdditionalItemsProps {
    items: AdditionalItem[];
    themeColor: ThemeColor;
    experienceId: string;
}

export function DriftAdditionalItems({ items, themeColor, experienceId }: DriftAdditionalItemsProps) {
    // Use Zustand store instead of local state
    const { driftSelections, updateDriftSelections } = useCartStore();
    const selections = driftSelections[experienceId] || { additionalItems: [], selectedLocation: null };

    // Separate items by type
    const regularItems = items.filter(item => !item.isLocation && !item.isVoucher);
    const locationItems = items.filter(item => item.isLocation);
    const voucherItems = items.filter(item => item.isVoucher);

    // Initialize with default selections if they don't exist
    React.useEffect(() => {
        let needsUpdate = false;
        let newLocation = selections.selectedLocation;
        let newAdditionalItems = [...selections.additionalItems];

        // Default location to Tryavna
        if (!selections.selectedLocation && locationItems.length > 0) {
            const defaultLocation = locationItems.find(item => item.id === 'location-tryavna')?.id || locationItems[0]?.id;
            if (defaultLocation) {
                newLocation = defaultLocation;
                needsUpdate = true;
            }
        }

        // Default voucher to digital
        if (voucherItems.length > 0) {
            const hasVoucher = voucherItems.some(v => selections.additionalItems.includes(v.id));
            if (!hasVoucher) {
                const digitalVoucher = voucherItems.find(v => v.id === 'voucher-digital');
                if (digitalVoucher) {
                    newAdditionalItems.push(digitalVoucher.id);
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            updateDriftSelections(experienceId, newAdditionalItems, newLocation);
        }
    }, [experienceId, locationItems, voucherItems, selections.additionalItems, selections.selectedLocation, updateDriftSelections]);

    const toggleItem = (itemId: string, isLocation: boolean = false, isVoucher: boolean = false) => {
        if (isLocation) {
            // For location items, toggle single selection
            const newLocation = selections.selectedLocation === itemId ? null : itemId;
            updateDriftSelections(experienceId, selections.additionalItems, newLocation);
        } else if (isVoucher) {
            // For voucher items, toggle single selection (mutually exclusive)
            let currentItems = [...selections.additionalItems];
            // Remove all other vouchers
            currentItems = currentItems.filter(id => !voucherItems.some(v => v.id === id));
            // Toggle the clicked voucher
            if (!selections.additionalItems.includes(itemId)) {
                currentItems.push(itemId);
            }
            updateDriftSelections(experienceId, currentItems, selections.selectedLocation);
        } else {
            // For regular items, toggle multi-selection
            const currentItems = new Set(selections.additionalItems);
            if (currentItems.has(itemId)) {
                currentItems.delete(itemId);
            } else {
                currentItems.add(itemId);
            }
            updateDriftSelections(experienceId, Array.from(currentItems), selections.selectedLocation);
        }
    };

    // Dynamic color classes based on theme
    const getBorderColorClass = () => {
        switch (themeColor) {
            case 'taxi': return 'border-taxi';
            case 'rent': return 'border-rent';
            case 'mix': return 'border-mix';
            default: return 'border-main';
        }
    };

    const getBgColorClass = () => {
        switch (themeColor) {
            case 'taxi': return 'bg-taxi/10';
            case 'rent': return 'bg-rent/10';
            case 'mix': return 'bg-mix/10';
            default: return 'bg-main/10';
        }
    };

    const getIconColorClass = () => {
        switch (themeColor) {
            case 'taxi': return 'text-taxi';
            case 'rent': return 'text-rent';
            case 'mix': return 'text-mix';
            default: return 'text-main';
        }
    };

    const getTextColorClass = () => {
        switch (themeColor) {
            case 'taxi': return 'text-taxi';
            case 'rent': return 'text-rent';
            case 'mix': return 'text-mix';
            default: return 'text-main';
        }
    };

    // Helper function to get icon component
    const getIconComponent = (iconName: string, isSelected: boolean) => {
        const Icon = (LucideIcons as any)[iconName];
        if (!Icon) return null;
        return <Icon className={`h-6 w-6 ${isSelected ? getIconColorClass() : 'text-slate-400'}`} />;
    };

    // Render a single item card (can be full-width or half-width)
    const renderItemCard = (item: AdditionalItem, isSelected: boolean, isLocation: boolean = false, isVoucher: boolean = false) => (
        <Card
            key={item.id}
            onClick={() => toggleItem(item.id, isLocation, isVoucher)}
            className={`
                relative cursor-pointer transition-all duration-300
                bg-slate-900 border-2
                hover:scale-[1.02] hover:shadow-lg
                ${isSelected
                    ? `${getBorderColorClass()} ${getBgColorClass()}`
                    : 'border-slate-800 hover:border-slate-700'
                }
            `}
        >
            {/* Selected Checkmark */}
            {isSelected && (
                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${themeColor === 'taxi' ? 'bg-taxi' :
                    themeColor === 'rent' ? 'bg-rent' :
                        themeColor === 'mix' ? 'bg-mix' :
                            'bg-main'
                    }`}>
                    <Check className="h-3 w-3 text-black font-bold" />
                </div>
            )}

            <CardContent className="px-4 flex items-center gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl flex-shrink-0 ${isSelected ? getBgColorClass() : 'bg-slate-800'}`}>
                    {getIconComponent(item.icon, isSelected)}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className={`font-bold text-base ${!isLocation && !isVoucher && 'mb-1'} ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.name}
                    </h4>
                    {!isLocation && !isVoucher && (
                        <p className="text-xs text-slate-500">
                            {item.description}
                        </p>
                    )}
                </div>

                {/* Price */}
                {item.price > 0 && (
                    <div className={`text-xl font-black ${isSelected ? getTextColorClass() : 'text-slate-400'}`}>
                        +{item.price} BGN
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-2">
            {/* Regular Items - Full Width */}
            {regularItems.map((item) => {
                const isSelected = selections.additionalItems.includes(item.id);
                return renderItemCard(item, isSelected, false, false);
            })}

            {/* Voucher Selector - Two Columns in One Row */}
            {voucherItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {voucherItems.map((item) => {
                        const isSelected = selections.additionalItems.includes(item.id);
                        return renderItemCard(item, isSelected, false, true);
                    })}
                </div>
            )}

            {/* Location Selector - Two Columns in One Row */}
            {locationItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {locationItems.map((item) => {
                        const isSelected = selections.selectedLocation === item.id;
                        return renderItemCard(item, isSelected, true, false);
                    })}
                </div>
            )}
        </div>
    );
}
