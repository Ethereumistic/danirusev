import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

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
      required: true,
      min: 0,
      admin: {
        description: 'Base price of the product',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for sale comparison',
      },
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Fallback stock for simple products without variants',
      },
    },
    {
      name: 'lowStockThreshold',
      type: 'number',
      min: 0,
      defaultValue: 5,
      admin: {
        description: 'Threshold to trigger "Only X left!" badges',
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
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional product description (supports both physical and experience products)',
      },
    },
    // ========================================
    // HYBRID IMAGE FIELD
    // ========================================
    {
      name: 'gallery',
      type: 'array',
      label: 'Product Gallery',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Upload', value: 'upload' },
            { label: 'URL', value: 'url' },
          ],
          defaultValue: 'upload',
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'upload',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'url',
          },
        },
      ],
    },
    // ========================================
    // PHYSICAL GOODS LOGIC
    // ========================================
    {
      type: 'collapsible',
      label: 'Physical Product Options',
      admin: {
        condition: (data) => data?.productType === 'physical',
      },
      fields: [
        {
          name: 'optionDefinitions',
          type: 'array',
          label: 'Product Options',
          admin: {
            description: 'Define option types (Size, Color, Scent, etc.)',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., "Size", "Color", "Scent"',
              },
            },
            {
              name: 'values',
              type: 'array',
              required: true,
              admin: {
                description: 'e.g., ["S", "M", "L"] or ["Vanilla", "New Car"]',
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        // Color-specific galleries for multi-option products
        {
          name: 'colorGalleries',
          type: 'array',
          label: 'Color Galleries (Optional - For Products with Size + Color)',
          admin: {
            description: 'Upload images once per color. Eliminates duplication for products with multiple sizes. Leave empty for single-option products (mugs use variant galleries instead).',
          },
          fields: [
            {
              name: 'colorName',
              type: 'text',
              required: true,
              admin: {
                description: 'Must match exactly with Color option value (e.g., "Green", "Light Blue")',
              },
            },
            {
              name: 'images',
              type: 'array',
              required: true,
              admin: {
                description: 'All images for this color (shared across all sizes)',
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Upload', value: 'upload' },
                    { label: 'URL', value: 'url' },
                  ],
                  defaultValue: 'url',
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
        {
          name: 'variants',
          type: 'array',
          label: 'Variants / Inventory',
          admin: {
            description: 'Source of truth for stock. Each variant combination with its own stock.',
          },
          fields: [
            {
              name: 'combination',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Auto-generated: e.g., "Size:S|Color:Red"',
              },
            },
            {
              name: 'options',
              type: 'json',
              required: true,
              admin: {
                description: 'Key-value pairs of option selections: {"Size": "S", "Color": "Red"}',
              },
            },
            {
              name: 'stock',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 0,
              admin: {
                description: 'CRITICAL: Stock for this variant. 0 disables Add to Cart.',
              },
            },
            {
              name: 'priceModifier',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Price adjustment: +$5 for XL, -$2 for small',
              },
            },
            {
              name: 'sku',
              type: 'text',
              admin: {
                description: 'Stock Keeping Unit for this variant',
              },
            },
            {
              name: 'variantGallery',
              type: 'array',
              label: 'Variant Images',
              admin: {
                description: 'Images specific to this variant (e.g., green mug photos). Add multiple images!',
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Upload', value: 'upload' },
                    { label: 'URL', value: 'url' },
                  ],
                  defaultValue: 'url',
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
                    description: 'CDN URL for this variant image',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // ========================================
    // EXPERIENCE LOGIC (matching drift-data.ts)
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
          name: 'location',
          type: 'text',
          admin: {
            description: 'e.g., "Трявна", "София"',
          },
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
              type: 'number',
              admin: {
                description: 'Approximate tires burned per session',
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
              type: 'select',
              options: [
                { label: 'Car Taxi Front', value: 'CarTaxiFront' },
                { label: 'Car', value: 'Car' },
                { label: 'Gauge', value: 'Gauge' },
              ],
              admin: {
                description: 'Lucide icon name to display',
              },
            },
            {
              name: 'themeColor',
              type: 'select',
              options: [
                { label: 'Taxi', value: 'taxi' },
                { label: 'Rent', value: 'rent' },
                { label: 'Mix', value: 'mix' },
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
              required: true,
              min: 0,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'icon',
              type: 'text',
              required: true,
              admin: {
                description: 'Lucide icon name (e.g., "Video", "Disc", "MapPin")',
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
              ],
              defaultValue: 'standard',
              admin: {
                description: 'Replaces isLocation/isVoucher boolean flags',
              },
            },
          ],
        },
      ],
    },
  ],
}