import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Docker 런너가 server.js 를 실행하므로 standalone 필수
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
