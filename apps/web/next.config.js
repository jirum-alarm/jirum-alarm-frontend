/* eslint-disable @typescript-eslint/no-require-imports */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        // 유니버설/앱 링크 검증 파일. AASA 는 확장자가 없어 기본 Content-Type 이
        // application/octet-stream 으로 나가는데, iOS 는 그러면 검증을 건너뛴다.
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
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
    // 기본값의 2048·3840 을 뺀다. 원본 상품 이미지가 그만큼 크지 않고, fill 이미지 srcset·preload 만 길어졌다.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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
    // 라우터 캐시(브라우저 탭 안) 수명. 기본 0 이면 prefetch={true} 로 받아둔 상세 본문도 탐색 때 안 쓰고
    // 다시 받는다(실측: 완전 프리페치된 카드를 탭해도 본문 680ms). 5분이면 홈에 머무는 시간을 덮는다.
    // 트레이드오프 = 그 사이 상세 서버 문구(게시일 안내 등)가 최대 5분 낡음. 가격·댓글은 react-query
    // staleTime 60s 로 마운트 후 스스로 갱신된다. 뒤로가기도 5분 안엔 캐시로 즉시.
    staleTimes: { dynamic: 300 },
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack(config) {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.git/**', '**/.worktrees/**', '**/node_modules/**'],
    };
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
};

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

  // Replay 를 안 쓴다(instrumentation-client). rrweb 의 iframe·shadowDOM·worker 코드까지 빌드 타임에 잘라낸다.
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
    excludeReplayWorker: true,
  },

  // See the following for more information:
  // https://docs.sentry.io/product/crons/
});
