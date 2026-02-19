# Website Performance Optimization Plan

## Project Overview

- **Website:** Dani Rusev 11 - E-commerce for drift experiences
- **Hosting:** Netlify (free plan)
- **Framework:** Next.js
- **Issue:** Slow loading times on landing page

---

## Current Image Usage Analysis

### Landing Page Components with Images

| Component | Image Source | Format | Count | Location |
|-----------|-------------|--------|-------|----------|
| **WhyChooseUsV2** | `cdn.jsdelivr.net` (hardcoded) | .png, .jpg | 22 images | `components/experience/why-choose-us-v2.tsx` |
| **AboutSection** | `cdn.jsdelivr.net` + YouTube API | .png, .jpg | 2 bio + 11 YT | `components/landing/about-section.tsx` |
| **ExperienceSection** | Payload CMS + Supabase | Variable | CMS-driven | `components/experience/experience-section.tsx` |
| **TestimonialsCarousel** | Payload CMS | Variable | CMS-driven | `components/landing/testimonials-carousel.tsx` |
| **Hero** | Local `/hero.mp4` | mp4 | 1 video | `components/hero/hero.tsx` |

## Important: The images inside **ExperienceSection** and **TestimonialsCarousel** are loaded from Payload CMS and Supabase, so they are not hardcoded and can be managed from the CMS BUT they are again pasted as CDN links like all other cdn links!

### Hardcoded CDN Image URLs (why-choose-us-v2.tsx)

```
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/4.jpg
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/bmw.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/2.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/suzuki3.JPG
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/SUZUKI_BACK.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/3.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/event/12.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/event/8.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/day/3.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/day/2.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/whyus/1.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/day/4.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/1.jpg
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/DR11_Shirts.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/reni.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/milena.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/janeta.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/elena.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/ivka.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/rado.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/mascota.png
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/dizel.png
```

### About Section Images

```
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/driver1.jpg
https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/dr-team.png
```

---

## Critical Issues Found

### Issue 1: Missing Next.js Image Optimization for CDN Images

**Problem:** Next.js Image component cannot optimize external CDN images unless a custom loader is configured. All images from `cdn.jsdelivr.net` are served unoptimized.

**Files Affected:**
- `components/experience/why-choose-us-v2.tsx`
- `components/landing/about-section.tsx`

**Current Code:**
```tsx
<Image
    src={image}
    alt={`${title} - ${idx + 1}`}
    fill
    className="object-cover"
/>
```

**Solution:** Configure a custom image loader or move images to `/public` folder.

---

### Issue 2: Missing `sizes` Prop on Images

**Problem:** Without `sizes`, Next.js generates incorrect srcset, often loading images larger than needed.

**Files Affected:**
- `components/experience/why-choose-us-v2.tsx` (lines 124-131)
- `components/landing/about-section.tsx` (lines 213-219, 286-291, 302-308)
- `components/experience/experience-card.tsx` (lines 82-87)

**Solution:** Add appropriate `sizes` prop based on layout.

---

### Issue 3: No Lazy Loading for Below-the-Fold Content

**Problem:** All carousels load immediately. The 22 images in `WhyChooseUsV2` all start loading on page mount, causing heavy initial page weight.

**Files Affected:**
- `components/experience/why-choose-us-v2.tsx`

**Solution:** Implement intersection observer-based lazy loading for carousel components.

---

### Issue 4: Hero Video with `preload="auto"`

**Problem:** Video downloads entirely before playing, blocking other resources.

**File:** `components/hero/hero.tsx` (line 24)

**Current Code:**
```tsx
<video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    ...
>
```

**Solution:** Change to `preload="metadata"` and add a poster image.

---

### Issue 5: YouTube API Call on Every Page Load

**Problem:** `AboutSection` fetches 11 YouTube videos client-side on every landing page visit.

**File:** `components/landing/about-section.tsx` (lines 93-99)

