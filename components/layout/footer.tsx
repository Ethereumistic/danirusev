import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import TikTokIcon from './tiktok'

export function Footer() {
  const navItems = [
    { label: 'Начало', href: '/' },
    { label: 'Преживявания', href: '/experiences' },
    { label: 'Магазин 🔒', href: '/shop', locked: true },
    { label: 'Абонамент 🔒', href: '/subscription', locked: true },
    { label: 'Контакти', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/dani.rusev.5' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/danirusev11/' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@danirusev11' },
  ];

  return (
    <footer className="bg-card text-card-foreground border-t ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* Logo and Slogan */}
            <div className="space-y-4 xl:col-span-1">
              <Link href="/" className="inline-block">
                <Logo />
                <span className="sr-only">Dani Rusev 11</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Изживей скоростта. Почувствай адреналина.
              </p>
            </div>
            
            {/* Navigation Links */}
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase">Навигация</h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        {item.locked ? (
                          <span
                            className="text-muted-foreground  cursor-not-allowed px-2 py-1"
                            aria-disabled="true"
                            tabIndex={-1}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            href={item.href}
                            className="hover:text-alt dark:hover:text-main text-muted-foreground transition-colors px-2 py-1"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold tracking-wider uppercase">Правни</h3>
                  <ul role="list" className="mt-4 space-y-4">
                    <li>
                      <Link href="/legal" className="text-base text-muted-foreground hover:text-alt dark:hover:text-main">
                        Общи условия
                      </Link>
                    </li>
                     <li>
                      <Link href="/legal?tab=privacy" className="text-base text-muted-foreground hover:text-alt dark:hover:text-main">
                        Политика за поверителност
                      </Link>
                    </li>
                     <li>
                      <Link href="/legal?tab=cookies" className="text-base text-muted-foreground hover:text-alt dark:hover:text-main">
                        Политика за бисквитки
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="md:grid md:grid-cols-1 md:gap-8">
                 <div>
                    <h3 className="text-sm font-semibold tracking-wider uppercase">Последвайте ни</h3>
                    <div className="mt-4 flex space-x-6">
                      <Link href="https://tiktok.com/@danirusev11" target="_blank" rel="noopener noreferrer">
                    <TikTokIcon className="h-6 w-6 text-muted-foreground hover:text-alt dark:hover:text-main" />
                    </Link>
                        {socialLinks.map((item) => (
                        <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-alt dark:hover:text-main">
                            <span className="sr-only">{item.name}</span>
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                            
                        </a>
                        
                        ))}
                        
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t py-6 md:flex md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dani Rusev 11. Всички права запазени.
          </p>
          <p className="mt-4 text-sm text-muted-foreground md:mt-0">
            Създадено с <span className="text-red-500">&hearts;</span> от <a href="https://echoray.io" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-alt dark:hover:text-main">Echoray.io</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
