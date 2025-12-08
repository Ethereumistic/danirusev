'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/theme-switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/supabase-auth-provider';
import Logo from '@/components/ui/logo';
import { CartWidget } from '../cart/cart-widget';


export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'За Нас', href: '/about' },
    { label: 'Преживявания', href: '/xp' },
    { label: 'Магазин 🔒', href: '/shop', disabled: true },
    { label: 'Абонамент 🔒', href: '/subscription', disabled: true },
    { label: 'Контакти', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-x-8">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="mr-2 px-0 text-foreground hover:text-foreground hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
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
                  className='text-md mx-1 font-gagalin transition-colors text-alt/90 dark:text-main/90'
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
                  className='text-md mx-1 font-gagalin transition-colors '
                  asChild
                >
                  <Link
                    href={item.href}
                    className={`text-md mx-1 font-gagalin transition-colors ${pathname === item.href
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
          {/* Theme Switch */}
          <ModeToggle />

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
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="text-foreground">Настройки</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="text-foreground">Поръчки</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut()}
                >
                  Изход
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="main" className='text-alt font-gagalin bg-main mr-3' asChild>
              <Link href="/sign-in">Вход</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b bg-background px-4 py-4 lg:hidden">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.disabled ? (
                <span
                  className="py-2 text-muted-foreground font-medium flex items-center cursor-not-allowed opacity-60 select-none"
                  aria-disabled="true"
                  tabIndex={-1}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`block py-2 text-foreground font-medium transition-colors hover:text-primary ${pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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