**Current Code:**
```tsx
React.useEffect(() => {
    const fetchVideos = async () => {
        const videos = await getLatestYouTubeVideos('@danirusev11', 11);
        if (videos.length > 0) setYoutubeVideos(videos);
    };
    fetchVideos();
}, []);
```

**Solution:** Move to server-side with caching or use ISR/SSR.

---

### Issue 6: No Blur Placeholders

**Problem:** Images appear with jarring pop-in effect, increasing perceived load time.

**Files Affected:** All components using `next/image`

**Solution:** Generate blur data URLs and use `placeholder="blur"`.

---

## Optimization Tasks

### Task 1: Convert Images to WebP Format

**Priority:** High
**Estimated Impact:** 30-50% smaller image files

**Instructions:**

1. Convert all PNG/JPG images in the CDN repository to WebP format using ImageMagick:

```bash
# Single image conversion
magick convert input.png -quality 80 output.webp

# Batch convert all PNG images
magick mogrify -format webp -quality 80 *.png

# Batch convert all JPG images
magick mogrify -format webp -quality 80 *.jpg
```

2. Update all hardcoded URLs in `why-choose-us-v2.tsx` and `about-section.tsx` to use `.webp` extension instead of `.png`/`.jpg`.

3. For the hero video poster image, create a WebP fallback:
```bash
ffmpeg -i hero.mp4 -ss 00:00:01 -vframes 1 -q:v 2 hero-poster.webp
```

---

### Task 2: Add `sizes` Prop to All Image Components

**Priority:** High
**Estimated Impact:** 20-40% reduction in image bytes loaded

**File:** `components/experience/why-choose-us-v2.tsx`

**Change at line ~125:**
```tsx
// Before
<Image
    src={image}
    alt={`${title} - ${idx + 1}`}
    fill
    className="object-cover"
/>

// After
<Image
    src={image}
    alt={`${title} - ${idx + 1}`}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
/>
```

**File:** `components/landing/about-section.tsx`

**Change bio carousel images at line ~213:**
```tsx
// Before
<Image
    src={image.url}
    alt={image.alt}
    fill
    className="object-cover"
    priority={index === 0}
/>

// After
<Image
    src={image.url}
    alt={image.alt}
    fill
    sizes="(max-width: 1024px) 100vw, 50vw"
    className="object-cover"
    priority={index === 0}
/>
```

**Change YouTube thumbnails at line ~286:**
```tsx
// Before
<Image
    src={video.thumbnail}
    alt={video.title}
    fill
    className="object-cover transition-transform duration-700 group-hover/yt:scale-105"
/>

// After
<Image
    src={video.thumbnail}
    alt={video.title}
    fill
    sizes="(max-width: 1024px) 100vw, 50vw"
    className="object-cover transition-transform duration-700 group-hover/yt:scale-105"
/>
```

**File:** `components/experience/experience-card.tsx`

**Change at line ~82:**
```tsx
// Before
<Image
    src={imageUrl}
    alt={experience.title}
    fill
    className="object-cover transition-transform duration-700 group-hover:scale-110"
/>

// After
<Image
    src={imageUrl}
    alt={experience.title}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover transition-transform duration-700 group-hover:scale-110"
/>
```

---

### Task 3: Implement Lazy Loading for Below-the-Fold Images

**Priority:** High
**Estimated Impact:** 40-60% initial page weight reduction

**File:** `components/experience/why-choose-us-v2.tsx`

**Add a lazy-loading wrapper component:**

```tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
// ... existing imports

// Add this new component before FeatureCarousel
function LazyCarousel({ images, title }: { images: string[]; title: string }) {
    const [shouldLoad, setShouldLoad] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            {shouldLoad ? (
                <FeatureCarouselInner images={images} title={title} />
            ) : (
                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
            )}
        </div>
    );
}

// Rename existing FeatureCarousel to FeatureCarouselInner
function FeatureCarouselInner({ images, title }: { images: string[]; title: string }) {
    // ... existing FeatureCarousel code
}

// Update FeatureSection to use LazyCarousel
function FeatureSection({ feature, index }: { feature: FeatureBlock; index: number }) {
    // ... existing code, but use LazyCarousel instead of FeatureCarousel
    return (
        // ...
        <motion.div ...>
            <LazyCarousel images={feature.images} title={feature.title} />
        </motion.div>
        // ...
    );
}
```

