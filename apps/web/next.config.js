/* eslint-disable import/order */
const runtimeCaching = require('next-pwa/cache');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
  disableDevLogs: true,
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
/* eslint-enable import/order */

const nextConfig = withPWA({
  output: 'standalone',
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        /**
         * B/C: Trusting Next.js bundle optimization
         * https://nextjs.org/docs/app/building-your-application/optimizing/package-bundling
         */

        // splitChunks: {
        //   chunks: 'all',
        //   maxInitialRequests: 5,
        //   maxAsyncRequests: 10,
        //   minSize: 100000,
        //   maxSize: 300000,
        //   minChunks: 1,
        //   cacheGroups: {
        //     vendor: {
        //       test: /[\\/]node_modules[\\/](react|react-dom|scheduler|@mui)[\\/]/,
        //       name: 'vendor-core',
        //       chunks: 'all',
        //       priority: 40,
        //       enforce: true,
        //       reuseExistingChunk: true,
        //     },
        //     vendors: {
        //       test: /[\\/]node_modules[\\/]/,
        //       name: 'vendors',
        //       chunks: 'all',
        //       priority: 20,
        //       enforce: true,
        //       reuseExistingChunk: true,
        //     },
        //     common: {
        //       test: /[\\/](components|common|features)[\\/]/,
        //       name: 'common',
        //       chunks: 'all',
        //       minChunks: 2,
        //       priority: 30,
        //       reuseExistingChunk: true,
        //     },
        //     analytics: {
        //       test: /[\\/]node_modules[\\/](@google-analytics|mixpanel-browser)[\\/]/,
        //       name: 'analytics',
        //       chunks: 'async',
        //       priority: 10,
        //       reuseExistingChunk: true,
        //     },
        //     styles: {
        //       test: /\.(css|scss|sass)$/,
        //       name: 'styles',
        //       chunks: 'all',
        //       enforce: true,
        //       priority: 50,
        //     },
        //   },
        // },
        minimize: !dev,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jirum-alarm.com',
      },
    ],
    deviceSizes: [320, 375, 414, 600],
    imageSizes: [140, 162, 240, 300, 335, 414, 600],
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: cdn.jirum-alarm.com;",
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: [
      '@google-analytics/analytics',
      'mixpanel-browser',
      '@mui/material',
      '@mui/icons-material',
      'lodash',
      'date-fns',
    ],
    optimisticClientCache: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
});

module.exports = withBundleAnalyzer(nextConfig);
