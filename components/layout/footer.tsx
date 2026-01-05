import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, ArrowUpRight, Wifi } from 'lucide-react';
import TikTokIcon from './tiktok';
import { cn } from '@/lib/utils';

export function Footer() {
  const navItems = [
    { label: 'За нас', href: '/#about' },
    { label: 'Преживявания', href: '/#drift-experiences' },
    { label: 'Магазин', href: '/shop', locked: true },
    { label: 'Абонамент', href: '/subscription', locked: true },
    { label: 'Контакти', href: '/contact' },
  ];

  const legalItems = [
    { label: 'Общи условия', href: '/terms' },
    { label: 'Политика за поверителност', href: '/privacy' },
    { label: 'Политика за бисквитки', href: '/cookies' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/danirusev11/',
      className: 'bg-gradient-to-bl from-[#833ab4] via-[#fd1d1d] to-[#fcb045]'
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      href: 'https://tiktok.com/@danirusev11',
      className: 'bg-black',
      iconClassName: '[filter:drop-shadow(-1px_-1px_0_#00f2ea)_drop-shadow(1px_1px_0_#ff0050)]'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com/@danirusev11',
      className: 'bg-red-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/dani.rusev.5',
      className: 'bg-blue-600'
    },
  ];

  const contactInfo = [
    { icon: Phone, text: '+359 88 272 6020', href: 'tel:+359882726020', label: 'Телефон' },
    { icon: Mail, text: 'contact@danirusev.com', href: 'mailto:contact@danirusev.com', label: 'Имейл' },
    { icon: MapPin, text: 'Автомобилен Пoлигон, гр. Трявна', href: 'https://maps.app.goo.gl/pPgQekKHASUHBxY59', label: 'Локация' },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-white/5 pt-20 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-main/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-main/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="inline-block group transition-transform hover:scale-105 active:scale-95">
              <Logo />
              <span className="sr-only">Dani Rusev 11</span>
            </Link>

            <p className="text-white uppercase text-lg font-bold italic leading-relaxed max-w-sm">
              Изживей <span className="text-main">скоростта</span>. Почувствай <span className="text-main">адреналина</span>. Професионални <span className="text-main">дрифт преживявания</span> за тези, които не се страхуват от <span className="text-main">лимита</span>.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-2xl border  text-white hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300 group",
                    social.className
                  )}
                >
                  <social.icon className={cn("w-5 h-5 transition-transform group-hover:scale-105", social.iconClassName)} />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div className="space-y-6 flex flex-col items-center md:items-start">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-main rounded-full" />
                Навигация
              </h3>
              <ul className="space-y-4 text-center md:text-left">
                {navItems.map((item) => (
                  <li key={item.href}>
                    {item.locked ? (
                      <span className="text-slate-600 cursor-not-allowed flex items-center justify-center md:justify-start gap-2 text-sm font-black uppercase tracking-tight italic">
                        {item.label} 🔒
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="group flex items-center justify-center md:justify-start gap-2 text-slate-400 hover:text-white transition-colors text-sm font-black uppercase tracking-tight italic"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 flex flex-col items-center md:items-start">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-main rounded-full" />
                Правни
              </h3>
              <ul className="space-y-4 text-center md:text-left">
                {legalItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-center md:justify-start gap-2 text-slate-400 hover:text-white transition-colors text-sm font-black uppercase tracking-tight italic"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-3 space-y-6 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-main rounded-full" />
              Контакти
            </h3>
            <div className="space-y-4 w-full">
              {contactInfo.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target={item.icon === MapPin ? "_blank" : undefined}
                  rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-main shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-slate-200 truncate">{item.text}</span>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Dani Rusev 11.</span>
            <span className="hidden md:inline text-slate-800">•</span>
            <span>Всички права запазени.</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>Powered by</span>
            <a
              href="https://echoray.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-main transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-main/20"
            >
              <Wifi className="w-4 h-4 rounded-full text-main animate-pulse" />
              Echoray.io
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
