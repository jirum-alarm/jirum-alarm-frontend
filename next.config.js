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
  /**
   * @Note 사용량이 많아지는 것 같아 임시 비활성화
   * */
  // tunnelRoute: '/monitoring',

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
  async rewrites() {
    return [
      {
        destination: 'https://jirum-api.kyojs.com/:path*',
        source: '/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/graphql',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  sentry: sentryBuildTimeConfigOptions,
  images: {
    // 1year
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file.jirum-alarm.com',
      },
      {
        protocol: 'https',
        hostname: 's3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
});

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
