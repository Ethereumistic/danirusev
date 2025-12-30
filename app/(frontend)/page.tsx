import { Suspense } from 'react'
import Hero from '@/components/hero/hero'
import { Metadata } from 'next'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel'
import { UrgencyCTA } from '@/components/landing/urgency-cta'
import { WhyChooseUsV2 } from '@/components/experience/why-choose-us-v2'
import { ExperienceSectionWrapper, ExperienceSectionSkeleton } from '@/components/experience'
import { PromoBanner } from '@/components/landing/promo-banner'
import { getPayloadClient } from '@/lib/get-payload'
import type { PromoBanner as PromoBannerType } from '@/types/payload-types'

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

export default async function Home() {
  // Fetch active promo banners from Payload CMS
  const payload = await getPayloadClient()
  const { docs: promoBanners } = await payload.find({
    collection: 'promo-banners',
    where: { isActive: { equals: true } },
    limit: 10,
  })

  return (
    <main className="min-h-screen ">
      {/* Hero with rotating quotes */}
      <Hero />

      <WhyChooseUsV2 />
      {/* Show how easy it is to book */}


      <Suspense fallback={<ExperienceSectionSkeleton />}>
        <ExperienceSectionWrapper linkPrefix="/experience" />
      </Suspense>

      <HowItWorks />

      {/* Main drift experiences - the core offering */}
      {/* Wrapped in Suspense so the rest of the page loads instantly */}


      {/* Build trust with social proof */}
      <TestimonialsCarousel />

      {/* Final push with urgency */}
      <UrgencyCTA />

      {/* CMS-driven promo banners */}
      {promoBanners.map((banner) => (
        <PromoBanner key={banner.id} banner={banner as unknown as PromoBannerType} />
      ))}
    </main>
  )
}
