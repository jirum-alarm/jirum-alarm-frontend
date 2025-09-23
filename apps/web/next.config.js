/* eslint-disable @typescript-eslint/no-require-imports */

const withPWA = require('next-pwa')({
  dest: 'public',
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
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jirum-alarm.com',
      },
    ],
    deviceSizes: [375, 480, 640, 768, 1024, 1280],
    imageSizes: [16, 120, 192, 252],
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
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
