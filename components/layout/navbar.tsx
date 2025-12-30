'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Shield, LayoutDashboard, ScanLine, Package, Settings, LogOut, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/supabase-auth-provider';
import { useAuthStore } from '@/lib/stores/auth-store';
import Logo from '@/components/ui/logo';
import { CartWidget } from '../cart/cart-widget';


export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, userRole: contextRole, signOut } = useAuth();
  const { userRole: storedRole } = useAuthStore();

  // Use context role if available, fallback to stored role for persistence
  const userRole = contextRole || storedRole;

  const navItems = [
    { label: 'За Нас', href: '/about' },
    { label: 'Преживявания', href: '/#drift-experiences', isHashLink: true },
    { label: 'Магазин', href: '/shop', },
    { label: 'Абонамент 🔒', href: '/subscription', disabled: true },
    { label: 'Контакти', href: '/contact' },
  ];

  // Handler for smooth scroll when already on homepage
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    // If we're on the homepage and clicking a hash link, do smooth scroll
    if (pathname === '/' && item.isHashLink) {
      e.preventDefault();
      const targetId = item.href.replace('/#', '');
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
    // Otherwise, let the browser handle navigation to /#hash
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-x-8">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="mx-2 px-0 text-foreground hover:text-foreground hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation (Centered) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="flex items-center gap-x-6">
            {navItems.map((item) =>
              item.disabled ? (
                <Button
                  key={item.href} // Added key here
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

        <div className="flex items-center gap-x-4">
          {/* Shopping Cart */}
          <CartWidget />

          {/* User Menu */}
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex-col items-start">
                  <div className="font-medium text-foreground">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.user_metadata?.name || 'Customer'}
                  </div>
                </DropdownMenuItem>

                {/* Admin Section */}
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 text-foreground">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dash" className="flex items-center gap-2 text-foreground">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dash/verify" className="flex items-center gap-2 text-foreground">
                        <ScanLine className="h-4 w-4" />
                        Scan
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 text-foreground">
                    <Package className="h-4 w-4" />
                    Поръчки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/vouchers" className="flex items-center gap-2 text-foreground">
                    <Ticket className="h-4 w-4" />
                    Ваучери
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>

                  <Link href="/account" className="flex items-center gap-2 text-foreground">
                    <Settings className="h-4 w-4" />
                    Настройки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  Изход
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="main" className='text-alt font-black uppercase tracking-tighter italic bg-main mr-3' asChild>
              <Link href="/sign-in">Вход</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b bg-background px-4 py-4 lg:hidden fixed w-full">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.disabled ? (
                <span
                  className="py-2 pl-4 text-muted-foreground font-medium flex items-center cursor-not-allowed opacity-60 select-none"
                  aria-disabled="true"
                  tabIndex={-1}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`block pl-4 py-2 text-foreground font-medium transition-colors hover:text-main ${pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                  onClick={(e) => {
                    handleNavClick(e, item);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}

