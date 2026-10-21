import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 서비스 숫자 정본(@jirum/domain/service-facts)은 TS 원본 그대로 export 한다 — web 처럼 여기서 컴파일한다.
  transpilePackages: ['@jirum/domain'],
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
