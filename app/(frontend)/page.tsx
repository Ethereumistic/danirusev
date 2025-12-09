import { Suspense } from 'react'
import Hero from '@/components/hero/hero'
import DriftExperienceCards from '@/components/experiences/drift-experience-cards'
import { getPayloadClient } from '@/lib/get-payload'
import { Experience } from '@/payload-types'
import { DriftExperienceCardSkeleton } from '@/components/experiences/drift-experience-card-skeleton'
import { Metadata } from 'next'
import DriftExperiences from '@/components/drift/drift-cards'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel'
import { UrgencyCTA } from '@/components/landing/urgency-cta'
import { ExperiencesSection } from '@/components/drift/experiences-section'

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

async function getExperiences(): Promise<Experience[]> {
  const payload = await getPayloadClient()
  try {
    const { docs: experiences } = await payload.find({
      collection: 'experiences',
      limit: 3, // Fetch only 3 for the homepage
      sort: 'sort',
      depth: 1,
    })
    // Ensure IDs are strings for consistency
    return experiences.map(exp => ({ ...exp, id: exp.id.toString() }))
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return []
  }
}

// This is an async component that will be streamed
async function ExperienceCardsLoader() {
  const experiences = await getExperiences()
  return <DriftExperienceCards experiences={experiences} />
}

export default function Home() {
  return (
    <main className="min-h-screen ">
      {/* Hero with rotating quotes */}
      <Hero />

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
