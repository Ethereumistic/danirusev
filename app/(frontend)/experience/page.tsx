import * as React from "react"
import { Button } from "@/components/ui/button"
import { Flame } from "lucide-react"

// Data fetching
import { getProducts } from "@/lib/api/products"
import type { ExperienceProduct } from "@/types/payload-types"

// Force dynamic rendering to always get fresh CMS data
export const revalidate = 0

// Components - Using new CMS-only experience components
import { ExperienceSection } from "@/components/experience"
import { WhyChooseUs } from "@/components/drift/why-choose-us"
import Hero from "@/components/hero/hero"

export default async function ExperiencePage() {
    // Fetch experience products from CMS
    const products = await getProducts('experience')
    const experiences = products as ExperienceProduct[]

    return (
        <main className="min-h-screen bg-slate-950">
            {/* HERO SECTION */}
            <Hero />

            {/* WHY CHOOSE US SECTION */}
            <WhyChooseUs />

            {/* EXPERIENCES SECTION - Using new CMS-only components */}
            <ExperienceSection
                experiences={experiences}
                linkPrefix="/experience"
            />

            {/* FINAL CTA SECTION */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-main/10 via-transparent to-taxi/10" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6">
                            Готов за<br />
                            <span className="text-main">Дрифт?</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Не чакай повече. Запази своята сесия сега и усети какво е истинската мощ на дрифта.
                        </p>
                        <a href="#drift-experiences">
                            <Button
                                size="lg"
                                className="bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Избери Преживяване
                                    <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </span>
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    )
}
