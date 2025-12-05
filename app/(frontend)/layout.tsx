import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from '@/components/providers/supabase-auth-provider';
import { Toaster } from 'sonner';
import { Navbar } from "@/components/layout/navbar";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { OrganizationSchema } from "@/components/seo/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gagalin = localFont({
  src: "../../public/fonts/Gagalin-Regular.otf",
  variable: "--font-gagalin",
});

// SEO
export const metadata: Metadata = {
  title: {
    template: '%s | Dani Rusev 11 - Екстремни Преживявания',
    default: 'Dani Rusev 11 - Екстремни Автомобилни и Дрифт Преживявания в България',
  },
  description: 'Подарете уникално екстремно преживяване! Предлагаме дрифт, рали и шофиране на спортни коли на писта. Перфектният подарък за мъж с ваучер за преживяване.',
  keywords: [
    // Български
    'дани русев','данаил русев',  'екстремни преживявания', 'автомобилни преживявания', 'рали изживяване', 'дрифт изживяване', 'подарък за мъж', 'подарък с адреналин', 'преживяване с кола', 'каране на спортна кола', 'подарък с рали автомобил', 'подарък за фен на коли', 'дрифт обучение', 'каране на дрифт кола', 'професионален дрифт', 'рали приключение', 'офроуд преживяване', 'управление на рали кола', 'тест драйв на писта', 'ваучер за преживяване', 'екстремен подарък', 'уникален подарък за рожден ден', 'подарък за гадже', 'подарък за съпруг',
    // Английски
    'dani rusev', 'danail rusev', 'extreme car experiences', 'rally driving experience', 'drift driving experience', 'adrenaline gift', 'car experiences Bulgaria', 'drive a rally car', 'drive a drift car', 'motorsport experiences', 'racing gift ideas', 'car enthusiast gifts', 'professional drift training', 'drift experience day', 'rally track driving', 'off-road car experience', 'test drive rally car', 'car experience gift', 'unique gift for him', 'birthday experience gift', 'driving gift voucher', 'adventure gifts for men', 'unforgettable car gift'
  ],
  creator: 'Dani Rusev 11',
  publisher: 'Echoray.io',

  // --- Open Graph (за споделяне в социални мрежи като Facebook, Instagram) ---
  openGraph: {
    title: 'Dani Rusev 11 - Изживей скоростта. Почувствай адреналина.',
    description: 'Ваучери за екстремни подаръци - дрифт, рали и шофиране на спортни автомобили в България.',
    url: 'https://danirusev.vercel.app', // **ВАЖНО**: Сменете с реалния домейн на сайта!
    siteName: 'Dani Rusev 11',
    images: [
      {
        url: 'https://danirusev.vercel.app/og-image.jpg', // **ВАЖНО**: Създайте и качете такова изображение!
        width: 1200,
        height: 630,
        alt: 'Дрифт автомобил на писта - Dani Rusev 11',
      },
    ],
    locale: 'bg_BG',
    type: 'website',
  },

  // --- Twitter Card (за споделяне в Twitter) ---
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Dani Rusev 11 - Екстремни Преживявания с Коли',
  //   description: 'Подари адреналин! Дрифт, рали и спортни коли на писта. Разгледай нашите ваучери за преживявания.',
  //   images: ['https://www.danirusev11.com/twitter-image.jpg'], // **ВАЖНО**: Създайте и качете такова изображение!
  // },
  
  // --- Други важни тагове ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL('https://danirusev.vercel.app'), // **ВАЖНО**: Сменете с реалния домейн!
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" suppressHydrationWarning> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gagalin.variable} antialiased min-h-screen flex flex-col`}
      >
        <OrganizationSchema />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </main>
            <Toaster />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
