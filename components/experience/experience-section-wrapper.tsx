import { getProducts } from '@/lib/api/products'
import { ExperienceSection } from './experience-section'
import type { ExperienceProduct } from '@/types/payload-types'

interface ExperienceSectionWrapperProps {
    linkPrefix?: string
    title?: string
    subtitle?: string
}

/**
 * Async wrapper component that fetches experience data
 * This component is designed to be wrapped in Suspense for streaming
 */
export async function ExperienceSectionWrapper({
    linkPrefix = "/experience",
    title,
    subtitle
}: ExperienceSectionWrapperProps) {
    const products = await getProducts('experience')
    const experiences = products as ExperienceProduct[]

    return (
        <ExperienceSection
            experiences={experiences}
            linkPrefix={linkPrefix}
            title={title}
            subtitle={subtitle}
        />
    )
}
