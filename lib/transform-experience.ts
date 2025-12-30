/**
 * Transform Payload CMS ExperienceProduct to DriftExperience format
 * This allows reusing existing drift components with CMS data
 */

import type { ExperienceProduct, HybridImage, Media, AdditionalItem as CMSAdditionalItem } from '@/types/payload-types'
import type { DriftExperience, AdditionalItem, ThemeColor, PatternType } from '@/lib/drift-data'

/**
 * Extract image URL from HybridImage
 */
function getImageUrl(image: HybridImage): string {
    if (image.type === 'upload' && image.media) {
        // Handle uploaded media
        const media = image.media as Media
        return media.url || ''
    } else if (image.type === 'url' && image.url) {
        return image.url
    }
    return ''
}

/**
 * Transform CMS additional item to DriftExperience format
 */
function transformAdditionalItem(item: CMSAdditionalItem): AdditionalItem {
    return {
        id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        icon: item.icon,
        price: item.price,
        description: item.description,
        isLocation: item.type === 'location',
        isVoucher: item.type === 'voucher',
    }
}

/**
 * Transform a Payload CMS ExperienceProduct into DriftExperience format
 * for use with existing drift components
 */
export function transformExperienceToDrift(product: ExperienceProduct): DriftExperience {
    // Extract image URLs from gallery
    const images: string[] = product.gallery
        ?.map(getImageUrl)
        .filter((url): url is string => !!url) || []

    // Ensure we have at least a placeholder image
    if (images.length === 0) {
        images.push('/placeholder-drift.jpg')
    }

    // Transform program items
    const program = product.program?.map(item => ({
        time: item.time,
        activity: item.activity,
        description: item.description,
    })) || []

    // Transform included items (extract string from object)
    const included = product.included?.map(item => item.item) || []

    // Transform not included items
    const notIncluded = product.notIncluded?.map(item => item.item) || []

    // Transform additional items
    const additionalItems = product.additionalItems?.map(transformAdditionalItem) || []

    // Get visuals with defaults
    const iconName = product.visuals?.iconName || 'Car'
    const themeColor: ThemeColor = product.visuals?.themeColor || 'main'
    const pattern: PatternType = product.visuals?.pattern || 'none'

    return {
        id: String(product.id),
        slug: product.slug,
        title: product.title,
        subtitle: product.subtitle || '',
        price: product.price,
        currency: 'BGN', // Default currency
        duration: product.duration || '60 мин',
        carModel: product.techSpecs?.carModel || 'BMW E46',
        horsePower: product.techSpecs?.horsePower || 400,
        tires: product.techSpecs?.tiresBurned || "4 бр.",
        description: product.description || '',
        images,
        program,
        included,
        notIncluded,
        additionalItems,
        iconName,
        pattern,
        themeColor,
    }
}

/**
 * Transform multiple experience products
 */
export function transformExperiencesToDrift(products: ExperienceProduct[]): DriftExperience[] {
    return products.map(transformExperienceToDrift)
}
