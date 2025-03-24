import '@/style/globals.css';
import { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';

import { AppProvider } from './(app)/providers';
import { GA_TRACKING_ID } from '@/constants/ga';
import { defaultMetadata } from '@/constants/metadata';
import { pretendard } from '@/lib/fonts';
import BottomNav from '@/components/layout/BottomNav';
import { checkJirumAlarmApp } from '@/app/actions/agent';

const GoogleAnalytics = dynamic(() => import('../components/GoogleAnalitics'), { ssr: false });

const Toaster = dynamic(() => import('@/components/common/Toast/Toaster'), {
  ssr: false,
  loading: () => null,
});

const MSWInit = dynamic(() => import('@/components/MSWInit'), {
  ssr: false,
  loading: () => null,
});

const InitMixpanel = dynamic(() => import('@/lib/mixpanel').then((mod) => mod.InitMixpanel), {
  ssr: false,
  loading: () => null,
});

// const PostHogPageView = dynamic(() => import('@/components/PostHogPageView'), {
//   ssr: false,
// });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isJirumAlarmApp } = checkJirumAlarmApp();

  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* CDN 폰트 관련 link 태그들 제거 */}
      </head>
      <body>
        <MSWInit>
          <AppProvider>
            <div className="relative min-w-[320px] bg-white before:fixed before:inset-y-0 before:left-1/2 before:z-50 before:w-[1px] before:translate-x-[300px] before:bg-gray-100 after:fixed after:inset-y-0 after:right-1/2 after:z-50 after:w-[1px] after:-translate-x-[300px] after:bg-gray-100">
              {children}
              {!isJirumAlarmApp && <BottomNav type={''} />}
            </div>
            <Toaster />
            {/* <PostHogPageView /> */}
          </AppProvider>
        </MSWInit>
        <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
        <InitMixpanel />
      </body>
    </html>
  );
}
