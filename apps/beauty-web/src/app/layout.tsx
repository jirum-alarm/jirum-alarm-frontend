import '@/styles/globals.css';

import { cookies } from 'next/headers';

import { pretendard } from '@/fonts/font';
import { SERVICE_NAME } from '@/shared/config/beauty';
import { isIndexableDeployment, serviceUrl } from '@/shared/config/env';
import { GTM_BOOTSTRAP_SCRIPT } from '@/shared/config/gtm';
import { cn } from '@/shared/lib/cn';
import ProductCardTracker from '@/widgets/ProductCardTracker';
import ServiceRuntime from '@/widgets/ServiceRuntime';

import type { Metadata, Viewport } from 'next';

/** web shared/config/color-scheme.ts 와 같은 쿠키·같은 색 — web 마이페이지에서 켠 다크모드가 여기도 그대로. */
const COLOR_SCHEME_COOKIE = 'COLOR_SCHEME';
const THEME_COLOR = { light: '#FFFFFF', dark: '#0C111D' } as const;

const isDarkScheme = async () => (await cookies()).get(COLOR_SCHEME_COOKIE)?.value === 'dark';

export async function generateMetadata(): Promise<Metadata> {
  const base = serviceUrl();
  return {
    metadataBase: new URL(base),
    title: `뷰티 핫딜 | ${SERVICE_NAME}`,
    description: '화장품·스킨케어 특가를 커뮤니티 반응 순으로 모았어요.',
    applicationName: '지름알림',
    // 운영(apex)만 색인 — dev 배포가 색인되면 중복 도메인이 검색에 섞인다(web robotsDirective 와 같은 판정).
    robots: isIndexableDeployment()
      ? { index: true, follow: true }
      : { index: false, follow: false },
    // 아이콘은 basePath 밖 본 서비스 것(같은 도메인 루트).
    icons: {
      icon: `${base}/icon.png`,
      shortcut: `${base}/favicon.ico`,
      apple: `${base}/apple-touch-icon.png`,
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: (await isDarkScheme()) ? THEME_COLOR.dark : THEME_COLOR.light,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isDark = await isDarkScheme();

  return (
    <html lang="ko" className={cn(pretendard.className, 'antialiased', isDark && 'dark')}>
      <head>
        {/* gtm.js 보다 먼저 dataLayer·서비스 구분값(service=beauty). 운영 도메인에서만 동작한다. */}
        <script dangerouslySetInnerHTML={{ __html: GTM_BOOTSTRAP_SCRIPT }} />
        <link rel="preconnect" href="https://cdn.jirum-alarm.com" crossOrigin="" />
      </head>
      <body>
        <div className="max-w-mobile-max relative mx-auto min-h-svh bg-white">{children}</div>
        <ServiceRuntime />
        <ProductCardTracker />
      </body>
    </html>
  );
}
