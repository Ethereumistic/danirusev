/**
 * TypeScript interfaces matching Payload CMS generated types
 * Simplified Shopify-like structure for products
 */

// Base Media type
export interface Media {
  id: string
  url: string
  alt?: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
}

// Category type
export interface Category {
  id: string
  title: string
  slug: string
  parent?: string | Category
  createdAt: string
  updatedAt: string
}

/**
 * Hybrid image field - supports both upload and CDN URL
 */
export interface HybridImage {
  type: 'upload' | 'url'
  media?: string | Media
  url?: string
  alt?: string
  id?: string
}

/**
 * Option value with optional dual colors and multiple images
 */
export interface OptionValue {
  value: string
  primaryColorHex?: string
  secondaryColorHex?: string
  images?: HybridImage[]
  id?: string
}

/**
 * Option definition (e.g., Size, Color)
 */
export interface OptionDefinition {
  name: string
  values: OptionValue[]
  id?: string
}

/**
 * Product variant - a purchasable combination
 */
export interface ProductVariant {
  options: Record<string, string>
  sku?: string
  stock: number
  priceModifier?: number
  images?: HybridImage[]
  id?: string
}

// Additional item for experiences
export interface AdditionalItem {
  name: string
  price?: number        // Optional - leave empty for free items
  description?: string  // Optional
  icon?: string         // Optional Lucide icon name
  type: 'standard' | 'location' | 'voucher'
  googleMapsUrl?: string // For location type items
  id?: string
}

// Location city for experience cards
export interface ExperienceLocation {
  city: string
  id?: string
}

// Program item for experiences
export interface ProgramItem {
  time: string
  activity: string
  description: string
  id?: string
}

// Tech specs for experiences
export interface TechSpecs {
  carModel?: string
  horsePower?: number
  tiresBurned?: number
}

// Visuals for experiences
export interface Visuals {
  iconName?: 'CarTaxiFront' | 'Car' | 'Gauge'
  themeColor?: 'taxi' | 'rent' | 'mix' | 'main'
  pattern?: 'taxi-checker' | 'tyre-pattern' | 'none'
}

/**
 * Base Product type
 */
export interface Product {
  id: string
  title: string
  slug: string
  productType: 'physical' | 'experience'
  price: number
  compareAtPrice?: number
  description?: string
  categories?: Array<string | Category>
  gallery?: HybridImage[]
  createdAt: string
  updatedAt: string
}

/**
 * Physical Product type (extends Product)
 */
export interface PhysicalProduct extends Product {
  productType: 'physical'
  stock?: number
  lowStockThreshold?: number
  optionDefinitions?: OptionDefinition[]
  variants?: ProductVariant[]
}

/**
 * Experience Product type (extends Product)
 */
export interface ExperienceProduct extends Product {
  productType: 'experience'
  subtitle?: string
  duration?: string
  locations?: ExperienceLocation[]  // Array of city names
  techSpecs?: TechSpecs
  visuals?: Visuals
  program?: ProgramItem[]
  included?: Array<{ item: string; id?: string }>
  notIncluded?: Array<{ item: string; id?: string }>
  additionalItems?: AdditionalItem[]
}

// Union type for any product
export type AnyProduct = PhysicalProduct | ExperienceProduct

// PromoBanner types
export interface TitleSegment {
  text: string
  color: 'white' | 'main'
  id?: string
}

export interface SubtitleSegment {
  text: string
  strikethrough: boolean
  id?: string
}

export interface KeyPoint {
  icon: string
  text: string
  id?: string
}

export interface PromoBanner {
  id: string
  badgeIcon: string
  badgeText: string
  titleSegments: TitleSegment[]
  subtitleSegments: SubtitleSegment[]
  keyPoints?: KeyPoint[]
  ctaButtonText: string
  ctaButtonIcon?: string
  noteText?: string
  startDate?: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Type guards
export function isPhysicalProduct(product: Product): product is PhysicalProduct {
  return product.productType === 'physical'
}

export function isExperienceProduct(product: Product): product is ExperienceProduct {
  return product.productType === 'experience'
}