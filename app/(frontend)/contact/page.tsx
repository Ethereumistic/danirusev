import { Metadata } from 'next';
import ContactClient from './contact-client';
import { BreadcrumbSchema } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: 'Контакти | Dani Rusev 11',
  description: 'Свържете се с нас за резервации, въпроси или специални оферти. Автомобилни преживявания в България - дрифт, рали, писта.',
  keywords: 'контакти dani rusev, резервация преживяване, автомобилен полигон трявна, дрифт резервация, рали резервация',
  openGraph: {
    title: 'Свържете се с Dani Rusev 11',
    description: 'Резервирайте вашето екстремно автомобилно преживяване. Локация: Автомобилен Полигон, гр. Трявна.',
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/contact`,
    siteName: 'Dani Rusev 11',
    type: 'website',
    locale: 'bg_BG',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SERVER_URL}/contact`,
  },
};

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danirusev.vercel.app';
  
  return (
    <>
      <BreadcrumbSchema 
        items={[
          { name: 'Начало', url: baseUrl },
          { name: 'Контакти', url: `${baseUrl}/contact` }
        ]} 
      />
      <ContactClient />
    </>
  );
}
