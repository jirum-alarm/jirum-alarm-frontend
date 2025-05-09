import '@/style/globals.css';

import { Metadata, Viewport } from 'next';

import { AppProvider } from '@/app/(app)/providers';
import BottomNavServer from '@/components/layout/BottomNavServer';
import { defaultMetadata } from '@/constants/metadata';
import { pretendard } from '@/lib/fonts';

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
    <html lang="ko" className={pretendard.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://api.mixpanel.com" />
        <link rel="preconnect" href="https://cdn.jirum-alarm.com" />
      </head>
      <body>
        <div className="relative min-w-[320px] bg-white before:fixed before:inset-y-0 before:left-1/2 before:z-50 before:w-[1px] before:translate-x-[300px] before:bg-gray-100 after:fixed after:inset-y-0 after:right-1/2 after:z-50 after:w-[1px] after:-translate-x-[300px] after:bg-gray-100">
          <AppProvider>{children}</AppProvider>
          <BottomNavServer />
        </div>
      </body>
    </html>
  );
}
