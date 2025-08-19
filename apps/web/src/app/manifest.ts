import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '지름알림',
    short_name: '지름알림',
    description:
      '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥',
    start_url: '/',
    display: 'standalone',
    background_color: '#9EF22E',
    theme_color: '#FFFFFF',
    icons: [
      {
        src: '/assets/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/assets/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/assets/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
