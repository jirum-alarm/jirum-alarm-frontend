const runtimeCaching = require('next-pwa/cache');
const { withSentryConfig } = require('@sentry/nextjs');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
  disableDevLogs: true,
});

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: 'jirumalarm',
  project:
    process.env.VERCEL_ENV === 'production'
      ? 'jirum-alarm-frontend-prod'
      : 'jirum-alarm-frontend-dev',
  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

const sentryBuildTimeConfigOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers. (increases server load)
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

const nextConfig = withPWA({
  output: 'standalone',
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
            commons: {
              test: /[\\/]common[\\/]/,
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
            },
            fonts: {
              test: /[\\/]fonts[\\/]/,
              name: 'fonts',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },
  images: {
    minimumCacheTTL: 3 * 24 * 60 * 60,
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jirum-alarm.com',
      },
      {
        protocol: 'https',
        hostname: 's3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
});

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
