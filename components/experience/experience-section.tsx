'use client'

import * as React from "react"
import { ExperienceCard } from "./experience-card"
import type { ExperienceProduct } from "@/types/payload-types"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface ExperienceSectionProps {
    experiences: ExperienceProduct[]
    linkPrefix?: string
    title?: string
    subtitle?: string
}

/**
 * Experience section - displays a carousel of experience cards
 * Uses only CMS data, no hardcoded values
 */
export function ExperienceSection({
    experiences,
    linkPrefix = "/experience",
    title = "Избери Своя Адреналин",
    subtitle = "От возене през специални събития до пълен контрол - имаме нещо за всеки"
}: ExperienceSectionProps) {
    const reversedExperiences = [...experiences].reverse()

    return (
        <section id="drift-experiences" className="py-24 px-4 scroll-mt-20 bg-slate-950 relative overflow-hidden">
            {/* Background Gradient similar to testimonials */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-main/5 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
                        {title.split(' ').map((word, idx) =>
                            word === 'Адреналин' || word === 'Aдреналин' ? (
                                <span key={idx} className="text-main">{word}</span>
                            ) : (
                                <React.Fragment key={idx}>{word} </React.Fragment>
                            )
                        )}
                    </h2>
                    <p className="text-xl text-slate-400">
                        {subtitle}
                    </p>
                </div>

                {/* Mobile View: Vertical Stack */}
                <div className="grid grid-cols-1 gap-8 lg:hidden">
                    {reversedExperiences.map((experience, idx) => (
                        <ExperienceCard
                            key={experience.id}
                            experience={experience}
                            index={idx}
                            linkPrefix={linkPrefix}
                        />
                    ))}
                </div>

                {/* Desktop View: Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="hidden lg:block w-full"
                >
                    <CarouselContent className="-ml-4 lg:-ml-3 p-2">
                        {reversedExperiences.map((experience, idx) => (
                            <CarouselItem key={experience.id} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-[31%]">
                                <ExperienceCard
                                    experience={experience}
                                    index={idx}
                                    linkPrefix={linkPrefix}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                        <CarouselNext className="-right-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                    </div>
                </Carousel>
            </div>
        </section>
    )
}
