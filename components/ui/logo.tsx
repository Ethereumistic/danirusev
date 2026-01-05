import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo = ({ className, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-5xl md:text-6xl',
    xl: 'text-6xl md:text-8xl'
  };

  return (
    <div className={cn("font-gagalin", sizeClasses[size], className)}>
      <span className="lg:hidden xl:inline inline text-main font-outline text-nowrap">Dani Rusev 11</span>
      <span className="lg:inline xl:hidden hidden text-main font-outline">DR11</span>
    </div>
  );
};

export default Logo;
