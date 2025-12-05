import { Product } from '@/types/payload-types'
import { getMediaUrl } from '@/lib/utils'
import { notFound } from 'next/navigation'
import ProductDetailContent from './product-detail-content'
import { Metadata, ResolvingMetadata } from 'next'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/structured-data'

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products?where[slug][equals]=${slug}&depth=2`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    
    if (!res.ok) {
      console.error('Failed to fetch product:', await res.text())
      return null
    }
    
    const data = await res.json()
    if (!data.docs || data.docs.length === 0) {
      return null
    }
    
    return data.docs[0]
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getRelatedProducts(categoryId: string, productId: string): Promise<Product[]> {
  try {
    // Fetch products from the same category, excluding the current product
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products?where[category][equals]=${categoryId}&where[id][not_equals]=${productId}&limit=4&depth=1`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    
    if (!res.ok) {
      console.error('Failed to fetch related products:', await res.text())
      return []
    }
    
    const data = await res.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export async function generateMetadata(
  { params }: Args,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Продуктът не е намерен',
      description: 'Търсеният продукт не може да бъде намерен.',
    }
  }

  // Get the parent metadata to merge with
  const previousImages = (await parent).openGraph?.images || []
  
  // Get product image URL
  const productImage = product.images?.[0]?.image
  const imageUrl = productImage ? getMediaUrl(productImage.url) : null
  
  // Build comprehensive keywords
  const categoryName = typeof product.category === 'object' ? product.category.title : ''
  const keywords = [
    product.title,
    categoryName,
    'екстремни преживявания',
    'подарък',
    'ваучер',
    product.brand || '',
    ...(product.tags || []).map(tag => tag.tag)
  ].filter(Boolean).join(', ')

  return {
    title: `${product.title} | ${categoryName}`,
    description: product.description || `Купете ${product.title} - ${categoryName}. Уникално преживяване с адреналин. Перфектен подарък за всеки повод.`,
    keywords,
    openGraph: {
      title: product.title,
      description: product.description || `${product.title} - Екстремно преживяване`,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/products/${slug}`,
      siteName: 'Dani Rusev 11',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: productImage.alt || product.title,
        }
      ] : previousImages,
      type: 'website',
      locale: 'bg_BG',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SERVER_URL}/products/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function ProductPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const product = await getProduct(slug)
  
  if (!product) {
    notFound()
  }
  
  // Fetch related products from the same category
  const relatedProducts = await getRelatedProducts(
    typeof product.category === 'object' ? product.category.id : product.category,
    product.id
  )
  
  // Process product images
  const productImages = product.images?.map((img) => {
    return {
      url: getMediaUrl(img.image.url),
      alt: img.image.alt
    }
  }) || []
  
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.vercel.app'
  const categoryName = typeof product.category === 'object' ? product.category.title : ''
  
  return (
    <>
      <ProductSchema product={product} url={`${baseUrl}/products/${slug}`} />
      <BreadcrumbSchema 
        items={[
          { name: 'Начало', url: baseUrl },
          { name: 'Продукти', url: `${baseUrl}/products` },
          { name: categoryName, url: `${baseUrl}/categories/${typeof product.category === 'object' ? product.category.slug : ''}` },
          { name: product.title, url: `${baseUrl}/products/${slug}` }
        ]} 
      />
      <ProductDetailContent product={product} relatedProducts={relatedProducts} productImages={productImages} />
    </>
  )
} 