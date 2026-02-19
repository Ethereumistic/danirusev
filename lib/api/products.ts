import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { unstable_cache } from 'next/cache'

const EXPERIENCES_CACHE_TAG = 'experiences'
const PRODUCTS_CACHE_TAG = 'products'

const getProductsInternal = async (productType?: 'physical' | 'experience') => {
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
        depth: 2,
    })

    return result.docs
}

const getProductBySlugInternal = async (slug: string) => {
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

export const getProducts = (productType?: 'physical' | 'experience') => {
    return unstable_cache(
        () => getProductsInternal(productType),
        [productType ? `products-${productType}` : 'products-all'],
        {
            tags: [PRODUCTS_CACHE_TAG, productType ? `products-${productType}` : 'products-all'],
            revalidate: 300,
        }
    )()
}

export const getProductBySlug = (slug: string) => {
    return unstable_cache(
        () => getProductBySlugInternal(slug),
        [`product-${slug}`],
        {
            tags: [PRODUCTS_CACHE_TAG, `product-${slug}`],
            revalidate: 300,
        }
    )()
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
