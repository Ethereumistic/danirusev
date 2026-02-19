'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, User, Shield, LayoutDashboard, ScanLine, Package,
  Settings, LogOut, Ticket, Info, Trophy, ShoppingBag,
  Zap, PhoneCall, ChevronRight, Gift, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from '@/components/providers/supabase-auth-provider';
import { useAuthStore } from '@/lib/stores/auth-store';
import Logo from '@/components/ui/logo';
import { CartWidget } from '../cart/cart-widget';
import { cn } from '@/lib/utils';


export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, userRole: contextRole, signOut } = useAuth();
  const { userRole: storedRole } = useAuthStore();

  // Use context role if available, fallback to stored role for persistence
  const userRole = contextRole || storedRole;

  const navItems = [
    { label: 'За Нас', href: '/#about', isHashLink: true, icon: Info },
    { label: 'Преживявания', href: '/#drift-experiences', isHashLink: true, icon: Trophy },
    { label: 'Магазин 🔒', href: '/shop', disabled: true, icon: ShoppingBag },
    { label: 'Абонамент 🔒', href: '/subscription', disabled: true, icon: Zap },
    { label: 'Контакти', href: '/contact', icon: PhoneCall },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (pathname === '/' && item.isHashLink) {
      e.preventDefault();
      const targetId = item.href.replace('/#', '');
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation (Centered) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="flex items-center gap-x-6">
            {navItems.map((item) =>
              item.disabled ? (
                <Button
                  key={item.href}
                  variant='main'
                  size='sm'
                  className='text-md mx-1 font-black uppercase tracking-tighter italic transition-colors text-alt/90 dark:text-main/90'
                  disabled
                >
                  <span className='flex items-center'>
                    {item.label}
                  </span>
                </Button>
              ) : (
                <Button
                  key={item.href}
                  variant='main'
                  size='sm'
                  className='text-md mx-1 font-black uppercase tracking-tighter italic transition-colors '
                  asChild
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`text-md mx-1 font-black uppercase tracking-tighter italic transition-colors ${pathname === item.href
                      ? 'text-alt dark:text-main dark:hover:text-alt'
                      : 'text-alt dark:text-main dark:hover:text-alt'
                      }`}
                  >
                    {item.label}
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-2 lg:gap-x-4">
          {/* Shopping Cart */}
          <CartWidget />

          {/* User Menu (Desktop Only) */}
          <div className="hidden lg:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="main"
                    size="icon"
                    className="relative "
                    aria-label="User Menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 b p-3 bg-slate-950 border-white/5 shadow-3xl rounded-3xl space-y-3">
                  {/* User Profile "Button" leading to Account */}
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <Link
                      href="/account"
                      className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5 hover:bg-slate-900 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-main/10 border border-main/20 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-main" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black uppercase tracking-tighter italic text-white truncate leading-tight">{user.user_metadata?.name || 'Customer'}</span>
                          <span className="text-[9px] text-slate-500 font-bold truncate tracking-wide">{user.email}</span>
                        </div>
                      </div>
                      <Settings className="h-5 w-5 text-slate-500 hover:text-main transition-colors shrink-0" />
                    </Link>
                  </DropdownMenuItem>

                  {/* 2 Columns Grid for Orders & Vouchers */}
                  <div className="grid grid-cols-2 gap-2">
                    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                      <Link
                        href="/orders"
                        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 group cursor-pointer"
                      >
                        <Package className="h-5 w-5 text-main group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Поръчки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                      <Link
                        href="/vouchers"
                        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 group cursor-pointer"
                      >
                        <Ticket className="h-5 w-5 text-main group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Ваучери</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  {/* 3 Columns Admin Grid */}
                  {userRole === 'admin' && (
                    <div className="grid grid-cols-3 gap-2">
                      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                        <Link
                          href="/admin"
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-main/5 border border-main/10 hover:bg-main/10 transition-all active:scale-95 group cursor-pointer"
                        >
                          <Shield className="h-5 w-5 text-main group-hover:rotate-12 transition-transform mb-1" />
                          <span className="text-[8px] font-black uppercase tracking-tight text-white">Admin</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                        <Link
                          href="/dash"
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all active:scale-95 group cursor-pointer"
                        >
                          <LayoutDashboard className="h-5 w-5 text-main group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[8px] font-black uppercase tracking-tight text-slate-400">Dash</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                        <Link
                          href="/dash/verify"
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all active:scale-95 group cursor-pointer"
                        >
                          <ScanLine className="h-5 w-5 text-main group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[8px] font-black uppercase tracking-tight text-slate-400">Scan</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  )}

                  {/* Logout Button */}
                  <DropdownMenuItem
                    className="p-0 focus:bg-transparent cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                  >
                    <div className="w-full flex items-center justify-center h-12 bg-slate-900/50 hover:bg-red-500/10 text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl font-black uppercase italic tracking-tighter transition-all">
                      <LogOut className="h-4 w-4 mr-2" />
                      Изход от профила
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="main" className='text-alt font-black uppercase tracking-tighter italic bg-main' asChild>
                <Link href="/sign-in">Вход</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button (Right Side) */}
          <Button
            variant="ghost"
            className="px-2 text-foreground hover:bg-white/5 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-sm bg-slate-950 border-l-slate-800 p-0 flex flex-col h-[100dvh] shadow-2xl [&>button]:top-3 [&>button]:right-8 [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button>svg]:size-6 [&>button>svg]:m-0"
        >
          {/* Header designed to perfectly overlay the navbar ribbon */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <Link href="/" onClick={handleLogoClick}>
              <Logo />
            </Link>
          </div>

          {/* Primary Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    {item.disabled ? (
                      <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-900/30 opacity-30 select-none cursor-not-allowed">
                        <Icon className="h-4.5 w-4.5 text-slate-500" />
                        <span className="text-base font-black uppercase tracking-tighter italic text-slate-500">
                          {item.label}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group border border-transparent",
                          pathname === item.href
                            ? "bg-main/10 text-main"
                            : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            pathname === item.href ? "text-main" : "text-slate-400 group-hover:text-white"
                          )} />
                          <span className={cn(
                            "text-base font-black uppercase tracking-tighter italic transition-colors",
                            pathname === item.href ? "text-white" : "text-slate-300 group-hover:text-white"
                          )}>
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all duration-300 group-hover:translate-x-1",
                          pathname === item.href ? "text-main" : "text-slate-700"
                        )} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Footer User Section */}
          <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {user ? (
              <div className="space-y-3">
                {/* User Profile "Button" leading to Account */}
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5 hover:bg-slate-900 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-main/10 border border-main/20 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-main" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black uppercase tracking-tighter italic text-white truncate leading-tight">{user.user_metadata?.name || 'Customer'}</span>
                      <span className="text-[10px] text-slate-500 font-bold truncate tracking-wide">{user.email}</span>
                    </div>
                  </div>
                  <Settings className="h-5 w-5 text-slate-500 hover:text-main transition-colors shrink-0" />
                </Link>

                {/* 2 Columns Grid for Orders & Vouchers */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 group"
                  >
                    <Package className="h-5 w-5 text-main group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Поръчки</span>
                  </Link>
                  <Link
                    href="/vouchers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 group"
                  >
                    <Ticket className="h-5 w-5 text-main group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Ваучери</span>
                  </Link>
                </div>

                {/* 3 Columns Admin Grid */}
                {userRole === 'admin' && (
                  <div className="grid grid-cols-3 gap-2 ">
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-main/5 border border-main/10 hover:bg-main/10 transition-all active:scale-95 group"
                    >
                      <Shield className="h-5 w-5 text-main group-hover:rotate-12 transition-transform mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-tight text-white">Admin</span>
                    </Link>
                    <Link
                      href="/dash"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all active:scale-95 group"
                    >
                      <LayoutDashboard className="h-5 w-5 text-main group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-tight text-slate-400">Dash</span>
                    </Link>
                    <Link
                      href="/dash/verify"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all active:scale-95 group"
                    >
                      <ScanLine className="h-5 w-5 text-main group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-tight text-slate-400">Scan</span>
                    </Link>
                  </div>
                )}

                {/* Logout Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-12 bg-slate-900/50 hover:bg-red-500/10 text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl font-black uppercase italic tracking-tighter transition-all"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Изход от профила
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="main" className="w-full h-14 text-alt font-black uppercase tracking-tighter italic bg-main rounded-2xl shadow-[0_0_20px_rgba(208,246,26,0.2)]" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/sign-in">Влез в профила →</Link>
                </Button>
                <Button variant="ghost" className="w-full h-12 hover:text-slate-400 text-white font-black uppercase tracking-tighter italic rounded-2xl border border-white/5 bg-white/5" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/sign-up">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
