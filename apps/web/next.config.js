const runtimeCaching = require('next-pwa/cache');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
  disableDevLogs: true,
});

const nextConfig = withPWA({
  output: 'standalone',
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 10,
          maxAsyncRequests: 20,
          minSize: 40000,
          maxSize: 244000,
          minChunks: 1,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
              priority: -10,
              reuseExistingChunk: true,
            },
            commons: {
              test: /[\\/]common[\\/]/,
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            analytics: {
              test: /[\\/]node_modules[\\/](@google-analytics|mixpanel-browser)[\\/]/,
              name: 'analytics',
              chunks: 'async',
              priority: 5,
              reuseExistingChunk: true,
            },
            styles: {
              test: /\.(css|scss|sass)$/,
              name: 'styles',
              chunks: 'all',
              enforce: true,
              priority: 40,
            },
            critical: {
              test: /[\\/](components|pages|features)[\\/]/,
              name: 'critical',
              chunks: 'all',
              priority: 50,
              enforce: true,
            },
          },
        },
        minimize: !dev,
      };
    }

    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },
  images: {
    domains: ['cdn.jirum-alarm.com'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 64, 96, 128],
    formats: ['image/webp', 'image/avif'],
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

module.exports = nextConfig;
