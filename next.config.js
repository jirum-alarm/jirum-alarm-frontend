const runtimeCaching = require('next-pwa/cache');
const { PHASE_PRODUCTION_BUILD } = require('next/dist/shared/lib/constants');
const { PHASE_DEVELOPMENT_SERVER } = require('next/dist/shared/lib/constants');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

const moduleExports = phase => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    BASE_FRONT_URL: (() => {
      if (isDev) return 'http://localhost:3000';
      if (isProd) return 'https://dev.jirum-alarm.com';
    })(),
    KAKAO_JAVASCRIPT_KEY: 'b2daeff94a0f9f47a16f449996356d29',
  };

  const nextConfig = withPWA({
    env,
    swcMinify: true,
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
  });
  return nextConfig;
};

module.exports = moduleExports;
