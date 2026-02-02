import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developers.mypos.com https://mypos.com https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://mypos.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://mypos.com",
              "connect-src 'self' https://developers.mypos.com https://mypos.com https://*.mypos.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://mypos.com https://www.google.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig

