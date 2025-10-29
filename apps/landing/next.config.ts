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
};

export default nextConfig;
