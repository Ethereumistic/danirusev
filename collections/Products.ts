import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { slugField } from '../fields/slug'

/**
 * Helper: Format string for SKU (uppercase, spaces to dashes, remove special chars)
 */
const formatForSku = (str: string): string => {
  return str
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9А-Я-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * beforeChange hook: Auto-generate SKUs for variants
 */
const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (!data || data.productType !== 'physical') return data

  const productSlug = (data.slug as string) || 'product'
  const variants = data.variants as any[] | undefined

  if (variants && variants.length > 0) {
    for (const variant of variants) {
      // Auto-generate SKU if missing
      if (!variant.sku && variant.options) {
        const options =
          typeof variant.options === 'string' ? JSON.parse(variant.options) : variant.options

        const optionParts = Object.values(options)
          .map((v) => formatForSku(String(v)))
          .filter((part) => part.length > 0)
          .join('-')

        const slugPart = formatForSku(productSlug)
        variant.sku = optionParts ? `${slugPart}-${optionParts}` : slugPart
      }
    }
  }

  return data
}

/**
 * Products Collection - Shopify-like Architecture
 *
 * Supports two product types:
 * - Physical: Products with variants (size, color, etc.)
 * - Experience: Drift experiences and events
 *
 * Image Handling:
 * - All image fields support BOTH upload (Supabase S3) OR CDN URL
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'productType', 'price', 'stock'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [beforeChangeHook],
  },
  fields: [
    // ========================================
    // GLOBAL PRODUCT FIELDS (ALL TYPES)
    // ========================================
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'productType',
      type: 'select',
      required: true,
      options: [
        { label: 'Physical Product', value: 'physical' },
        { label: 'Experience', value: 'experience' },
      ],
      defaultValue: 'physical',
      admin: {
        position: 'sidebar',
        description: 'Select the type of product',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: false,
      min: 0,
      admin: {
        description: 'Base price of the product (optional for events)',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for sale comparison (optional)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Product description',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    // ========================================
    // HYBRID IMAGE GALLERY (Upload OR URL)
    // ========================================
    {
      name: 'gallery',
      type: 'array',
      label: 'Product Gallery',
      admin: {
        description: 'Main product images. Choose to upload or paste a CDN URL.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Upload Image', value: 'upload' },
            { label: 'CDN URL', value: 'url' },
          ],
          defaultValue: 'upload',
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'upload',
            description: 'Upload an image to Supabase S3',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'url',
            description: 'Paste a CDN URL (e.g., https://cdn.example.com/image.jpg)',
          },
        },
        {
          name: 'alt',
          type: 'text',
          admin: {
            description: 'Alt text for accessibility (optional)',
          },
        },
      ],
    },
    // ========================================
    // PHYSICAL PRODUCT OPTIONS & VARIANTS
    // ========================================
    {
      type: 'collapsible',
      label: 'Physical Product Options',
      admin: {
        condition: (data) => data?.productType === 'physical',
      },
      fields: [
        // Simple stock for products without variants
        {
          name: 'stock',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description:
              'Stock for simple products. If you have variants, stock is managed per-variant below.',
            condition: (data) => !data?.optionDefinitions || data.optionDefinitions.length === 0,
          },
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          min: 0,
          defaultValue: 5,
          admin: {
            description: 'Show "Only X left!" when stock falls below this number',
          },
        },
        // ----------------------------------------
        // OPTION DEFINITIONS (Size, Color, etc.)
        // ----------------------------------------
        {
          name: 'optionDefinitions',
          type: 'array',
          label: 'Product Options',
          admin: {
            description:
              'Define product options like Size, Color, Material. Each option has a list of values.',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g., Size, Color, Material',
                description: 'Option name (will be shown to customers)',
              },
            },
            {
              name: 'values',
              type: 'array',
              required: true,
              label: 'Option Values',
              admin: {
                description: 'List of values for this option',
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'e.g., Small, Red, Cotton',
                  },
                },
                {
                  name: 'primaryColorHex',
                  type: 'text',
                  admin: {
                    description: 'Primary hex color for swatch (e.g., #FF0000). Main/background color.',
                  },
                },
                {
                  name: 'secondaryColorHex',
                  type: 'text',
                  admin: {
                    description: 'Secondary hex color for split-circle swatch (optional). Leave empty for solid color.',
                  },
                },
                {
                  name: 'emoji',
                  type: 'text',
                  admin: {
                    description: 'Optional emoji to display on top of color swatch (e.g., 🍋 for lemon scent).',
                  },
                },
                // Multiple images per option value
                {
                  name: 'images',
                  type: 'array',
                  label: 'Option Value Images',
                  admin: {
                    description: 'Images for this option value (e.g., Red shirt from multiple angles)',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Upload Image', value: 'upload' },
                        { label: 'CDN URL', value: 'url' },
                      ],
                      defaultValue: 'upload',
                    },
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        condition: (data, siblingData) => siblingData?.type === 'upload',
                      },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData?.type === 'url',
                        description: 'CDN URL for this image',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ----------------------------------------
        // VARIANT GENERATOR (Custom UI Component)
        // ----------------------------------------
        {
          name: 'variantGenerator',
          type: 'ui',
          admin: {
            components: {
              Field: '/components/payload/VariantGenerator',
            },
          },
        },
        // ----------------------------------------
        // VARIANTS (Actual purchasable combinations)
        // ----------------------------------------
        {
          name: 'variants',
          type: 'array',
          label: 'Variants',
          admin: {
            description:
              'Each variant is a purchasable combination (e.g., Size: M + Color: Red). Add stock and price modifier for each.',
          },
          fields: [
            {
              name: 'options',
              type: 'json',
              required: true,
              admin: {
                description: 'Option combination as JSON, e.g., {"Size": "M", "Color": "Red"}',
              },
            },
            {
              name: 'sku',
              type: 'text',
              admin: {
                description: 'Stock Keeping Unit. Auto-generated if left empty.',
              },
            },
            {
              name: 'stock',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 0,
              admin: {
                description: 'Inventory count for this variant. 0 = out of stock.',
              },
            },
            {
              name: 'priceModifier',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Price adjustment from base price (e.g., +5 for XL, -2 for small)',
              },
            },
            // Variant-specific images
            {
              name: 'images',
              type: 'array',
              label: 'Variant Images',
              admin: {
                description: 'Images specific to this variant (optional)',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Upload Image', value: 'upload' },
                    { label: 'CDN URL', value: 'url' },
                  ],
                  defaultValue: 'upload',
                },
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'upload',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'url',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // ========================================
    // EXPERIENCE PRODUCT FIELDS
    // ========================================
    {
      type: 'collapsible',
      label: 'Experience Details',
      admin: {
        condition: (data) => data?.productType === 'experience',
      },
      fields: [
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'e.g., "Пасажерско Изживяване"',
          },
        },
        {
          name: 'duration',
          type: 'text',
          admin: {
            description: 'e.g., "60 мин"',
          },
        },
        {
          name: 'locations',
          type: 'array',
          label: 'Available Locations',
          admin: {
            description: 'City names where this experience is available (e.g., Трявна, София)',
          },
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
              admin: {
                description: 'City name displayed on card',
              },
            },
          ],
        },
        // Tech Specs Group
        {
          type: 'group',
          name: 'techSpecs',
          label: 'Technical Specifications',
          fields: [
            {
              name: 'carModel',
              type: 'text',
              admin: {
                description: 'e.g., "BMW E46 V6"',
              },
            },
            {
              name: 'horsePower',
              type: 'number',
              admin: {
                description: 'e.g., 450',
              },
            },
            {
              name: 'tiresBurned',
              type: 'text',
              admin: {
                description: 'Tires burned (e.g., 4, 8, or ∞)',
              },
            },
          ],
        },
        // Visuals
        {
          type: 'group',
          name: 'visuals',
          label: 'Visual Settings',
          fields: [
            {
              name: 'iconName',
              type: 'text',
              admin: {
                description: 'Lucide icon name to display (e.g. CarTaxiFront, Car, Gauge, Calendar, PartyPopper)',
              },
            },
            {
              name: 'themeColor',
              type: 'select',
              options: [
                { label: 'Taxi', value: 'taxi' },
                { label: 'Rent', value: 'rent' },
                { label: 'Mix', value: 'mix' },
                { label: 'Event', value: 'event' },
                { label: 'Day', value: 'day' },
                { label: 'Main', value: 'main' },
              ],
              defaultValue: 'main',
              admin: {
                description: 'Theme color for this experience',
              },
            },
            {
              name: 'pattern',
              type: 'select',
              options: [
                { label: 'Taxi Checker', value: 'taxi-checker' },
                { label: 'Tyre Pattern', value: 'tyre-pattern' },
                { label: 'Event Pattern', value: 'event' },
                { label: 'Day Pattern', value: 'day' },
                { label: 'Mix Pattern', value: 'mix' },
                { label: 'None', value: 'none' },
              ],
              defaultValue: 'none',
              admin: {
                description: 'Visual pattern identifier',
              },
            },
          ],
        },
        // Program
        {
          name: 'program',
          type: 'array',
          label: 'Experience Program',
          fields: [
            {
              name: 'time',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., "00:00"',
              },
            },
            {
              name: 'icon',
              type: 'text',
              admin: {
                description: 'Optional: Lucide icon name (e.g. Clock, Flag, FlagTriangleRight)',
              },
            },
            {
              name: 'activity',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., "Брифинг"',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
          ],
        },
        // Included / Not Included
        {
          name: 'included',
          type: 'array',
          label: "What's Included",
          fields: [
            {
              name: 'item',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'notIncluded',
          type: 'array',
          label: "What's Not Included",
          fields: [
            {
              name: 'item',
              type: 'text',
              required: true,
            },
          ],
        },
        // Additional Items / Addons
        {
          name: 'additionalItems',
          type: 'array',
          label: 'Additional Items / Add-ons',
          admin: {
            description: 'Purchasable add-ons for this experience',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'price',
              type: 'number',
              min: 0,
              admin: {
                description: 'Optional price (leave empty for free items)',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Optional description',
              },
            },
            {
              name: 'icon',
              type: 'text',
              admin: {
                description: 'Optional Lucide icon name (e.g., "Video", "Disc", "MapPin", "Smartphone", "Gift")',
              },
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              options: [
                { label: 'Standard Add-on', value: 'standard' },
                { label: 'Location (Single Choice)', value: 'location' },
                { label: 'Voucher (Single Choice)', value: 'voucher' },
                { label: 'Duration (Single Choice)', value: 'duration' },
              ],
              defaultValue: 'standard',
            },
            // Google Maps link for location type items
            {
              name: 'googleMapsUrl',
              type: 'text',
              admin: {
                description: 'Google Maps link for this location',
                condition: (data, siblingData) => siblingData?.type === 'location',
              },
            },
          ],
        },
      ],
    },
    // Tab Names Customization
    {
      type: 'group',
      name: 'tabNames',
      label: 'Tab Names Customization',
      admin: {
        description: 'Rename the tabs on the experience page (optional)',
      },
      fields: [
        {
          name: 'program',
          type: 'text',
          admin: {
            description: 'Custom name for "Program" tab (e.g. "Agenda")',
          },
        },
        {
          name: 'included',
          type: 'text',
          admin: {
            description: 'Custom name for "Included" tab (e.g. "Conditions")',
          },
        },
        {
          name: 'additional',
          type: 'text',
          admin: {
            description: 'Custom name for "Additional Items" tab (e.g. "Extras")',
          },
        },
      ],
    },
  ],
}