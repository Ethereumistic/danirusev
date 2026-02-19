import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/hero/hero'
import { Metadata } from 'next'
import { TestimonialsSkeleton } from '@/components/landing/testimonials-skeleton'
import { ExperienceSectionSkeleton } from '@/components/experience'
import { WhyChooseUsV2Skeleton } from '@/components/experience/why-choose-us-skeleton'
import { HowItWorksSkeleton } from '@/components/landing/how-it-works-skeleton'

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

const WhyChooseUsV2 = dynamic(
  () => import('@/components/experience/why-choose-us-v2').then((mod) => mod.WhyChooseUsV2),
  { ssr: true }
)

const ExperienceSectionWrapper = dynamic(
  () => import('@/components/experience/experience-section-wrapper').then((mod) => mod.ExperienceSectionWrapper),
  { ssr: true }
)

const HowItWorks = dynamic(
  () => import('@/components/landing/how-it-works').then((mod) => mod.HowItWorks),
  { ssr: true }
)

const TestimonialsWrapper = dynamic(
  () => import('@/components/landing/testimonials-wrapper').then((mod) => mod.TestimonialsWrapper),
  { ssr: true }
)

const AboutSectionWrapper = dynamic(
  () => import('@/components/landing/about-section-wrapper').then((mod) => mod.AboutSectionWrapper),
  { ssr: true }
)

const PromoBannersList = dynamic(
  () => import('@/components/landing/promo-banners-list').then((mod) => mod.PromoBannersList),
  { ssr: true }
)

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Hero />

      <Suspense fallback={<WhyChooseUsV2Skeleton />}>
        <WhyChooseUsV2 />
      </Suspense>

      <Suspense fallback={<ExperienceSectionSkeleton />}>
        <ExperienceSectionWrapper linkPrefix="/experience" />
      </Suspense>

      <Suspense fallback={<HowItWorksSkeleton />}>
        <HowItWorks />
      </Suspense>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsWrapper />
      </Suspense>

      <Suspense fallback={null}>
        <AboutSectionWrapper />
      </Suspense>

      <Suspense fallback={null}>
        <PromoBannersList />
      </Suspense>

    </main>
  )
}
