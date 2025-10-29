import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/assets/**',
      },
    ],
  },
  output: 'export',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'max-image-preview:large' }],
      },
    ];
  },
};

export default nextConfig;
