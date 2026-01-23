# SEO Improvement Plan for danirusev.com

Based on the analysis of your codebase, here is why your website is being outranked by your own Facebook page and how to fix it.

## 1. The "Big" Technical Issues (The "Why")

### A. Missing Dynamic Metadata
Currently, your experience detail pages (like `/experience/drift-taxi`) do **not** have unique titles or descriptions in the code.
*   **Problem:** Google sees the same title ("Dani Rusev 11") for almost every page.
*   **Impact:** Google thinks your site is just one page with background noise, so it prefers the Facebook page which has very specific post titles.
*   **Fix:** Implement `generateMetadata` in `app/(frontend)/experience/[slug]/page.tsx` to pull the title and description from Payload CMS.

### B. Weak Homepage Title
Your homepage title is currently set to "Начало" (Home).
*   **Problem:** Nobody searches for "Начало". They search for "Дрифт преживявания" or "Дани Русев".
*   **Fix:** Change the homepage title to "Dani Rusev 11 | Екстремни Дрифт и Рали Преживявания в България".

### C. Missing Structured Data (Schema.org)
You have a `ProductSchema` component, but it is **not being used** on the experience detail page.
*   **Problem:** Google doesn't "understand" that your pages are products/services for sale.
*   **Impact:** You don't get the "Price", "Availability", or "Rating" stars in search results, which makes people click on Facebook instead.
*   **Fix:** Inject `ExperienceSchema` and `BreadcrumbSchema` into the detail page.

## 2. Step-by-Step Action Plan

### Step 1: Fix Dynamic Metadata
You need to add a `generateMetadata` function to the experience page. This will allow each experience to have a title like "Drift Taxi | Dani Rusev 11" instead of just "Dani Rusev 11".

### Step 2: Implement Structured Data
Add the `ExperienceSchema` and `BreadcrumbSchema` components to the bottom of your experience page. This tells Google exactly what the price is and where the page sits in your site structure.

### Step 3: Google Search Console (CRITICAL)
Your `lib/seo.ts` shows that you haven't added your Google verification code yet.
1.  Go to [Google Search Console](https://search.google.com/search-console).
2.  Ad your domain `danirusev.com`.
3.  Get the "HTML Tag" or "DNS record" verification.
4.  Add the code to `lib/seo.ts` under the `verification` key.
5.  **Submit your sitemap:** Paste `https://danirusev.com/sitemap.xml` into the Sitemaps section.

### Step 4: Outranking Facebook (The "Authority Transfer")
Facebook ranks #1 because it has massive "Authority". You need to "steal" some of that authority for your website:
1.  **FB Link:** Update the "About" section of the Dani Rusev Facebook page. Make sure the website link is prominent.
2.  **Deep Linking:** When posting on FB, don't just link to the home page. Link directly to the specific experience pages.
3.  **Google Business Profile:** If you haven't already, create a Google Business Profile for "Dani Rusev 11". Link it to your website. This will often show up in a "Map Pack" above all search results.

## 3. Recommended Keywords to Target
Instead of just "Dani Rusev", your pages should focus on these high-traffic Bulgarian keywords:
*   `дрифт преживяване` (drift experience)
*   `подарък за мъж` (gift for man)
*   `ваучер за преживяване` (experience voucher)
*   `каране на писта` (track driving)
*   `рали обучение` (rally training)

## 4. Content Checklist for Every Experience
To beat Facebook's "rich" content, your website pages must have:
*   **At least 300 words of text:** Facebook posts are short; the website should be the "Authorized Source" with detailed programs.
*   **Alt Text on Images:** Ensure every image has an `alt` tag (e.g., "Дани Русев дрифт такси на писта Дракон").
*   **Internal Links:** Link between experiences (e.g., "If you liked Drift Taxi, check out our Rally School").

## Summary of Files to Modify (for the next AI/Developer):
1.  `app/(frontend)/experience/[slug]/page.tsx` -> Add `generateMetadata`.
2.  `app/(frontend)/experience/[slug]/page.tsx` -> Inject `ExperienceSchema`.
3.  `app/(frontend)/page.tsx` -> Change title from "Начало" to something keyword-rich.
4.  `lib/seo.ts` -> Add Google Verification ID.
5.  `components/experience/index.ts` -> Export the schema components if they aren't already.

**Note:** Once these changes are live, use the "URL Inspection" tool in Google Search Console to click "Request Indexing" for your main pages. This will force Google to look at the new data immediately rather than waiting weeks.
