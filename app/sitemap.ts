import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/get-payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.com'
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

  // 1. Static Public Pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ]

  // 2. Experience individual pages - HIGH PRIORITY
  const experienceProducts = (products as any[]).filter((product: any) => product.productType === 'experience')
  const experiencePages = experienceProducts.map((experience: any) => ({
    url: `${baseUrl}/experience/${experience.slug}`,
    lastModified: new Date(experience.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Note: /vouchers, /shop, and /account are excluded as they require authentication or are in development

  return [...staticPages, ...experiencePages]
}