---

### Task 4: Optimize Hero Video

**Priority:** High
**Estimated Impact:** 50-70% reduction in video load time

**File:** `components/hero/hero.tsx`

**Changes:**

1. Change `preload="auto"` to `preload="metadata"` (line 24)

2. Add a poster image attribute:

```tsx
// Before
<video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    disablePictureInPicture
    disableRemotePlayback
    aria-hidden="true"
    className="absolute top-0 left-0 w-full h-full object-cover z-10"
>
    <source src="/hero.mp4" type="video/mp4" />
    Your browser does not support the video tag.
</video>

// After
<video
    autoPlay
    loop
    muted
    playsInline
    preload="metadata"
    poster="/hero-poster.webp"
    disablePictureInPicture
    disableRemotePlayback
    aria-hidden="true"
    className="absolute top-0 left-0 w-full h-full object-cover z-10"
>
    <source src="/hero.mp4" type="video/mp4" />
    Your browser does not support the video tag.
</video>
```

3. Create the poster image and compress the video:

```bash
# Create poster from first frame
ffmpeg -i public/hero.mp4 -ss 00:00:00 -vframes 1 -q:v 2 public/hero-poster.webp

# Compress video (optional, if video is large)
ffmpeg -i public/hero.mp4 -c:v libx264 -crf 28 -preset slow -movflags +faststart public/hero-optimized.mp4

# Replace original if compressed version is good
mv public/hero-optimized.mp4 public/hero.mp4
```

---

### Task 5: Cache YouTube API Results

**Priority:** Medium
**Estimated Impact:** Eliminates repeated client API calls

**Option A: Server-Side Fetching (Recommended)**

Create a new server component:

**File:** `components/landing/youtube-section-server.tsx`

```tsx
import { getLatestYouTubeVideos, type YouTubeVideo } from '@/lib/youtube';

// Cache for 1 hour (in-memory for serverless)
let cache: { data: YouTubeVideo[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getYouTubeVideosCached() {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache.data;
    }
    
    const videos = await getLatestYouTubeVideos('@danirusev11', 11);
    cache = { data: videos, timestamp: Date.now() };
    return videos;
}

export async function YouTubeSectionServer() {
    const videos = await getYouTubeVideosCached();
    
    if (!videos.length) return null;
    
    return <YouTubeCarouselClient videos={videos} />;
}
```

**Option B: Move to lib with caching**

**File:** `lib/youtube-cached.ts`

```ts
import { getLatestYouTubeVideos, type YouTubeVideo } from './youtube';

let cache: { data: YouTubeVideo[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getLatestYouTubeVideosCached(
    channelId: string,
    maxResults: number
): Promise<YouTubeVideo[]> {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache.data;
    }
    
    const videos = await getLatestYouTubeVideos(channelId, maxResults);
    cache = { data: videos, timestamp: Date.now() };
    return videos;
}
```

Then update `about-section.tsx` to use the cached version.

---

### Task 6: Add Blur Placeholders

**Priority:** Medium
**Estimated Impact:** Improved perceived performance

**For static images in `/public`:**

```tsx
<Image
    src="/image.webp"
    alt="Description"
    fill
    placeholder="blur"
    blurDataURL="data:image/webp;base64,UklGRjAAAABXQVZFZm10IBAAAA..."
    sizes="..."
/>
```

**For dynamic/CDN images, create a shimmer placeholder:**

```tsx
// components/ui/image-with-shimmer.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithShimmerProps {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
}

export function ImageWithShimmer({
    src,
    alt,
    fill,
    sizes,
    className,
    priority
}: ImageWithShimmerProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse rounded-2xl" />
            )}
            <Image
                src={src}
                alt={alt}
                fill={fill}
                sizes={sizes}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                priority={priority}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
```

