import { Suspense } from 'react'
import Hero from '@/components/hero/hero'
import { Metadata } from 'next'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TestimonialsWrapper } from '@/components/landing/testimonials-wrapper'
import { TestimonialsSkeleton } from '@/components/landing/testimonials-skeleton'
import { WhyChooseUsV2 } from '@/components/experience/why-choose-us-v2'
import { ExperienceSectionWrapper, ExperienceSectionSkeleton } from '@/components/experience'
import { PromoBannersList } from '@/components/landing/promo-banners-list'
import { AboutSection } from '@/components/landing/about-section'

import { defaultMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Dani Rusev 11 | Екстремни Дрифт и Рали Преживявания в България',
  description: 'Екстремни автомобилни преживявания в България. Дрифт, рали и каране на писта с професионални инструктори. Подарете незабравимо изживяване!',
  openGraph: {
    ...defaultMetadata.openGraph,
    title: 'Dani Rusev 11 - Екстремни Автомобилни Преживявания',
    description: 'Изживей скоростта. Почувствай адреналина. Професионални дрифт и рали преживявания в България.',
  },
  alternates: {
    canonical: '/',
  },
}


export default function Home() {
  return (
    <main className="min-h-screen ">
      {/* Hero with rotating quotes */}
      <Hero />

      <WhyChooseUsV2 />


      <Suspense fallback={<ExperienceSectionSkeleton />}>
        <ExperienceSectionWrapper linkPrefix="/experience" />
      </Suspense>

      <HowItWorks />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsWrapper />
      </Suspense>

      <AboutSection />

      {/* CMS-driven promo banners - wrapped in Suspense to prevent blocking */}
      <Suspense fallback={null}>
        <PromoBannersList />
      </Suspense>

    </main>
  )
}

