import * as React from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Quote, Gauge, Car, CarTaxiFront } from "lucide-react"
import * as LucideIcons from "lucide-react"

// Data fetching
import { getProductBySlug } from "@/lib/api/products"
import type { ExperienceProduct } from "@/types/payload-types"
import { Metadata } from "next"
import { ExperienceSchema, BreadcrumbSchema } from "@/components/seo/structured-data"
import { defaultMetadata } from "@/lib/seo"

// Components
import {
    ExperienceGallery,
    ExperienceStatsGrid,
    ExperienceBookingSidebar,
    ExperienceSectionWrapper,
    ExperienceSectionSkeleton,
    getThemeClasses,
    type ThemeColor
} from "@/components/experience"
import { BackButton } from "@/components/experience/back-button"

// Import the new component
import { ExperienceScrollableTabs } from "@/components/experience/experience-scrollable-tabs"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product || product.productType !== 'experience') {
        return defaultMetadata
    }

    const experience = product as ExperienceProduct
    const title = `${experience.title} | Dani Rusev 11`
    const description = experience.description || experience.subtitle || defaultMetadata.description

    return {
        ...defaultMetadata,
        title,
        description,
        openGraph: {
            ...defaultMetadata.openGraph,
            title,
            description,
        },
        alternates: {
            canonical: `/experience/${slug}`,
        },
    }
}

// Helper function to get the correct icon component
function getIconComponent(iconName?: string, themeColor?: ThemeColor) {
    const theme = getThemeClasses(themeColor || 'main')

    const Icon = iconName ? (LucideIcons as any)[iconName] : null
    const FinalIcon = Icon || Car

    return <FinalIcon className={`w-12 h-12 ${theme.text}`} />
}

export default async function ExperienceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Fetch from Payload CMS
    const product = await getProductBySlug(slug)

    // Validate it's an experience product
    if (!product || product.productType !== 'experience') {
        notFound()
    }

    const experience = product as ExperienceProduct
    const themeColor = (experience.visuals?.themeColor || 'main') as ThemeColor
    const theme = getThemeClasses(themeColor)

    return (
        <div className="min-h-screen bg-slate-950 pb-12 pt-4 md:pt-8">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 mb-6">
                <BackButton />
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Header with Title and Icon */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 bg-slate-900 rounded-2xl border-2 ${theme.border}`}>
                        {getIconComponent(experience.visuals?.iconName, themeColor)}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tight text-white">
                            {experience.title}
                        </h1>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* LEFT COLUMN - GALLERY */}
                    <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-17.5 lg:self-start">
                        <ExperienceGallery
                            images={experience.gallery || []}
                            title={experience.title}
                            subtitle={experience.subtitle}
                            themeColor={themeColor}
                        />
                        <ExperienceStatsGrid experience={experience} />
                    </div>

                    {/* RIGHT COLUMN - ALL CONTENT */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Description - Styled as a Quote */}
                        {experience.description && (
                            <div className={`relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border-2 ${theme.borderFaded} overflow-hidden group`}>
                                <Quote className={`absolute -top-4 -right-4 w-32 h-32 opacity-5 ${theme.text}`} />
                                <div className="relative z-10">
                                    <p className="text-xl md:text-2xl font-medium text-white leading-relaxed italic">
                                        "{experience.description}"
                                    </p>
                                    <div className={`mt-4 h-1 w-20 rounded-full ${theme.bg}`} />
                                </div>
                            </div>
                        )}

                        {/* NEW SCROLLABLE TABS COMPONENT */}
                        {/* This replaces the old <Tabs> system */}
                        <ExperienceScrollableTabs
                            program={experience.program || []}
                            locations={experience.locations}
                            included={experience.included || []}
                            notIncluded={experience.notIncluded || []}
                            additionalItems={experience.additionalItems || []}
                            experienceId={experience.id}
                            themeColor={themeColor}
                            // @ts-ignore - tabNames is a new field
                            customLabelProgram={experience.tabNames?.program}
                            // @ts-ignore
                            customLabelIncluded={experience.tabNames?.included}
                            // @ts-ignore
                            customLabelAdditional={experience.tabNames?.additional}
                        />

                        {/* Booking Sidebar */}
                        <ExperienceBookingSidebar experience={experience} />
                    </div>
                </div>
            </div>

            {/* Other Experiences Section */}
            <React.Suspense fallback={<ExperienceSectionSkeleton />}>
                <ExperienceSectionWrapper
                    excludeSlug={slug}
                    title="Още Преживявания"
                    subtitle="Разгледайте и другите ни предложения"
                />
            </React.Suspense>

            {/* SEO Structured Data */}
            <ExperienceSchema experience={experience} url={`${process.env.NEXT_PUBLIC_SERVER_URL}/experience/${slug}`} />
            <BreadcrumbSchema
                items={[
                    { name: 'Начало', url: '/' },
                    { name: experience.title, url: `/experience/${slug}` }
                ]}
            />
        </div>
    )
}