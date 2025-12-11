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

    // Auto-select first variant on mount
    useEffect(() => {
        if (!product.variants || product.variants.length === 0) return
        if (Object.keys(selectedOptions).length > 0) return // Don't override user selection

        const firstVariant = product.variants[0]
        if (firstVariant?.options) {
            setSelectedOptions(firstVariant.options)
        }
    }, [product.variants]) // Only run once when component mounts

    // Find the variant that matches selected options
    const selectedVariant = product.variants?.find((variant: any) => {
        if (!selectedOptions || Object.keys(selectedOptions).length === 0) return false
        return Object.entries(selectedOptions).every(
            ([key, value]) => variant.options[key] === value
        )
    })

    // Use stock management hook
    const { currentStock, isOutOfStock, isLowStock, stockMessage } = useProductStock(
        product,
        selectedVariant
    )

    const addToCart = useCartStore((state) => state.addItem)

    // Determine which images to display with priority chain (reactive to color selection)
    const displayImages = useMemo(() => {
        // 1. Check for color-specific gallery (for multi-option products like t-shirts)
        if (product.colorGalleries && product.colorGalleries.length > 0) {
            // Support both English 'Color' and Bulgarian 'Цвят' option names
            const selectedColor = selectedOptions['Color'] || selectedOptions['Цвят']

            if (selectedColor) {
                const colorGallery = product.colorGalleries.find(
                    (cg: any) => cg.colorName === selectedColor
                )
                if (colorGallery?.images && colorGallery.images.length > 0) {
                    return colorGallery.images
                }
            }

            // If no color selected yet, show first color gallery
            if (product.colorGalleries[0]?.images) {
                return product.colorGalleries[0].images
            }
        }

        // 2. Fallback to variant-specific gallery (for single-option products like mugs)
        if (selectedVariant?.variantGallery && selectedVariant.variantGallery.length > 0) {
            return selectedVariant.variantGallery
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
            selectedVariant: selectedVariant
                ? {
                    options: selectedVariant.options,
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
                                    alt={`${product.title} -${selectedImageIndex + 1}`}
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
                                {product.optionDefinitions.map((optionDef: any) => (
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
                                            {optionDef.values.map((val: any) => (
                                                <button
                                                    key={val.value}
                                                    onClick={() => handleOptionSelect(optionDef.name, val.value)}
                                                    className={`px-4 py-2 border rounded-lg transition-colors ${selectedOptions[optionDef.name] === val.value
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border hover:border-primary'
                                                        }`}
                                                >
                                                    {val.value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
