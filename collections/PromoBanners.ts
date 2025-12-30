import type { CollectionConfig } from 'payload';

export const PromoBanners: CollectionConfig = {
    slug: 'promo-banners',
    admin: {
        useAsTitle: 'badgeText',
        defaultColumns: ['badgeText', 'isActive', 'startDate', 'expiryDate', 'updatedAt'],
        description: 'Promotional banners with customizable content and scheduling',
    },
    fields: [
        // Badge Section
        {
            name: 'badgeIcon',
            type: 'text',
            required: true,
            admin: {
                description: 'Lucide icon name (e.g., "Gift", "Flame", "Clock")',
            },
        },
        {
            name: 'badgeText',
            type: 'text',
            required: true,
            admin: {
                description: 'Badge text (e.g., "Ограничена Оферта")',
            },
        },

        // Title Segments (array - orderable)
        {
            name: 'titleSegments',
            type: 'array',
            required: true,
            minRows: 1,
            admin: {
                description: 'Title segments that can be reordered. Each segment can have its own color.',
            },
            fields: [
                {
                    name: 'text',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'color',
                    type: 'select',
                    required: true,
                    defaultValue: 'white',
                    options: [
                        { label: 'White', value: 'white' },
                        { label: 'Main (Green)', value: 'main' },
                    ],
                },
            ],
        },

        // Subtitle Segments (array - orderable)
        {
            name: 'subtitleSegments',
            type: 'array',
            required: true,
            minRows: 1,
            admin: {
                description: 'Subtitle segments that can be reordered. Each segment can have strikethrough.',
            },
            fields: [
                {
                    name: 'text',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'strikethrough',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Apply line-through styling to this segment',
                    },
                },
            ],
        },

        // Key Points (array)
        {
            name: 'keyPoints',
            type: 'array',
            admin: {
                description: 'Urgency indicators shown below the subtitle',
            },
            fields: [
                {
                    name: 'icon',
                    type: 'text',
                    required: true,
                    admin: {
                        description: 'Lucide icon name (e.g., "Clock", "Flame")',
                    },
                },
                {
                    name: 'text',
                    type: 'text',
                    required: true,
                },
            ],
        },

        // CTA Button
        {
            name: 'ctaButtonText',
            type: 'text',
            required: true,
            admin: {
                description: 'Call-to-action button text',
            },
        },
        {
            name: 'ctaButtonIcon',
            type: 'text',
            admin: {
                description: 'Lucide icon name for the button (e.g., "Flame")',
            },
        },

        // Note
        {
            name: 'noteText',
            type: 'text',
            admin: {
                description: 'Small note text shown below the CTA button',
            },
        },

        // Scheduling (sidebar)
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                position: 'sidebar',
                description: 'Enable or disable this banner',
            },
        },
        {
            name: 'startDate',
            type: 'date',
            admin: {
                position: 'sidebar',
                description: 'Optional: Banner will not show before this date',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'expiryDate',
            type: 'date',
            admin: {
                position: 'sidebar',
                description: 'Optional: Banner will not show after this date',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],
};
