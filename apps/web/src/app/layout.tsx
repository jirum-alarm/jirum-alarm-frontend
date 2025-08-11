import '@/style/globals.css';

import { AppProvider } from '@/app/(app)/providers';
import { defaultMetadata, jsonLd } from '@/constants/metadata';
import { pretendard } from '@/lib/fonts';

import type { Metadata, Viewport } from 'next';

// const PostHogPageView = dynamic(() => import('@/components/PostHogPageView'), {
//   ssr: false,
// });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.className} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://api.mixpanel.com" />
        <link rel="preconnect" href="https://cdn.jirum-alarm.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="application-name" content="지름알림" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="preload" as="image" href="/images/icon-144x144.png" />

        <meta name="author" content="지름알림" />

        <link
          rel="search"
          href="/opensearch.xml"
          title="지름알림"
          type="application/opensearchdescription+xml"
        />
      </head>
      <body>
        <div className="relative">
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
