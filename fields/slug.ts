import type { Field } from 'payload'
import { formatSlug } from '../lib/utils/format-slug'

export const slugField = (fieldToUse = 'title'): Field => ({
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
        position: 'sidebar',
    },
    hooks: {
        beforeValidate: [formatSlug(fieldToUse)],
    },
})
