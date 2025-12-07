import '@/style/globals.css';

import { PublicEnvScript } from 'next-runtime-env';

import { AppProvider } from '@/app/(app)/providers';

import { defaultMetadata, jsonLd } from '@shared/config/metadata';
import { pretendard } from '@shared/lib/fonts';

import type { Metadata, Viewport } from 'next';

// const PostHogPageView = dynamic(() => import('@shared/ui/PostHogPageView'), {
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
        <link rel="dns-prefetch" href="https://api.mixpanel.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link
          rel="search"
          href="/opensearch.xml"
          title="지름알림"
          type="application/opensearchdescription+xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
