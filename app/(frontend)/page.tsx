import { Suspense } from 'react'
import Hero from '@/components/hero/hero'
import { Metadata } from 'next'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel'
import { UrgencyCTA } from '@/components/landing/urgency-cta'
import { WhyChooseUsV2 } from '@/components/experience/why-choose-us-v2'
import { ExperienceSectionWrapper, ExperienceSectionSkeleton } from '@/components/experience'
import { PromoBannersList } from '@/components/landing/promo-banners-list'
import { AboutSection } from '@/components/landing/about-section'

export const metadata: Metadata = {
  title: 'Начало',
  description: 'Екстремни автомобилни преживявания в България. Дрифт, рали и каране на писта с професионални инструктори. Подарете незабравимо изживяване!',
  keywords: 'екстремни преживявания българия, дрифт преживяване, рали кола, автомобилна писта, подарък за мъж, ваучер за преживяване, dani rusev 11',
  openGraph: {
    title: 'Dani Rusev 11 - Екстремни Автомобилни Преживявания',
    description: 'Изживей скоростта. Почувствай адреналина. Професионални дрифт и рали преживявания в България.',
    url: process.env.NEXT_PUBLIC_SERVER_URL,
    siteName: 'Dani Rusev 11',
    type: 'website',
    locale: 'bg_BG',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SERVER_URL,
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

      <TestimonialsCarousel />

      <AboutSection />

      {/* CMS-driven promo banners - wrapped in Suspense to prevent blocking */}
      <Suspense fallback={null}>
        <PromoBannersList />
      </Suspense>

    </main>
  )
}

