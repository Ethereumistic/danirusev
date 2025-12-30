import type { CollectionConfig } from 'payload';

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sort', 'updatedAt'],
  },
  fields: [
    {
      name: 'sort',
      type: 'number',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Lucide icon name (e.g., "Users", "Car", "Zap")',
      },
    },
    {
      name: 'sessions',
      type: 'text',
      required: true,
    },
    {
      name: 'techSpecs',
      type: 'group',
      label: 'Technical Specifications',
      fields: [
        {
          name: 'carModel',
          type: 'text',
        },
        {
          name: 'horsePower',
          type: 'number',
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
    {
      name: 'detailedInfo',
      type: 'group',
      fields: [
        {
          name: 'overview',
          type: 'text',
          required: true,
        },
        {
          name: 'whatYouGet',
          type: 'array',
          fields: [
            {
              name: 'item',
              type: 'text',
            },
          ],
        },
        {
          name: 'process',
          type: 'array',
          fields: [
            {
              name: 'step',
              type: 'text',
            },
          ],
        },
        {
          name: 'locations',
          type: 'array',
          fields: [
            {
              name: 'location',
              type: 'text',
            },
          ],
        },
        {
          name: 'requirements',
          type: 'array',
          fields: [
            {
              name: 'requirement',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
};