import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../(frontend)/globals.css' // Reuse the global styles
import { AuthProvider } from '@/components/providers/supabase-auth-provider'
import { Toaster } from 'sonner'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const gagalin = localFont({
  src: '../../public/fonts/Gagalin-Regular.otf',
  variable: '--font-gagalin',
})

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Order management dashboard',
}

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gagalin.variable} antialiased bg-muted/40`}
      >
        <AuthProvider>
          <Navbar />
          {/* A simple header could go here if needed in the future */}
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            {children}
          </Suspense>
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  )
}