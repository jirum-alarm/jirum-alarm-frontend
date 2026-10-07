import type { MetadataRoute } from 'next';

// ponytail: 서비스워커 없음 — 설치(홈 화면 추가)엔 매니페스트만 있으면 되고, 어드민은 오프라인으로 쓸 데이터가 없다
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '지름알림 어드민',
    short_name: '지름 어드민',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F1F5F9',
    theme_color: '#1C2434',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
