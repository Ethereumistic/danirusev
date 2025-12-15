'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useForm } from '@payloadcms/ui'

/**
 * Helper: Generate all combinations from arrays
 */
function cartesian<T>(...arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
        (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
        [[]]
    )
}

/**
 * Helper: Format string for SKU
 */
function formatForSku(str: string): string {
    return str
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9А-Я-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Helper: Extract option definitions from form data
 */
function extractOptionDefinitions(data: any): any[] {
    const optionDefs = data?.optionDefinitions
    if (!Array.isArray(optionDefs)) return []

    return optionDefs
        .filter((opt: any) => opt?.name && Array.isArray(opt?.values) && opt.values.length > 0)
        .map((opt: any) => ({
            name: opt.name,
            values: opt.values.filter((v: any) => v?.value).map((v: any) => ({ value: v.value }))
        }))
}

interface VariantGeneratorProps {
    path?: string
}

interface LocalVariantEdit {
    stock: number
    priceModifier: number
}

/**
 * VariantGenerator Component - With Editable Table & Apply Button
 */
export function VariantGenerator({ path }: VariantGeneratorProps) {
    const [processing, setProcessing] = useState(false)
    const [localEdits, setLocalEdits] = useState<Record<number, LocalVariantEdit>>({})
    const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false)
    const { getData, dispatchFields, setModified } = useForm()

    // Get current form data
    const formData = getData()
    const currentVariants = Array.isArray(formData?.variants) ? formData.variants : []
    const slug = formData?.slug || 'product'
    const optionDefinitions = extractOptionDefinitions(formData)

    // Initialize local edits when variants change
    useEffect(() => {
        const newEdits: Record<number, LocalVariantEdit> = {}
        currentVariants.forEach((variant: any, index: number) => {
            newEdits[index] = {
                stock: variant?.stock ?? 10,
                priceModifier: variant?.priceModifier ?? 0,
            }
        })
        setLocalEdits(newEdits)
        setHasUnappliedChanges(false)
    }, [currentVariants.length])

    const handleLocalEdit = (index: number, field: 'stock' | 'priceModifier', value: number) => {
        setLocalEdits(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value
            }
        }))
        setHasUnappliedChanges(true)
    }

    const applyChanges = useCallback(async () => {
        if (!dispatchFields || processing) return

        setProcessing(true)

        try {
            // Apply each edit using UPDATE with dot-notation path
            for (const [indexStr, edits] of Object.entries(localEdits)) {
                const index = parseInt(indexStr)

                await dispatchFields({
                    type: 'UPDATE',
                    path: `variants.${index}.stock`,
                    value: edits.stock,
                })

                await dispatchFields({
                    type: 'UPDATE',
                    path: `variants.${index}.priceModifier`,
                    value: edits.priceModifier,
                })
            }

            // Mark form as modified
            if (setModified) setModified(true)
            setHasUnappliedChanges(false)

        } catch (error) {
            console.error('Error applying changes:', error)
            alert('An error occurred while applying changes.')
        } finally {
            setProcessing(false)
        }
    }, [localEdits, dispatchFields, setModified, processing])

    const generateVariants = useCallback(async () => {
        if (processing) return

        if (!dispatchFields) {
            console.error('Form dispatch not available')
            return
        }

        if (!optionDefinitions || optionDefinitions.length === 0) {
            alert('Please add at least one option with values first.')
            return
        }

        setProcessing(true)

        try {
            // Build cartesian product
            const optionNames = optionDefinitions.map((opt: any) => opt.name as string)
            const optionValueArrays = optionDefinitions.map((opt: any) =>
                opt.values.map((v: any) => v.value as string)
            )

            const combinations = cartesian<string>(...optionValueArrays)

            // First, clear existing variants
            const existingCount = currentVariants.length
            for (let i = existingCount - 1; i >= 0; i--) {
                await dispatchFields({
                    type: 'REMOVE_ROW',
                    path: 'variants',
                    rowIndex: i,
                })
            }

            // Then add each new variant using ADD_ROW (properly initializes form state)
            for (const combo of combinations) {
                const options: Record<string, string> = {}
                combo.forEach((value, index) => {
                    options[optionNames[index]] = value
                })

                const skuParts = combo.map((v) => formatForSku(v))
                const sku = `${formatForSku(slug)}-${skuParts.join('-')}`

                // Add row with proper data - Payload will initialize internal state
                await dispatchFields({
                    type: 'ADD_ROW',
                    path: 'variants',
                    rowIndex: currentVariants.length,
                    subFieldState: {
                        options: { value: options, valid: true },
                        sku: { value: sku, valid: true },
                        stock: { value: 10, valid: true },
                        priceModifier: { value: 0, valid: true },
                    },
                })
            }

            // Mark form as modified so changes can be saved
            if (setModified) setModified(true)

        } catch (error) {
            console.error('Error generating variants:', error)
            alert('An error occurred while generating variants. Check the console for details.')
        } finally {
            setTimeout(() => setProcessing(false), 100)
        }
    }, [optionDefinitions, slug, currentVariants, dispatchFields, processing, setModified])

    const clearVariants = useCallback(async () => {
        if (!dispatchFields) return

        if (confirm('Are you sure you want to clear all variants?')) {
            setProcessing(true)
            try {
                const count = currentVariants.length
                for (let i = count - 1; i >= 0; i--) {
                    await dispatchFields({
                        type: 'REMOVE_ROW',
                        path: 'variants',
                        rowIndex: i,
                    })
                }
                if (setModified) setModified(true)
                setLocalEdits({})
                setHasUnappliedChanges(false)
            } finally {
                setProcessing(false)
            }
        }
    }, [currentVariants, dispatchFields, setModified])

    // Calculate stats
    const variantCount = currentVariants.length
    const totalStock = Object.values(localEdits).reduce((sum, edit) => sum + (edit?.stock || 0), 0)
    const optionCount = optionDefinitions.length

    return (
        <div style={{
            padding: '16px',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '8px',
            marginBottom: '16px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                        Variant Generator
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                        {optionCount > 0
                            ? `${optionCount} option(s) detected. SKU format: ${formatForSku(slug || 'product')}-OPTION1-OPTION2`
                            : 'Add options above first, then generate variants.'
                        }
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={generateVariants}
                        disabled={optionCount === 0 || processing}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: (optionCount > 0 && !processing) ? 'var(--theme-success-500)' : 'var(--theme-elevation-200)',
                            color: (optionCount > 0 && !processing) ? 'white' : 'var(--theme-elevation-500)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (optionCount > 0 && !processing) ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            fontWeight: 500,
                        }}
                    >
                        {processing ? 'Processing...' : (variantCount > 0 ? 'Regenerate Variants' : 'Generate Variants')}
                    </button>
                    {variantCount > 0 && (
                        <button
                            type="button"
                            onClick={clearVariants}
                            disabled={processing}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: processing ? 'var(--theme-elevation-200)' : 'var(--theme-error-500)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                            }}
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {variantCount > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--theme-elevation-100)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    marginBottom: '12px'
                }}>
                    <span><strong>{variantCount}</strong> variants</span>
                    <span><strong>{totalStock}</strong> total stock</span>
                    {hasUnappliedChanges && (
                        <span style={{ color: 'var(--theme-warning-500)', fontWeight: 500 }}>
                            ⚠️ Unsaved edits
                        </span>
                    )}
                </div>
            )}

            {/* Editable Variants Table */}
            {variantCount > 0 && (
                <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '12px'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--theme-elevation-100)' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--theme-elevation-200)' }}>SKU</th>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--theme-elevation-200)' }}>Options</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--theme-elevation-200)', width: '100px' }}>Stock</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--theme-elevation-200)', width: '100px' }}>Price Mod</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVariants.map((variant: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
                                        {variant?.sku || 'N/A'}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {variant?.options && typeof variant.options === 'object' && Object.entries(variant.options).map(([key, val]) => (
                                            <span key={key} style={{
                                                marginRight: '8px',
                                                padding: '2px 6px',
                                                backgroundColor: 'var(--theme-elevation-150)',
                                                borderRadius: '3px',
                                                fontSize: '11px'
                                            }}>
                                                {key}: {String(val)}
                                            </span>
                                        ))}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={localEdits[index]?.stock ?? 0}
                                            onChange={(e) => handleLocalEdit(index, 'stock', parseInt(e.target.value) || 0)}
                                            style={{
                                                width: '70px',
                                                padding: '4px 8px',
                                                border: '1px solid var(--theme-elevation-200)',
                                                borderRadius: '4px',
                                                backgroundColor: 'var(--theme-elevation-0)',
                                                fontSize: '12px',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={localEdits[index]?.priceModifier ?? 0}
                                            onChange={(e) => handleLocalEdit(index, 'priceModifier', parseFloat(e.target.value) || 0)}
                                            style={{
                                                width: '70px',
                                                padding: '4px 8px',
                                                border: '1px solid var(--theme-elevation-200)',
                                                borderRadius: '4px',
                                                backgroundColor: 'var(--theme-elevation-0)',
                                                fontSize: '12px',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Apply Changes Button */}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                        <p style={{
                            margin: 0,
                            fontSize: '11px',
                            color: 'var(--theme-elevation-500)',
                            fontStyle: 'italic'
                        }}>
                            💡 Edit values above, then click "Apply Changes" to save. For images, use the Variants array below.
                        </p>
                        <button
                            type="button"
                            onClick={applyChanges}
                            disabled={!hasUnappliedChanges || processing}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: (hasUnappliedChanges && !processing) ? 'var(--theme-success-500)' : 'var(--theme-elevation-200)',
                                color: (hasUnappliedChanges && !processing) ? 'white' : 'var(--theme-elevation-500)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (hasUnappliedChanges && !processing) ? 'pointer' : 'not-allowed',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            {processing ? 'Applying...' : 'Apply Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VariantGenerator