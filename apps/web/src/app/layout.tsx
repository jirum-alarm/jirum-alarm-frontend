import '@/style/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';

import GoogleAnalytics from '../components/GoogleAnalitics';
import { AppProvider } from './(app)/providers';

import Toaster from '@/components/common/Toast/Toaster';
import BottomNav from '@/components/layout/BottomNav';
import MSWInit from '@/components/MSWInit';
import { GA_TRACKING_ID } from '@/constants/ga';
import { defaultMetadata } from '@/constants/metadata';
import { pretendard } from '@/lib/fonts';
import { InitMixpanel } from '@/lib/mixpanel';

// const PostHogPageView = dynamic(() => import('@/components/PostHogPageView'), {
//   ssr: false,
// });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js"
          integrity="sha384-mXVrIX2T/Kszp6Z0aEWaA8Nm7J6/ZeWXbL8UpGRjKwWe56Srd/iyNmWMBhcItAjH"
          crossOrigin="anonymous"
        ></Script>
        {/* hide until using real word */}
        {/* <Script */}
        {/*   async */}
        {/*   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3855723530036909" */}
        {/*   crossOrigin="anonymous" */}
        {/* ></Script> */}
      </head>
      <body>
        <MSWInit>
          <AppProvider>
            <InitMixpanel />
            <div className="relative min-w-[320px] bg-white before:fixed before:bottom-0 before:left-1/2 before:top-0 before:z-50 before:w-[1px] before:translate-x-[300px] before:bg-gray-100 after:fixed after:bottom-0  after:right-1/2 after:top-0 after:z-50 after:w-[1px] after:-translate-x-[300px] after:bg-gray-100">
              {children}
              <BottomNav type={''} />
            </div>
            <Toaster />
            <SpeedInsights />
            {/* <PostHogPageView /> */}
          </AppProvider>
        </MSWInit>
      </body>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
    </html>
  );
}
