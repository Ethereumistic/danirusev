'use client'

import { useMemo } from 'react'

export interface ProductVariant {
    stock: number
    priceModifier?: number
    sku?: string
    options: Record<string, string>
}

export interface Product {
    stock?: number
    lowStockThreshold?: number
    variants?: ProductVariant[]
}

export interface ProductStockResult {
    currentStock: number
    isOutOfStock: boolean
    isLowStock: boolean
    stockMessage: string | null
}

/**
 * React hook for managing product stock state
 * Handles both simple products and products with variants
 * 
 * @param product - The product object
 * @param selectedVariant - The currently selected variant (if applicable)
 * @returns Stock information and UI state flags
 */
export function useProductStock(
    product: Product | null | undefined,
    selectedVariant?: ProductVariant | null
): ProductStockResult {
    return useMemo(() => {
        if (!product) {
            return {
                currentStock: 0,
                isOutOfStock: true,
                isLowStock: false,
                stockMessage: 'Product not available',
            }
        }

        // Determine current stock based on variant presence
        let currentStock: number

        if (product.variants && product.variants.length > 0) {
            // Product has variants - use selected variant's stock
            if (selectedVariant) {
                currentStock = selectedVariant.stock ?? 0
            } else {
                // No variant selected yet
                return {
                    currentStock: 0,
                    isOutOfStock: false,
                    isLowStock: false,
                    stockMessage: 'Please select options',
                }
            }
        } else {
            // Simple product without variants - use product's stock
            currentStock = product.stock ?? 0
        }

        const lowStockThreshold = product.lowStockThreshold ?? 5
        const isOutOfStock = currentStock === 0
        const isLowStock = currentStock > 0 && currentStock <= lowStockThreshold

        let stockMessage: string | null = null

        if (isOutOfStock) {
            stockMessage = 'Out of Stock'
        } else if (isLowStock) {
            stockMessage = `Low Stock: Only ${currentStock} left!`
        }

        return {
            currentStock,
            isOutOfStock,
            isLowStock,
            stockMessage,
        }
    }, [product, selectedVariant])
}
