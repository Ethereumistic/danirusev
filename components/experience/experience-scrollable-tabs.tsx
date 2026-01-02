'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { getThemeClasses, type ThemeColor } from "./types"
import { ExperienceProgram } from "./experience-program"
import { ExperienceIncluded } from "./experience-included"
import { ExperienceAdditionalItems } from "./experience-additional-items"
import type { AdditionalItem, ExperienceProduct } from "@/types/payload-types"

interface ExperienceScrollableTabsProps {
    program: any[]
    locations?: any
    included: Array<{ item: string; id?: string }>
    notIncluded: Array<{ item: string; id?: string }>
    additionalItems: AdditionalItem[]
    experienceId: string
    themeColor?: ThemeColor
    customLabelProgram?: string | null
    customLabelIncluded?: string | null
    customLabelAdditional?: string | null
}

export function ExperienceScrollableTabs({
    program,
    locations,
    included,
    notIncluded,
    additionalItems,
    experienceId,
    themeColor = 'main',
    customLabelProgram,
    customLabelIncluded,
    customLabelAdditional
}: ExperienceScrollableTabsProps) {
    const theme = getThemeClasses(themeColor)
    const [activeTab, setActiveTab] = React.useState('program')

    // Refs for scrolling
    const programRef = React.useRef<HTMLDivElement>(null)
    const includedRef = React.useRef<HTMLDivElement>(null)
    const additionalRef = React.useRef<HTMLDivElement>(null)

    // Handle Scroll Spy
    React.useEffect(() => {
        const handleScroll = () => {
            // Offset to account for sticky header height + some breathing room
            const offset = 250

            const sections = [
                { id: 'program', ref: programRef },
                { id: 'included', ref: includedRef },
                { id: 'additional', ref: additionalRef }
            ]

            // Find the current section
            for (const section of sections) {
                const element = section.ref.current
                if (element) {
                    const rect = element.getBoundingClientRect()
                    // If the top of the section is near the offset area
                    if (rect.top <= offset && rect.bottom >= offset) {
                        setActiveTab(section.id)
                    }
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Smooth Scroll Handler
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            // Use scrollIntoView with block: 'start' which respects scroll-margin-top
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveTab(sectionId)
        }
    }

    const tabs = [
        { id: 'program', label: customLabelProgram || 'Програма' },
        { id: 'included', label: customLabelIncluded || 'Условия' },
        { id: 'additional', label: customLabelAdditional || 'Допълнения' }
    ]

    return (
        <div className="relative">
            {/* Sticky Navigation */}
            <div className="sticky top-16 z-30 backdrop-blur-md rounded-lg border-b border-transparent mb-6 transition-all duration-300">
                <div className="inline-flex items-center justify-start bg-slate-900/30 p-1 rounded-lg border border-slate-800 w-full overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                activeTab === tab.id
                                    ? `${theme.bg} text-black shadow-sm`
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections Stacked Vertically */}
            <div className="space-y-12 pb-8">
                {/* Program Section */}
                <div id="program" ref={programRef} className="scroll-mt-40">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className={`w-2 h-8 rounded-full ${theme.bg}`}></span>
                        {customLabelProgram || 'Програма'}
                    </h3>
                    <ExperienceProgram
                        program={program || []}
                        locations={locations}
                        themeColor={themeColor}
                    />
                </div>

                {/* Included/Excluded Section */}
                <div id="included" ref={includedRef} className="scroll-mt-40 border-t border-slate-800 pt-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className={`w-2 h-8 rounded-full ${theme.bg}`}></span>
                        {customLabelIncluded || 'Какво е включено'}
                    </h3>
                    <ExperienceIncluded
                        included={included || []}
                        notIncluded={notIncluded || []}
                        themeColor={themeColor}
                    />
                </div>

                {/* Additional Items Section */}
                <div id="additional" ref={additionalRef} className="scroll-mt-40 border-t border-slate-800 pt-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className={`w-2 h-8 rounded-full ${theme.bg}`}></span>
                        {customLabelAdditional || 'Допълнителни опции'}
                    </h3>
                    {additionalItems && additionalItems.length > 0 ? (
                        <ExperienceAdditionalItems
                            items={additionalItems}
                            themeColor={themeColor}
                            experienceId={experienceId}
                        />
                    ) : (
                        <p className="text-slate-400 text-center py-8 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                            Няма налични допълнения за този пакет.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}