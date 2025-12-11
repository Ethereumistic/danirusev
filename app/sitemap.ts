import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/get-payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.vercel.app'
  const payload = await getPayloadClient()

  // Get all products
  const { docs: products } = await payload.find({
    collection: 'products' as any,
    limit: 1000,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Get all categories
  const { docs: categories } = await payload.find({
    collection: 'categories' as any,
    limit: 100,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/xp`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Product pages
  const productPages = (products as any[]).map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Experience individual pages
  const experienceProducts = (products as any[]).filter((product: any) => product.productType === 'experience')
  const experiencePages = experienceProducts.map((experience: any) => ({
    url: `${baseUrl}/xp/${experience.slug}`,
    lastModified: new Date(experience.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Category pages (if you have category pages)
  const categoryPages = (categories as any[]).map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...experiencePages, ...categoryPages]
}