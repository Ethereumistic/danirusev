import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

import { defaultMetadata } from "@/lib/seo";

// SEO
export const metadata: Metadata = {
  ...defaultMetadata,
  title: {
    template: '%s | Dani Rusev 11 - Екстремни Преживявания',
    default: 'Dani Rusev 11 - Екстремни Автомобилни и Дрифт Преживявания в България',
  },
  description: 'Подарете уникално екстремно преживяване! Предлагаме дрифт, рали и шофиране на спортни коли на писта. Перфектният подарък за мъж с ваучер за преживяване.',
  keywords: [
    ...((defaultMetadata.keywords as string[]) || []),
    'рали изживяване', 'дрифт изживяване', 'подарък с адреналин', 'преживяване с кола', 'каране на спортна кола', 'подарък с рали автомобил', 'подарък за фен на коли', 'дрифт обучение', 'каране на дрифт кола', 'професионален дрифт', 'рали приключение', 'офроуд преживяване', 'управление на рали кола', 'тест драйв на писта', 'екстремен подарък', 'уникален подарък за рожден ден', 'подарък за гадже', 'подарък за съпруг',
    'extreme car experiences', 'adrenaline gift', 'car experiences Bulgaria', 'drive a rally car', 'drive a drift car', 'motorsport experiences', 'racing gift ideas', 'car enthusiast gifts', 'professional drift training', 'drift experience day', 'rally track driving', 'off-road car experience', 'test drive rally car', 'car experience gift', 'unique gift for him', 'birthday experience gift', 'driving gift voucher', 'adventure gifts for men', 'unforgettable car gift'
  ],
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single();
    role = data?.role || 'customer';
  }

  // Sanitize user object for serialization
  const sanitizedUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    aud: user.aud,
    role: user.role,
  } : null;

  return (
    <html lang="bg" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gagalin.variable} antialiased min-h-screen flex flex-col bg-slate-950`}
      >
        <OrganizationSchema />
        <AuthProvider initialUser={sanitizedUser as any} initialRole={role}>
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
