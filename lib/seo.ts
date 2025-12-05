import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.vercel.app'
const siteName = 'Dani Rusev 11'
const defaultDescription = 'Екстремни автомобилни преживявания в България. Дрифт, рали и каране на писта с професионални инструктори.'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    'екстремни преживявания',
    'автомобилни преживявания',
    'дрифт',
    'рали',
    'писта каране',
    'подарък за мъж',
    'ваучер за преживяване',
    'България',
  ],
  authors: [{ name: 'Dani Rusev' }],
  creator: 'Dani Rusev',
  publisher: 'Echoray.io',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: baseUrl,
    title: siteName,
    description: defaultDescription,
    siteName,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: defaultDescription,
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
  verification: {
    // Add these when you have them
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export function generateProductTitle(productName: string, categoryName?: string): string {
  const parts = [productName]
  if (categoryName) parts.push(categoryName)
  return parts.join(' | ')
}

export function generateProductDescription(
  productName: string,
  description?: string,
  price?: number
): string {
  if (description) return description.slice(0, 160)
  
  let desc = `Купете ${productName} - екстремно автомобилно преживяване.`
  if (price) desc += ` Цена: ${price} лв.`
  desc += ' Подарете незабравимо изживяване с адреналин.'
  
  return desc
}

export function generateKeywords(
  primary: string[],
  secondary?: string[]
): string {
  const keywords = [...primary]
  if (secondary) keywords.push(...secondary)
  
  // Remove duplicates and empty strings
  const unique = Array.from(new Set(keywords.filter(Boolean)))
  
  return unique.join(', ')
}

export function generateCanonicalUrl(path: string): string {
  // Remove trailing slash and ensure leading slash
  const cleanPath = path.replace(/\/+$/, '').replace(/^(?!\/)/, '/')
  
  // For home page
  if (cleanPath === '/' || cleanPath === '') {
    return baseUrl
  }
  
  return `${baseUrl}${cleanPath}`
}

// Schema.org type helpers
export function generateProductSchema(product: {
  name: string
  description?: string
  price?: number
  image?: string
  category?: string
  brand?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.brand || siteName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BGN',
      price: product.price,
      availability: product.inStock !== false 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
      },
    }),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Meta tag sanitization
export function sanitizeMetaDescription(text: string, maxLength = 160): string {
  // Remove HTML tags
  const stripped = text.replace(/<[^>]*>/g, '')
  
  // Remove extra whitespace
  const cleaned = stripped.replace(/\s+/g, ' ').trim()
  
  // Truncate if needed
  if (cleaned.length <= maxLength) return cleaned
  
  // Find last complete word within limit
  const truncated = cleaned.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...'
}

// Generate alternate language links
export function generateAlternateLanguages(currentPath: string) {
  return {
    'bg': generateCanonicalUrl(currentPath),
    // Add when you have English version
    // 'en': generateCanonicalUrl(`/en${currentPath}`),
  }
} 