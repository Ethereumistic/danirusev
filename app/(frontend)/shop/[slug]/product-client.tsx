'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resolveImage } from '@/lib/utils/resolve-image'
import { useProductStock } from '@/lib/hooks/useProductStock'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'

interface ProductClientProps {
    product: any
}

export default function ProductClient({ product }: ProductClientProps) {
    // State for selected variant options
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    // Auto-select first option values on mount
    useEffect(() => {
        if (Object.keys(selectedOptions).length > 0) return

        // Try to get initial selection from first variant
        if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0]
            if (firstVariant?.options) {
                const options = typeof firstVariant.options === 'string'
                    ? JSON.parse(firstVariant.options)
                    : firstVariant.options
                setSelectedOptions(options)
                return
            }
        }

        // Fallback: build selection from optionDefinitions (first value of each option)
        if (product.optionDefinitions && product.optionDefinitions.length > 0) {
            const initialOptions: Record<string, string> = {}
            for (const optDef of product.optionDefinitions) {
                if (optDef.values && optDef.values.length > 0) {
                    initialOptions[optDef.name] = optDef.values[0].value
                }
            }
            if (Object.keys(initialOptions).length > 0) {
                setSelectedOptions(initialOptions)
            }
        }
    }, [product.variants, product.optionDefinitions])

    // Find the variant that matches selected options
    const selectedVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null
        if (!selectedOptions || Object.keys(selectedOptions).length === 0) return null

        return product.variants.find((variant: any) => {
            if (!variant.options) return false

            const variantOptions = typeof variant.options === 'string'
                ? JSON.parse(variant.options)
                : variant.options

            return Object.entries(selectedOptions).every(
                ([key, value]) => variantOptions[key] === value
            )
        }) || null
    }, [product.variants, selectedOptions])

    // Use stock management hook
    const { currentStock, isOutOfStock, isLowStock, stockMessage } = useProductStock(
        product,
        selectedVariant
    )

    const addToCart = useCartStore((state) => state.addItem)

    /**
     * Determine which images to display
     * Priority chain (simplified):
     * 1. Selected variant's images (if any)
     * 2. Option value's image for selected color (if exists)
     * 3. Main product gallery
     */
    const displayImages = useMemo(() => {
        // 1. Check selected variant's images
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            return selectedVariant.images
        }

        // 2. Check for option value images (Color option)
        if (product.optionDefinitions) {
            // Support both English 'Color' and Bulgarian 'Цвят'
            const colorOption = product.optionDefinitions.find(
                (opt: any) => opt.name === 'Color' || opt.name === 'Цвят'
            )
            const selectedColor = selectedOptions['Color'] || selectedOptions['Цвят']

            if (colorOption?.values && selectedColor) {
                const colorValue = colorOption.values.find(
                    (val: any) => val.value === selectedColor
                )
                // Check if this option value has images
                if (colorValue?.images && colorValue.images.length > 0) {
                    // Return option value images, followed by main gallery
                    return [...colorValue.images, ...(product.gallery || [])].filter(Boolean)
                }
            }
        }

        // 3. Fallback to main product gallery
        if (product.gallery && product.gallery.length > 0) {
            return product.gallery
        }

        // 4. No images available
        return []
    }, [product, selectedOptions, selectedVariant])

    // Handle option selection
    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: value,
        }))
        setSelectedImageIndex(0) // Reset to first image when variant changes
    }

    // Check if all options are selected
    const allOptionsSelected =
        product.optionDefinitions?.every(
            (def: any) => selectedOptions[def.name]
        ) ?? true

    // Calculate final price
    const finalPrice = product.price + (selectedVariant?.priceModifier || 0)

    // Handle add to cart
    const handleAddToCart = () => {
        if (isOutOfStock || !allOptionsSelected) return

        addToCart({
            id: product.id,
            title: product.title,
            price: finalPrice,
            imageUrl: resolveImage(displayImages[0]) || '',
            themeColor: 'main',
            productType: 'physical',
            selectedVariant: selectedVariant
                ? {
                    options: typeof selectedVariant.options === 'string'
                        ? JSON.parse(selectedVariant.options)
                        : selectedVariant.options,
                    sku: selectedVariant.sku,
                }
                : undefined,
        })
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <Link
                    href="/shop"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                            {displayImages[selectedImageIndex] ? (
                                <Image
                                    src={resolveImage(displayImages[selectedImageIndex]) || ''}
                                    alt={`${product.title} - ${selectedImageIndex + 1}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid - Only show if multiple images */}
                        {displayImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {displayImages.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`aspect-square bg-muted rounded-lg overflow-hidden relative cursor-pointer transition-all ${selectedImageIndex === idx
                                            ? 'ring-2 ring-primary ring-offset-2'
                                            : 'hover:opacity-80'
                                            }`}
                                    >
                                        <Image
                                            src={resolveImage(img) || ''}
                                            alt={`${product.title} - ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{product.title}</h1>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-4">
                                {product.compareAtPrice && (
                                    <span className="text-2xl text-muted-foreground line-through">
                                        {product.compareAtPrice} BGN
                                    </span>
                                )}
                                <span className="text-3xl font-bold">
                                    {finalPrice.toFixed(2)} BGN
                                </span>
                            </div>

                            {/* Stock Message */}
                            {stockMessage && (
                                <div
                                    className={`text-sm font-medium ${isOutOfStock
                                        ? 'text-destructive'
                                        : isLowStock
                                            ? 'text-amber-600'
                                            : 'text-green-600'
                                        }`}
                                >
                                    {stockMessage}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="border-t pt-4">
                                <p className="text-muted-foreground whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Variant Options */}
                        {product.optionDefinitions && product.optionDefinitions.length > 0 && (
                            <div className="space-y-4">
                                {product.optionDefinitions.map((optionDef: any) => {
                                    return (
                                        <div key={optionDef.name}>
                                            <label className="block text-sm font-medium mb-2">
                                                {optionDef.name}
                                                {selectedOptions[optionDef.name] && (
                                                    <span className="text-muted-foreground ml-2">
                                                        - {selectedOptions[optionDef.name]}
                                                    </span>
                                                )}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {optionDef.values.map((val: any) => {
                                                    const hasPrimaryColor = val.primaryColorHex
                                                    const hasSecondaryColor = val.secondaryColorHex
                                                    const isSelected = selectedOptions[optionDef.name] === val.value

                                                    // Render color swatch if primaryColorHex exists
                                                    if (hasPrimaryColor) {
                                                        // Create split-circle style for dual colors
                                                        const swatchStyle = hasSecondaryColor
                                                            ? {
                                                                background: `conic-gradient(
                                                                    ${val.primaryColorHex} 0deg 180deg,
                                                                    ${val.secondaryColorHex} 180deg 360deg
                                                                )`,
                                                            }
                                                            : { backgroundColor: val.primaryColorHex }

                                                        return (
                                                            <button
                                                                key={val.value}
                                                                onClick={() => handleOptionSelect(optionDef.name, val.value)}
                                                                className={`relative w-10 h-10 rounded-full transition-all flex items-center justify-center ${isSelected
                                                                    ? 'ring-2 ring-primary ring-offset-2'
                                                                    : 'hover:scale-110'
                                                                    }`}
                                                                style={swatchStyle}
                                                                title={val.value}
                                                            >
                                                                {val.emoji && (
                                                                    <span
                                                                        className="text-lg select-none"
                                                                        style={{
                                                                            textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0px 4px rgba(255,255,255,0.5)'
                                                                        }}
                                                                    >
                                                                        {val.emoji}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )
                                                    }

                                                    // Fallback: text badge (no color)
                                                    return (
                                                        <button
                                                            key={val.value}
                                                            onClick={() => handleOptionSelect(optionDef.name, val.value)}
                                                            className={`px-4 py-2 border rounded-lg transition-colors ${isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border hover:border-primary'
                                                                }`}
                                                        >
                                                            {val.value}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setQuantity(Math.min(currentStock || 999, quantity + 1))
                                    }
                                    disabled={quantity >= currentStock}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || !allOptionsSelected}
                        >
                            {isOutOfStock
                                ? 'Out of Stock'
                                : !allOptionsSelected
                                    ? 'Select Options'
                                    : 'Add to Cart'}
                        </Button>

                        {/* SKU */}
                        {selectedVariant?.sku && (
                            <p className="text-sm text-muted-foreground">
                                SKU: {selectedVariant.sku}
                            </p>
                        )}

                        {/* Categories */}
                        {product.categories && product.categories.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories.map((cat: any) => (
                                        <span
                                            key={cat.id}
                                            className="px-3 py-1 bg-muted rounded-full text-sm"
                                        >
                                            {cat.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
