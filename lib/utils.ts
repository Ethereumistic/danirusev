import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves the site URL with proper fallbacks
 */
export function getSiteUrl() {
  // If we're on the client, window.location.origin is the absolute source of truth
  if (typeof window !== 'undefined') {
    // If we're on localhost in the browser, it's fine to return localhost
    return window.location.origin.replace(/\/$/, '');
  }

  // On the server, we must be extremely careful to avoid localhost:3000
  // 1. Check NEXT_PUBLIC_SITE_URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Default to production domain
  // We only allow localhost if we are EXPLICITLY in a local development environment
  // and even then, we prefer the production domain for safety in Server Actions
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && envUrl?.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }

  return 'https://danirusev.com';
}




/**
 * Formats a price in BGN for dual currency display (Bulgarian Law transition)
 * Automatically returns null after August 9th, 2026
 */
export function formatBGN(eurPrice: number): string | null {
  const transitionEndDate = new Date('2026-08-09');
  const today = new Date();

  if (today > transitionEndDate) return null;

  return (eurPrice * 1.95583).toFixed(2);
}

export function getTextFromRichText(richText: any): string {
  if (!richText || !Array.isArray(richText)) {
    return '';
  }

  return richText
    .map((node) => {
      if (node.type === 'text') {
        return node.text || '';
      } else if (node.children && Array.isArray(node.children)) {
        return getTextFromRichText(node.children);
      }
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Ensures we're using the correct URL for media
 * If it's a Supabase URL, use it directly
 * If it's an API URL, transform it to use the Supabase URL if possible
 */
export function getMediaUrl(url: string | undefined): string {
  if (!url) return '';

  // If it's already a Supabase URL, use it
  if (url.includes('supabase.co')) {
    return url;
  }

  // Check if it's an API URL that needs to be transformed
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'mediabucket';

  if (supabaseUrl && url.includes('/api/media/')) {
    // Extract the filename from the URL
    const filename = url.split('/').pop();
    if (filename) {
      return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/media/${filename}`;
    }
  }

  // Return the original URL if we can't transform it
  return url;
}

import {
  CarTaxiFront,
  Car,
  Gauge,
  PartyPopper,
  Shirt,
  Flag,
  Smartphone,
  Video,
  Disc,
  Gift,
  Clock,
  MapPin,
  type LucideIcon
} from 'lucide-react'
import * as LucideIcons from "lucide-react"

/**
 * Drift Experience Theme Color Utilities
 * Centralized functions to get theme-based CSS classes for consistent styling across components
 */
export type ThemeColor = 'taxi' | 'rent' | 'mix' | 'event' | 'day' | 'main';

/**
 * Maps experience titles to their corresponding theme colors
 */
export function getExperienceThemeColor(title: string): ThemeColor {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('такси') || lowerTitle.includes('taxi')) return 'taxi'
  if (lowerTitle.includes('наеми') || lowerTitle.includes('rent')) return 'rent'
  if (lowerTitle.includes('микс') || lowerTitle.includes('mix')) return 'mix'
  if (lowerTitle.includes('събитие') || lowerTitle.includes('event')) return 'event'
  if (lowerTitle.includes('ден') || lowerTitle.includes('day')) return 'day'
  return 'main'
}

/**
 * Get the appropriate thumbnail image for an experience based on its theme
 */
export function getExperienceThumbnail(themeColor: ThemeColor): string {
  switch (themeColor) {
    case 'taxi': return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/0.png'
    case 'rent': return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/1.png'
    case 'mix': return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/2.png'
    case 'event': return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/event/1.png' // Fallback for event
    case 'day': return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/day/1.png' // Fallback for event
    default: return 'https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/0.png'
  }
}

/**
 * Get the appropriate icon for an experience based on its theme
 */
export function getExperienceIcon(themeColor: ThemeColor) {
  switch (themeColor) {
    case 'taxi': return CarTaxiFront
    case 'rent': return Car
    case 'mix': return Gauge
    case 'event': return PartyPopper
    case 'day': return Flag
    default: return Shirt
  }
}

/**
 * Get border color class based on theme
 */
export function getBorderColor(themeColor?: ThemeColor): string {
  if (themeColor === 'taxi') return 'border-taxi';
  if (themeColor === 'rent') return 'border-rent';
  if (themeColor === 'mix') return 'border-mix';
  if (themeColor === 'event') return 'border-event';
  if (themeColor === 'day') return 'border-day';
  return 'border-main';
}

/**
 * Get text color class based on theme
 */
export function getTextColor(themeColor?: ThemeColor): string {
  if (themeColor === 'taxi') return 'text-taxi';
  if (themeColor === 'rent') return 'text-rent';
  if (themeColor === 'mix') return 'text-mix';
  if (themeColor === 'event') return 'text-event';
  if (themeColor === 'day') return 'text-day';
  return 'text-main';
}

/**
 * Get background color class based on theme
 */
export function getBgColor(themeColor?: ThemeColor): string {
  if (themeColor === 'taxi') return 'bg-taxi';
  if (themeColor === 'rent') return 'bg-rent';
  if (themeColor === 'mix') return 'bg-mix';
  if (themeColor === 'event') return 'bg-event';
  if (themeColor === 'day') return 'bg-day';
  return 'bg-main';
}

/**
 * Get border style class based on theme
 * taxi: dashed, rent: double, mix: dotted
 */
export function getBorderStyle(themeColor?: ThemeColor): string {
  if (themeColor === 'taxi') return 'border-dashed';
  if (themeColor === 'rent') return 'border-double';
  if (themeColor === 'mix') return 'border-dotted';
  if (themeColor === 'event') return 'border-solid';
  if (themeColor === 'day') return 'border-dotted';
  return 'border-solid';
}

/**
 * Get all theme-based classes at once
 * Returns an object with text, border, bg color, and border style classes
 */
export function getDriftThemeClasses(themeColor: ThemeColor = 'main') {
  return {
    text: getTextColor(themeColor),
    border: getBorderColor(themeColor),
    bg: getBgColor(themeColor),
    borderStyle: getBorderStyle(themeColor),
    bgFaded: themeColor === 'taxi' ? 'bg-taxi/10' :
      themeColor === 'rent' ? 'bg-rent/10' :
        themeColor === 'mix' ? 'bg-mix/10' :
          themeColor === 'day' ? 'bg-day/10' :
            themeColor === 'event' ? 'bg-event/10' : 'bg-main/10',
    borderFaded: themeColor === 'taxi' ? 'border-taxi/30' :
      themeColor === 'rent' ? 'border-rent/30' :
        themeColor === 'mix' ? 'border-mix/30' :
          themeColor === 'day' ? 'border-day/30' :
            themeColor === 'event' ? 'border-event/30' : 'border-main/30',
    shadow: themeColor === 'taxi' ? 'shadow-[0_0_30px_-8px] shadow-taxi/40' :
      themeColor === 'rent' ? 'shadow-[0_0_30px_-8px] shadow-rent/40' :
        themeColor === 'mix' ? 'shadow-[0_0_30px_-8px] shadow-mix/40' :
          themeColor === 'event' ? 'shadow-[0_0_30px_-8px] shadow-white/20' :
            themeColor === 'day' ? 'shadow-[0_0_30px_-8px] shadow-day/40' :
              'shadow-[0_0_30px_-8px] shadow-main/40',
    gradient: themeColor === 'taxi' ? 'from-taxi/5 via-transparent to-transparent' :
      themeColor === 'rent' ? 'from-rent/5 via-transparent to-transparent' :
        themeColor === 'mix' ? 'from-mix/5 via-transparent to-transparent' :
          themeColor === 'event' ? 'from-event/5 via-transparent to-transparent' :
            themeColor === 'day' ? 'from-day/5 via-transparent to-transparent' :
              'from-main/5 via-transparent to-transparent',
  };
}

/**
 * Get normalized RGB values for PDF-LIB based on theme color
 * [r, g, b] where each value is 0.0 to 1.0
 */
export function getThemeRGB(themeColor: ThemeColor): [number, number, number] {
  switch (themeColor) {
    case 'taxi':
      return [255 / 255, 193 / 255, 6 / 255]; // rgb(255, 193, 6)
    case 'mix':
      return [208 / 255, 246 / 255, 26 / 255]; // rgb(208, 246, 26)
    case 'rent':
      return [57 / 255, 182 / 255, 255 / 255]; // rgb(57, 182, 255)
    case 'day':
      return [151 / 255, 87 / 255, 158 / 255]; // rgb(151, 87, 158)
    case 'event':
      return [251 / 255, 54 / 255, 64 / 255]; // rgb(251, 54, 64)
    default:
      return [208 / 255, 246 / 255, 26 / 255]; // Default to mix/main neon
  }
}
/**
 * Smart Addon Icon Mapping
 * Centralized logic to determine the best icon for an addon based on its name, icon name from CMS, and type.
 */
export function getAddonIcon(name: string, iconName?: string, type?: string): LucideIcon | null {
  const lowerName = name.toLowerCase();

  // 1. Priority mapping based on specific keywords in name (Highest priority)
  if (lowerName.includes('дигитален') || iconName === 'Smartphone') return Smartphone;
  if (lowerName.includes('gopro') || lowerName.includes('заснемане') || lowerName.includes('видео') || iconName === 'Video') return Video;
  if (lowerName.includes('гуми') || iconName === 'Disc') return Disc;

  // 2. Mapping based on Explicit Type
  if (type === 'voucher') return Gift;
  if (type === 'duration') return Clock;

  // 3. Mapping based on Lucide Icon Name from CMS
  if (iconName) {
    const Icon = (LucideIcons as any)[iconName];
    if (Icon) return Icon;
  }

  // 4. Broad keyword fallback
  if (lowerName.includes('ваучер') || lowerName.includes('voucher')) return Gift;
  if (lowerName.includes('време') || lowerName.includes('минути') || lowerName.includes('час')) return Clock;
  if (lowerName.includes('локация') || lowerName.includes('писта')) return MapPin;

  return null;
}

/**
 * Premium Legal Content Styles
 * Centralized Typography for Legal Pages (Terms, Privacy, Cookies)
 * Uses Tailwind v4 child selectors to ensure consistent styling without external plugins.
 */
export const LEGAL_PROSE_CLASSES = cn(
  "relative z-10",
  // H2 Styles: Large, Neon, Italic, with a decorative glow line
  "[&_h2]:text-2xl [&_h2]:sm:text-4xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:italic [&_h2]:tracking-tighter",
  "[&_h2]:text-alt dark:[&_h2]:text-main [&_h2]:mt-20 [&_h2]:mb-10 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-4",
  "[&_h2]:before:content-[''] [&_h2]:before:w-2 [&_h2]:before:h-10 [&_h2]:before:bg-main [&_h2]:before:rounded-full [&_h2]:before:shadow-[0_0_20px_rgba(208,246,26,0.6)]",

  // H3 Styles: Slightly smaller, bold
  "[&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-black [&_h3]:uppercase [&_h3]:italic [&_h3]:tracking-tighter",
  "[&_h3]:text-white [&_h3]:mt-12 [&_h3]:mb-6",

  // Paragraph Styles: Readable, spaced, slate colors
  "[&_p]:text-slate-600 dark:[&_p]:text-slate-400 [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-base sm:[&_p]:text-lg [&_p]:font-medium",

  // Strong/Bold: High contrast
  "[&_strong]:text-foreground dark:[&_strong]:text-white [&_strong]:font-black [&_strong]:italic",

  // List Styles: Custom neon markers
  "[&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-4 [&_ul]:mb-10",
  "[&_li]:relative [&_li]:pl-10 [&_li]:text-slate-600 dark:[&_li]:text-slate-400 [&_li]:text-base sm:[&_li]:text-lg",
  "[&_li]:before:content-['→'] [&_li]:before:absolute [&_li]:before:left-2 [&_li]:before:text-main [&_li]:before:font-black [&_li]:before:text-xl",

  // Link Styles: Animated, neon underline
  "[&_a]:text-main [&_a]:font-black [&_a]:italic [&_a]:uppercase [&_a]:tracking-tighter [&_a]:transition-all",
  "[&_a]:border-b-2 [&_a]:border-main/20 hover:[&_a]:border-main hover:[&_a]:shadow-[0_5px_15px_-5px_rgba(208,246,26,0.4)]",

  // Blockquote Styles: Ghostly background with neon accent
  "[&_blockquote]:border-l-4 [&_blockquote]:border-main [&_blockquote]:bg-main/5 [&_blockquote]:py-8 [&_blockquote]:px-10 [&_blockquote]:rounded-2xl [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_blockquote]:my-12 [&_blockquote]:shadow-inner [&_blockquote]:relative",
  "[&_blockquote]:after:content-['\"'] [&_blockquote]:after:absolute [&_blockquote]:after:top-2 [&_blockquote]:after:right-6 [&_blockquote]:after:text-6xl [&_blockquote]:after:text-main/10 [&_blockquote]:after:font-black",

  // Spacing & Smooth Transitions
  "mb-24 transition-all duration-300"
);
