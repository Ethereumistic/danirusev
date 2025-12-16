/**
 * Experience Components - Types for CMS-only components
 * These types are used by components in /components/experience
 */

import type {
    ExperienceProduct,
    AdditionalItem,
    ExperienceLocation,
    ProgramItem,
    HybridImage,
    Media
} from '@/types/payload-types'

// Re-export for convenience
export type { ExperienceProduct, AdditionalItem, ExperienceLocation, ProgramItem }

// Theme colors supported by experience components
export type ThemeColor = 'taxi' | 'rent' | 'mix' | 'main'

// Pattern types
export type PatternType = 'taxi-checker' | 'tyre-pattern' | 'none'

// Icon names from Lucide
export type IconName = 'CarTaxiFront' | 'Car' | 'Gauge'

/**
 * Props for experience card component
 */
export interface ExperienceCardProps {
    experience: ExperienceProduct
    index?: number
    linkPrefix?: string
}

/**
 * Props for experience section component
 */
export interface ExperienceSectionProps {
    experiences: ExperienceProduct[]
    linkPrefix?: string
    title?: string
    subtitle?: string
}

/**
 * Props for experience gallery component
 */
export interface ExperienceGalleryProps {
    images: HybridImage[]
    title: string
    subtitle?: string
    themeColor?: ThemeColor
}

/**
 * Props for experience stats grid component
 */
export interface ExperienceStatsGridProps {
    experience: ExperienceProduct
}

/**
 * Props for experience program component
 */
export interface ExperienceProgramProps {
    program: ProgramItem[]
    locations?: ExperienceLocation[]
    themeColor?: ThemeColor
}

/**
 * Props for experience included component
 */
export interface ExperienceIncludedProps {
    included: Array<{ item: string; id?: string }>
    notIncluded: Array<{ item: string; id?: string }>
    themeColor?: ThemeColor
}

/**
 * Props for experience additional items component
 */
export interface ExperienceAdditionalItemsProps {
    items: AdditionalItem[]
    themeColor?: ThemeColor
    experienceId: string
}

/**
 * Props for experience booking sidebar component
 */
export interface ExperienceBookingSidebarProps {
    experience: ExperienceProduct
}

/**
 * Helper to extract image URL from HybridImage
 */
export function getImageUrl(image: HybridImage): string {
    if (image.type === 'upload' && image.media) {
        const media = image.media as Media
        return media.url || ''
    } else if (image.type === 'url' && image.url) {
        return image.url
    }
    return ''
}

/**
 * Get theme color class utilities
 */
export function getThemeClasses(themeColor: ThemeColor = 'main') {
    return {
        text: themeColor === 'taxi' ? 'text-taxi' :
            themeColor === 'rent' ? 'text-rent' :
                themeColor === 'mix' ? 'text-mix' : 'text-main',
        bg: themeColor === 'taxi' ? 'bg-taxi' :
            themeColor === 'rent' ? 'bg-rent' :
                themeColor === 'mix' ? 'bg-mix' : 'bg-main',
        bgFaded: themeColor === 'taxi' ? 'bg-taxi/10' :
            themeColor === 'rent' ? 'bg-rent/10' :
                themeColor === 'mix' ? 'bg-mix/10' : 'bg-main/10',
        border: themeColor === 'taxi' ? 'border-taxi' :
            themeColor === 'rent' ? 'border-rent' :
                themeColor === 'mix' ? 'border-mix' : 'border-main',
        borderFaded: themeColor === 'taxi' ? 'border-taxi/30' :
            themeColor === 'rent' ? 'border-rent/30' :
                themeColor === 'mix' ? 'border-mix/30' : 'border-main/30',
        shadow: themeColor === 'taxi' ? 'shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]' :
            themeColor === 'rent' ? 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]' :
                themeColor === 'mix' ? 'shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]' :
                    'shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
        hover: themeColor === 'taxi' ? 'hover:bg-taxi/90' :
            themeColor === 'rent' ? 'hover:bg-rent/90' :
                themeColor === 'mix' ? 'hover:bg-mix/90' : 'hover:bg-main/90',
    }
}
