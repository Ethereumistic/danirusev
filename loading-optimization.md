Loading Optimization Plan for Experience Detail Page
Problem Statement
When a user clicks on an Experience Card from the Experience Section, there is:
1. Zero visual feedback - No indication that navigation has started
2. Slow perceived loading - Blank/white flash while waiting for server data
3. No prefetching guarantee - Uncertain if Next.js prefetch is working optimally
The delay is primarily caused by:
- Server-side data fetching via getProductBySlug() from Payload CMS
- No loading.tsx file exists for the dynamic route [slug]
- The entire page must wait for the CMS response before rendering anything
---
Current Architecture Analysis
Page Structure (app/(frontend)/experience/[slug]/page.tsx)
├── Back Button (Link to /#drift-experiences)
├── Header (Icon + Title)
├── Main Grid (2 columns on lg)
│   ├── LEFT COLUMN (sticky)
│   │   ├── ExperienceGallery (carousel + thumbnails)
│   │   └── ExperienceStatsGrid (4 stat cards)
│   └── RIGHT COLUMN
│       ├── Quote/Description Card
│       ├── ExperienceScrollableTabs
│       │   ├── Program Section (timeline)
│       │   ├── Included Section (2 cards grid)
│       │   └── Additional Items Section (interactive)
│       └── ExperienceBookingSidebar (price, addons, cart)
└── Other Experiences Section (Suspense wrapped)
Data Flow
1. User clicks ExperienceCard → Next.js router initiates navigation
2. Server component page.tsx calls getProductBySlug(slug)
3. Payload CMS query executes (network latency + DB query)
4. Page renders with data
5. Client hydration occurs
Current Missing Pieces
- ❌ No loading.tsx for instant skeleton display
- ❌ No button loading state
- ❌ Prefetching not explicitly verified
---
Recommended Solution: Multi-Layered Approach
Layer 1: loading.tsx Skeleton Page (CRITICAL - Highest Impact)
Impact: ⭐⭐⭐⭐⭐ | Effort: Medium | Perceived Speed Improvement: 80-90%
Create a pixel-perfect skeleton at app/(frontend)/experience/[slug]/loading.tsx that matches the exact layout of the actual page. This leverages Next.js 14's streaming and Suspense boundaries.
Why this works:
- Next.js automatically shows loading.tsx while the server component fetches data
- Users perceive the page as "loaded" immediately
- Skeletons reduce perceived wait time by 50-80% according to UX research
- No JavaScript needed - it's just a static component
Implementation Details:
The skeleton must match these sections precisely:
1. Back Button Skeleton
   - Button with arrow icon skeleton
   
2. Header Skeleton
   - Icon box skeleton (p-4, rounded-2xl, border)
   - Title skeleton (text-4xl/5xl/6xl responsive)
3. Main Content Grid Skeleton
   3a. LEFT COLUMN (lg:col-span-5, sticky)
       - Gallery Skeleton
         - Main carousel skeleton (aspect-square, rounded-xl)
         - 4 thumbnail skeletons (grid-cols-4)
       - Stats Grid Skeleton
         - 4 stat card skeletons (grid-cols-2 md:grid-cols-4)
   
   3b. RIGHT COLUMN (lg:col-span-5)
       - Quote/Description Card Skeleton
         - Large text skeleton with quote icon
       - Tabs Navigation Skeleton
         - 3 tab button skeletons
       - Program Timeline Skeleton
         - 3-4 timeline item skeletons
       - Included Grid Skeleton
         - 2 card skeletons side by side
       - Additional Items Skeleton
         - 2-3 item card skeletons
         - Calendar skeleton
       - Booking Sidebar Skeleton
         - Card header skeleton
         - Price display skeleton
         - Button skeleton
         - Payment info skeleton
4. Other Experiences Section
   - Already has ExperienceSectionSkeleton component
Layer 2: Button Loading State (Nice to Have)
Impact: ⭐⭐ | Effort: Low | User Feedback: Immediate
Add a subtle loading indicator to the ExperienceCard button when clicked.
Recommended Approach: Use useTransition with a subtle opacity change
// In experience-card.tsx
const [isPending, startTransition] = useTransition()
// Button gets a subtle visual change
<Button className={cn(
  "transition-opacity",
  isPending && "opacity-70 cursor-wait"
)}>
  {isPending ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    "Виж Повече"
  )}