---

### Task 7: Configure Netlify Headers

**Priority:** Low
**Estimated Impact:** Better caching

**File:** `netlify.toml` (create if doesn't exist)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/*.mp4"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_next/image/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Task 8: Use Netlify Image CDN (Optional)

**Priority:** Low
**Estimated Impact:** Automatic image optimization for all images

Netlify offers image transformation on all plans. Update image URLs to use Netlify's image CDN:

```tsx
// For images from CDN, proxy through Netlify
const netlifyImageLoader = ({ src, width, quality }: {
    src: string;
    width: number;
    quality?: number;
}) => {
    // If already on Netlify domain, use Netlify's image CDN
    return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 80}&fm=webp`;
};

// In next.config.ts
const nextConfig: NextConfig = {
    images: {
        loader: 'custom',
        loaderFile: './netlify-image-loader.ts',
        // Keep existing remotePatterns
        remotePatterns: [
            // ... existing patterns
        ],
    },
    // ... rest of config
};
```

**File:** `netlify-image-loader.ts` (create in project root)

```ts
export default function netlifyImageLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}): string {
    // Local images - let Next.js handle via Netlify
    if (src.startsWith('/')) {
        return `/.netlify/images?url=${src}&w=${width}&q=${quality || 80}&fm=webp`;
    }
    
    // External images - proxy through Netlify
    return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 80}&fm=webp`;
}
```

---

## Implementation Priority

### Phase 1: Quick Wins (High Impact, Low Effort)

1. ✅ Add `sizes` prop to all Image components (Task 2)
2. ✅ Change hero video `preload` to `metadata` + add poster (Task 4)
3. ✅ Add Netlify cache headers (Task 7)

### Phase 2: Image Optimization (Medium Effort)

4. ✅ Convert all images to WebP format (Task 1)
5. ✅ Add blur placeholders / shimmer effect (Task 6)
6. ✅ Implement lazy loading for below-fold carousels (Task 3)

### Phase 3: Advanced Optimization (Higher Effort)

7. ✅ Cache YouTube API results (Task 5)
8. ✅ Configure Netlify Image CDN (Task 8)

---

## Files to Modify

| File | Tasks |
|------|-------|
| `components/experience/why-choose-us-v2.tsx` | Task 1, 2, 3 |
| `components/landing/about-section.tsx` | Task 1, 2, 5 |
| `components/experience/experience-card.tsx` | Task 2 |
| `components/hero/hero.tsx` | Task 4 |
| `next.config.ts` | Task 8 |
| `netlify.toml` | Task 7 |
| `netlify-image-loader.ts` (new) | Task 8 |
| `lib/youtube-cached.ts` (new) | Task 5 |
| `public/hero-poster.webp` (new) | Task 4 |

---

## Estimated Total Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial page weight | ~5-10 MB | ~1-2 MB | 60-80% reduction |
| LCP (Largest Contentful Paint) | ~4-6s | ~1.5-2.5s | 50-60% faster |
| Total image bytes | ~3-5 MB | ~0.5-1 MB | 70-80% reduction |
| Video initial load | Full video | Metadata only | 90%+ reduction |

---

## Testing

After implementing changes, test with:

1. **Lighthouse** (Chrome DevTools)
   - Target: Performance score > 85
   - Target: LCP < 2.5s

2. **WebPageTest.org**
   - Test from multiple locations
   - Check waterfall for image loading order

3. **Chrome DevTools Network Tab**
   - Verify images are loading in WebP format
   - Verify video is not blocking initial load
   - Check lazy loading is working (images load on scroll)

---

## Notes

- The CDN images (`cdn.jsdelivr.net`) are the biggest bottleneck because Next.js cannot optimize them without a custom loader
- Consider migrating images to Supabase Storage (already configured) to leverage their image transformation API
- The YouTube API call should ideally be moved to server-side to avoid client-side waterfalls
- Netlify's free tier has bandwidth limits; image optimization will help stay within those limits
