import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Supabase storage configuration will be handled by the storage adapter
    // in payload.config.ts
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*'],
  },
}
