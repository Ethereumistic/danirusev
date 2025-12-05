import { Product } from '@/types/payload-types'
import { getMediaUrl } from '@/lib/utils'

interface ProductSchemaProps {
  product: Product
  url: string
}

export function ProductSchema({ product, url }: ProductSchemaProps) {
  const categoryName = typeof product.category === 'object' ? product.category.title : ''
  const productImage = product.images?.[0]?.image
  const imageUrl = productImage ? getMediaUrl(productImage.url) : null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: imageUrl ? [imageUrl] : [],
    category: categoryName,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Dani Rusev 11',
    },
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'BGN',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.inventory > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Dani Rusev 11',
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    } : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationSchema() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dani Rusev 11',
    alternateName: 'Dani Rusev Extreme Experiences',
    url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_SERVER_URL}/og-image.jpg`,
    description: 'Екстремни автомобилни преживявания - дрифт, рали и каране на писта в България',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BG',
      addressLocality: 'София',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['bg', 'en'],
    },
    sameAs: [
      // Add social media links here
      // 'https://www.facebook.com/danirusev11',
      // 'https://www.instagram.com/danirusev11',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ExperienceSchemaProps {
  experience: {
    title: string
    description: string
    price: string
    duration: string
    location?: string
  }
}

export function ExperienceSchema({ experience }: ExperienceSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: experience.title,
    description: experience.description,
    category: 'Automotive Experience',
    brand: {
      '@type': 'Brand',
      name: 'Dani Rusev 11',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BGN',
      price: experience.price,
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    },
    duration: experience.duration,
    provider: {
      '@type': 'Organization',
      name: 'Dani Rusev 11',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
} 