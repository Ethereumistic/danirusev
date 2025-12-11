import { Suspense } from 'react'
import Hero from '@/components/hero/hero'
import { Metadata } from 'next'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel'
import { UrgencyCTA } from '@/components/landing/urgency-cta'
import { ExperiencesSection } from '@/components/drift/experiences-section'
import { WhyChooseUs } from '@/components/drift/why-choose-us'

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

      <WhyChooseUs />
      {/* Show how easy it is to book */}
      <HowItWorks />

      {/* Main drift experiences - the core offering */}
      <ExperiencesSection />

      {/* Build trust with social proof */}
      <TestimonialsCarousel />

      {/* Final push with urgency */}
      <UrgencyCTA />
    </main>
  )
}
