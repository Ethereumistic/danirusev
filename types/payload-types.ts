/**
 * TypeScript interfaces matching Payload CMS generated types
 * These types align with the Products collection schema
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

// Hybrid image field
export interface HybridImage {
  type: 'upload' | 'url'
  media?: string | Media
  url?: string
  id?: string
}

// Product variant for physical goods
export interface ProductVariant {
  combination?: string
  options: Record<string, string>
  stock: number
  priceModifier?: number
  sku?: string
  variantImage?: string | Media
  id?: string
}

// Option definition for physical goods
export interface OptionDefinition {
  name: string
  values: Array<{ value: string; id?: string }>
  id?: string
}

// Additional item for experiences
export interface AdditionalItem {
  name: string
  price: number
  description: string
  icon: string
  type: 'standard' | 'location' | 'voucher'
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

// Base Product type
export interface Product {
  id: string
  title: string
  slug: string
  productType: 'physical' | 'experience'
  price: number
  compareAtPrice?: number
  stock?: number
  lowStockThreshold?: number
  categories?: Array<string | Category>
  gallery?: HybridImage[]
  createdAt: string
  updatedAt: string
}

// Physical Product type (extends Product)
export interface PhysicalProduct extends Product {
  productType: 'physical'
  optionDefinitions?: OptionDefinition[]
  variants?: ProductVariant[]
}

// Experience Product type (extends Product)
export interface ExperienceProduct extends Product {
  productType: 'experience'
  subtitle?: string
  duration?: string
  location?: string
  techSpecs?: TechSpecs
  visuals?: Visuals
  description?: string
  program?: ProgramItem[]
  included?: Array<{ item: string; id?: string }>
  notIncluded?: Array<{ item: string; id?: string }>
  additionalItems?: AdditionalItem[]
}

// Union type for any product
export type AnyProduct = PhysicalProduct | ExperienceProduct

// Type guards
export function isPhysicalProduct(product: Product): product is PhysicalProduct {
  return product.productType === 'physical'
}

export function isExperienceProduct(product: Product): product is ExperienceProduct {
  return product.productType === 'experience'
}