</Button>
Why subtle over spinner:
- With loading.tsx in place, the transition happens so fast that a spinner feels jarring
- A subtle opacity change confirms the click without being distracting
- If the skeleton is pixel-perfect, users won't even notice the loading state
Layer 3: Prefetch Verification (Ensuring Reliability)
Impact: ⭐⭐⭐ | Effort: Low | Reliability Improvement
Next.js Link component already prefetches routes when they enter the viewport (in production). We need to verify this is working and potentially add explicit prefetch on hover.
Verification Steps:
1. Check Network tab in DevTools - should see prefetch requests
2. Build and run production build (pnpm build && pnpm start)
3. Verify Link has prefetch={true} (default) or explicitly set it
Optional Enhancement: Explicit hover prefetch
// In experience-card.tsx - add onMouseEnter handler
<Link 
  href={`${linkPrefix}/${experience.slug}`}
  prefetch={true}  // Explicit, though default
  onMouseEnter={() => {
    // Next.js handles this automatically, but we can be explicit
    router.prefetch(`${linkPrefix}/${experience.slug}`)
  }}
>
---
Implementation Checklist
Phase 1: Create Skeleton Components
- [ ] Create components/experience/experience-detail-skeleton.tsx
  - [ ] ExperienceDetailSkeleton - main container
  - [ ] ExperienceGallerySkeleton - carousel + thumbnails
  - [ ] ExperienceStatsGridSkeleton - 4 stat cards
  - [ ] ExperienceQuoteSkeleton - description card
  - [ ] ExperienceTabsSkeleton - sticky tabs + content sections
  - [ ] ExperienceBookingSkeleton - sidebar card
Phase 2: Create loading.tsx
- [ ] Create app/(frontend)/experience/[slug]/loading.tsx
  - [ ] Import and use ExperienceDetailSkeleton
  - [ ] Wrap with same container classes as actual page
  - [ ] Add back button skeleton
Phase 3: Button Loading State
- [ ] Update experience-card.tsx
  - [ ] Add useTransition hook
  - [ ] Add subtle loading state to button
  - [ ] Keep transition subtle (opacity, not full spinner)
Phase 4: Prefetch Verification
- [ ] Build production bundle
- [ ] Test prefetch behavior in Network tab
- [ ] Optionally add explicit prefetch on hover
---
File Structure After Implementation
app/(frontend)/experience/[slug]/
├── page.tsx                    # Existing
├── loading.tsx                 # NEW - Skeleton loading state
└── not-found.tsx               # (if exists)
components/experience/
├── experience-detail-skeleton.tsx  # NEW - All skeleton components
├── experience-card.tsx             # MODIFIED - Button loading state
├── experience-card-skeleton.tsx    # Existing - Card skeleton for section
├── experience-section-skeleton.tsx # Existing - Section skeleton
└── ... (other components)
---
Verification Plan
1. Development Testing
pnpm dev
# Navigate to landing page
# Click on experience card
# Verify skeleton appears immediately
2. Production Testing
pnpm build
pnpm start
# Open DevTools Network tab
# Scroll to Experience Section
# Verify prefetch requests appear
# Click card - verify instant skeleton + fast transition
3. Lighthouse Performance
- Run Lighthouse before and after
- Target: LCP improvement of 30-50%
- Target: TBT (Total Blocking Time) reduction
4. Network Waterfall Analysis
- Verify no blocking requests
- Verify prefetch happens before click
- Verify skeleton loads instantly
---
Expected Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Perceived load time | 1-3s blank | <100ms skeleton | 90%+ |
| User feedback delay | None | Instant | ∞ |
| LCP | ~2-4s | ~1-2s | 40-50% |
| Visual stability | Jarring pop-in | Smooth transition | Better UX |
---
Notes
- The skeleton approach is the most impactful single change
- Button loading state is secondary since skeleton makes it nearly instant
- Prefetching is already working in Next.js by default - just verify
- Consider adding loading.tsx to other dynamic routes for consistency
---
Do you want me to proceed with implementing this plan? I'll:
1. Create the loading-optimization.md file with this content
2. Then implement all the changes described