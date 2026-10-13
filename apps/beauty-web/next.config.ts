import type { NextConfig } from 'next';

/**
 * 지름알림 뷰티 — jirum-alarm.com/beauty/* 를 이 앱이 받는다(게이트웨이가 /beauty 접두만 이 파드로 보낸다).
 * 그 밖의 경로(/products/{id}·/api/graphql·/_next/image·/login …)는 그대로 본 서비스(apps/web) 파드가 받는다.
 * ★basePath 는 gitops 라우팅과의 계약이다 — 바꾸면 정적 자산(/beauty/_next/...)이 web 으로 가서 깨진다.
 */
const BASE_PATH = '/beauty';

/**
 * 상품 사진 최적화는 본 서비스의 /_next/image 를 같이 쓴다(같은 도메인·같은 디스크 캐시 — image-loader.ts).
 * web next.config.js 의 images.deviceSizes·imageSizes 와 **같은 값**이어야 한다: web 은 목록에 없는 w 를 400 으로 거절한다.
 */
const IMAGE_DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920];
const IMAGE_SIZES = [120, 160, 192, 256, 320, 384, 420, 550];

/**
 * basePath 밖 경로를 로컬(next dev/start 단독 실행)에서만 받아 줄 곳. 운영·스테이징에선 게이트웨이가 이 경로들을
 * web 파드로 보내므로 이 앱까지 오지 않는다. 로컬 확인 때 사진·무한 스크롤(읽기)이 보이게 하는 용도다.
 * 쓰기 요청(노출 기록·기기 등록)은 클라이언트가 지름알림 도메인에서만 보낸다(shared/lib/service-host.ts).
 */
const LOCAL_FALLBACK_ORIGIN = 'https://jirum-alarm.com';

const nextConfig: NextConfig = {
  // Docker 런너가 server.js 를 실행하므로 standalone 필수(apps/ai 와 같음)
  output: 'standalone',
  basePath: BASE_PATH,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/shared/lib/image-loader.ts',
    deviceSizes: IMAGE_DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
  },
  async headers() {
    return [
      {
        // web 과 같은 값 — 검색 결과에 큰 미리보기 사진을 허용한다.
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'max-image-preview:large' }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/_next/image',
        destination: `${LOCAL_FALLBACK_ORIGIN}/_next/image`,
        basePath: false,
      },
      {
        source: '/api/graphql',
        destination: `${LOCAL_FALLBACK_ORIGIN}/api/graphql`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
