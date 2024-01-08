const runtimeCaching = require('next-pwa/cache')

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
})

const nextConfig = withPWA({
  async rewrites() {
    return [
      {
        destination: 'https://jirum-api.kyojs.com/:path*',
        source: '/:path*',
      },
    ]
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
    ]
  },
})

module.exports = nextConfig
