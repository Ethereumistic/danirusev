import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ADDED: Optimize package imports to reduce JS bundle
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
    ],
  },

  // ADDED: Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    // ADDED: Limit device sizes to reduce generated image variants
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developers.mypos.com  https://mypos.com  https://www.google.com  https://www.gstatic.com ",
              "style-src 'self' 'unsafe-inline' https://mypos.com ",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://mypos.com ",
              "connect-src 'self' https://developers.mypos.com  https://mypos.com  https://*.mypos.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://mypos.com  https://www.google.com ",
              "frame-ancestors 'self'",
              "media-src 'self' https://cdn.jsdelivr.net ",
            ].join('; '),
          },
          // ADDED: Allow bfcache by using must-revalidate instead of no-store
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // ADDED: Aggressive caching for static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ADDED: Cache optimized images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig