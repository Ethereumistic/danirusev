import { Suspense } from 'react';
import { getPayloadClient } from '@/lib/get-payload';
import { ExperiencesPageClient } from './client-page';
import { Experience } from '@/payload-types';
import { ExperiencesPageSkeleton } from '@/components/experiences/experiences-page-skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Екстремни Преживявания | Дрифт, Рали, Писта',
  description: 'Разгледайте нашите екстремни автомобилни преживявания - дрифт обучение, рали каране, управление на спортни коли на писта. Подарете незабравимо изживяване!',
  keywords: 'дрифт преживяване, рали преживяване, писта каране, екстремни преживявания, автомобилни преживявания, подарък ваучер, дрифт обучение, рали кола, спортни коли',
  openGraph: {
    title: 'Екстремни Автомобилни Преживявания | Dani Rusev 11',
    description: 'Изберете от най-добрите автомобилни преживявания в България. Дрифт, рали и каране на писта с професионални инструктори.',
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/experiences`,
    siteName: 'Dani Rusev 11',
    type: 'website',
    locale: 'bg_BG',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SERVER_URL}/experiences`,
  },
};

async function ExperiencesLoader() {
  const payload = await getPayloadClient();

  const { docs: experiences } = await payload.find({
    collection: 'experiences',
    limit: 100,
    sort: 'sort',
  });

  const transformedExperiences = experiences.map((exp: Experience) => ({
    id: exp.id.toString(),
    title: exp.title,
    subtitle: exp.subtitle,
    price: exp.price.toString(),
    duration: exp.duration,
    description: exp.description,
    icon: exp.icon,
    sessions: exp.sessions,
    detailedInfo: {
      overview: exp.detailedInfo.overview,
      whatYouGet: (exp.detailedInfo.whatYouGet || []).map(item => item.item),
      process: (exp.detailedInfo.process || []).map(step => step.step),
      locations: (exp.detailedInfo.locations || []).map(loc => loc.location),
      requirements: (exp.detailedInfo.requirements || []).map(req => req.requirement),
    },
  }));

  if (transformedExperiences.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-muted-foreground">Няма намерени преживявания.</p>
      </div>
    );
  }

  return <ExperiencesPageClient experiences={transformedExperiences} />;
}

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<ExperiencesPageSkeleton />}>
      <ExperiencesLoader />
    </Suspense>
  );
}