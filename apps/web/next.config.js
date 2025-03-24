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
          maxInitialRequests: 5,
          maxAsyncRequests: 10,
          minSize: 100000,
          maxSize: 300000,
          minChunks: 1,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|@mui)[\\/]/,
              name: 'vendor-core',
              chunks: 'all',
              priority: 40,
              enforce: true,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
              enforce: true,
              reuseExistingChunk: true,
            },
            common: {
              test: /[\\/](components|common|features)[\\/]/,
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 30,
              reuseExistingChunk: true,
            },
            analytics: {
              test: /[\\/]node_modules[\\/](@google-analytics|mixpanel-browser)[\\/]/,
              name: 'analytics',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            styles: {
              test: /\.(css|scss|sass)$/,
              name: 'styles',
              chunks: 'all',
              enforce: true,
              priority: 50,
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
    deviceSizes: [640, 750],
    imageSizes: [16, 32, 64],
    minimumCacheTTL: 31536000,
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
