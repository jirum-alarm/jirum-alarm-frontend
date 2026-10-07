/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // 합치거나 없앤 화면 — 옛 북마크·홈 화면 바로가기가 404 가 되지 않게
  async redirects() {
    return [
      {
        source: '/product/matching-gated',
        destination: '/product/matching?tab=gated',
        permanent: false,
      },
      { source: '/category', destination: '/product/list', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};

export default nextConfig;
