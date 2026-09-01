import '@/shared/style/globals.css';

import { PublicEnvScript } from 'next-runtime-env';

import { AppProvider } from '@/app/(app)/providers';

import { defaultMetadata, jsonLd, organizationLd } from '@/shared/config/metadata';
import { pretendard } from '@/shared/lib/fonts';

import type { Metadata, Viewport } from 'next';

// const PostHogPageView = dynamic(() => import('@/shared/ui/PostHogPageView'), {
//   ssr: false,
// });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
  themeColor: '#FFFFFF',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.className} antialiased`}>
      <head>
        <PublicEnvScript />
        <link rel="preconnect" href="https://cdn.jirum-alarm.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.mixpanel.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
        <link
          rel="search"
          href="/opensearch.xml"
          title="지름알림"
          type="application/opensearchdescription+xml"
        />
        {/* ponytail: JSX 로 직접. metadata.alternates 로 두면 라우트가 alternates 를 덮을 때
            (canonical 만 지정해도) types 가 통째로 날아가 RSS 링크가 사라진다 — Next 메타데이터는
            top-level key 단위 shallow merge. rel=search 와 같은 방식. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="지름알림 - 실시간 핫딜"
          href="/rss.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="지름알림" />
        <meta name="author" content="지름알림" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
