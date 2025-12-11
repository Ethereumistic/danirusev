import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * Get all products from Payload CMS
 * Optionally filter by product type
 */
export async function getProducts(productType?: 'physical' | 'experience') {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'products',
        where: productType
            ? {
                productType: {
                    equals: productType,
                },
            }
            : undefined,
        limit: 100,
        depth: 2, // Include related media and categories
    })

    return result.docs
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'products',
        where: {
            slug: {
                equals: slug,
            },
        },
        limit: 1,
        depth: 2,
    })

    return result.docs[0] || null
}

/**
 * Get all categories
 */
export async function getCategories() {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'categories',
        limit: 100,
        depth: 1,
    })

    return result.docs
}
