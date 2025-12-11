/**
 * Resolves image field from Payload's hybrid image structure
 * Handles both uploaded media and direct URL references
 */

export interface HybridImageField {
    type: 'upload' | 'url'
    media?: {
        url: string
        alt?: string
    }
    url?: string
}

export function resolveImage(imageField: HybridImageField | null | undefined): string | null {
    if (!imageField) return null

    if (imageField.type === 'url' && imageField.url) {
        return imageField.url
    }

    if (imageField.type === 'upload' && imageField.media?.url) {
        return imageField.media.url
    }

    return null
}

/**
 * Resolves alt text for an image
 */
export function resolveImageAlt(imageField: HybridImageField | null | undefined): string {
    if (!imageField) return ''

    if (imageField.type === 'upload' && imageField.media?.alt) {
        return imageField.media.alt
    }

    return ''
}
