import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
    slug: 'testimonials',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'experience', 'rating', 'location'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'experience',
            type: 'text',
            admin: {
                description: 'e.g., "Дрифт Такси", "Дрифт Микс"',
            },
        },
        {
            name: 'rating',
            type: 'number',
            required: true,
            min: 1,
            max: 5,
            defaultValue: 5,
            admin: {
                step: 1,
            },
        },
        {
            name: 'quote',
            type: 'textarea',
            required: true,
        },
        {
            name: 'location',
            type: 'text',
            admin: {
                description: 'e.g., "София", "Бухово"',
            },
        },
        {
            name: 'avatar',
            type: 'group',
            label: 'Avatar Image',
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
            ],
        },
    ],
}
