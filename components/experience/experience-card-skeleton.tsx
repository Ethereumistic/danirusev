'use client'

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton component that mimics the ExperienceCard layout
 * Used as a loading placeholder while experiences are being fetched
 */
export function ExperienceCardSkeleton() {
    return (
        <div className="relative h-[550px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
            {/* Price Badge Skeleton */}
            <div className="absolute top-4 right-4 z-30">
                <Skeleton className="h-10 w-24 bg-slate-800" />
            </div>

            {/* Image Background Skeleton */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Skeleton className="w-full h-full bg-slate-800" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/90 to-transparent opacity-90 z-10" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                {/* Icon Skeleton */}
                <div className="mb-4">
                    <Skeleton className="w-14 h-14 rounded-xl bg-slate-800" />
                </div>

                {/* Title Section */}
                <div className="space-y-2 mb-4">
                    {/* Subtitle */}
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                    {/* Title */}
                    <Skeleton className="h-9 w-3/4 bg-slate-800" />
                    {/* Description */}
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full bg-slate-800" />
                        <Skeleton className="h-4 w-2/3 bg-slate-800" />
                    </div>
                </div>

                {/* Quick Specs Skeleton */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="w-4 h-4 rounded bg-slate-800" />
                        <Skeleton className="h-4 w-16 bg-slate-800" />
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="w-4 h-4 rounded bg-slate-800" />
                        <Skeleton className="h-4 w-16 bg-slate-800" />
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="w-4 h-4 rounded bg-slate-800" />
                        <Skeleton className="h-4 w-16 bg-slate-800" />
                    </div>
                </div>

                {/* CTA Button Skeleton */}
                <Skeleton className="w-full h-14 rounded-xl bg-slate-800" />
            </div>
        </div>
    )
}

/**
 * Skeleton for the entire experience section
 * Shows the section header and 3 card skeletons in a grid
 */
export function ExperienceSectionSkeleton() {
    return (
        <section id="drift-experiences" className="py-24 px-4 scroll-mt-6 bg-slate-950">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
                        Избери Своя <span className="text-main">Адреналин</span>
                    </h2>
                    <p className="text-xl text-slate-400">
                        От пасажерска яхия до пълен контрол - имаме нещо за всеки
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <ExperienceCardSkeleton />
                    <ExperienceCardSkeleton />
                    <ExperienceCardSkeleton />
                </div>
            </div>
        </section>
    )
}
