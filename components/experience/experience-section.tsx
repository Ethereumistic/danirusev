'use client'

import * as React from "react"
import { ExperienceCard } from "./experience-card"
import type { ExperienceProduct } from "@/types/payload-types"

interface ExperienceSectionProps {
    experiences: ExperienceProduct[]
    linkPrefix?: string
    title?: string
    subtitle?: string
}

/**
 * Experience section - displays a grid of experience cards
 * Uses only CMS data, no hardcoded values
 */
export function ExperienceSection({
    experiences,
    linkPrefix = "/experience",
    title = "Избери Своя Адреналин",
    subtitle = "От пасажерска яхия до пълен контрол - имаме нещо за всеки"
}: ExperienceSectionProps) {
    return (
        <section id="drift-experiences" className="py-8 px-4 scroll-mt-20 bg-slate-950">
            <div className="max-w-7xl mx-auto">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {experiences.map((experience, idx) => (
                        <ExperienceCard
                            key={experience.id}
                            experience={experience}
                            index={idx}
                            linkPrefix={linkPrefix}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
