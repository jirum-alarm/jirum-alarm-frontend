/* eslint-disable @typescript-eslint/no-require-imports */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
  disableDevLogs: true,
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  output: 'standalone',
  httpAgentOptions: {
    keepAlive: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'max-image-preview:large' }],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/(fonts|images|icons)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  productionBrowserSourceMaps: false,
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/webp', 'image/avif'],
    // Product thumbnails are displayed at 120, 160, 192, 252px.
    // Adding these sizes prevents Next.js from over-serving larger variants (e.g., 384→320, 640→550).
    imageSizes: [120, 160, 192, 256, 320, 384, 420, 550],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jirum-alarm.com',
      },
    ],
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: cdn.jirum-alarm.com;",
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
});

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'jirumalarm',
  project: 'jirum-alarm-frontend-prod',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: false,
});
