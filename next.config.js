const runtimeCaching = require('next-pwa/cache')

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
})

const nextConfig = withPWA({
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'msw/browser': false,
      }
    }

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'msw/node': false,
      }
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
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
