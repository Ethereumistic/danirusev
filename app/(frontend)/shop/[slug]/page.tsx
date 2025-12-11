import { getProductBySlug } from '@/lib/api/products'
import { notFound } from 'next/navigation'
import ProductClient from './product-client'

interface ProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product) {
        notFound()
    }

    // Only show physical products in shop
    if (product.productType !== 'physical') {
        notFound()
    }

    return <ProductClient product={product} />
}

// Generate static params for known products (optional, for better performance)
export async function generateStaticParams() {
    // Can be implemented to pre-render product pages
    return []
}
