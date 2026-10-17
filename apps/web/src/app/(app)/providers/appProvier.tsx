'use client';

import { Provider as JotaiProvider } from 'jotai';
import { LazyMotion, MotionConfig } from 'motion/react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { IS_PRD } from '@/shared/config/env';
import { GTM_ID } from '@/shared/config/gtm';
import FCMConfig from '@/shared/lib/firebase/FCMConfig';

import AppHandoffLanding from '@/features/app-download/ui/AppHandoffLanding';
import BrowserHandoffArrival from '@/features/app-download/ui/BrowserHandoffArrival';
import KakaoAppOpen from '@/features/app-download/ui/KakaoAppOpen';

import { ClarityProvider } from './clarityProvider';
import { DeviceId } from './deviceId';
import { EntryTracker } from './entryTracker';
import { LazyLoginModal, LazyPushChannelSheet } from './lazyOverlays';
import { ProductCardTracker } from './productCardTracker';
import { ReactQueryProviders } from './ReactQueryProviders';
import ServerStateProvider from './ServerStateProvider';
import { WebVitalsReporter } from './webVitalsReporter';

import type { CheckDeviceResult } from '@/app/actions/agent.types';

const MSW = dynamic(() => import('@/shared/ui/MSW'), {
  ssr: false,
  loading: () => null,
});

const Toaster = dynamic(() => import('@/shared/ui/common/Toast/Toaster'), {
  ssr: false,
  loading: () => null,
});

// motion 기능은 첫 인터랙션 전에 필요 없다. 별 청크로 미뤄 초기 JS 를 줄인다.
const loadMotionFeatures = () => import('@/shared/lib/motion-features').then((mod) => mod.default);

interface Props {
  children: React.ReactNode;
  /** 서버(root layout)가 UA·쿠키로 판정한 값. 클라이언트 atom 초깃값이 된다. */
  device: CheckDeviceResult;
  isLoggedIn: boolean;
  isGuest: boolean;
}

export const AppProvider = ({ children, device, isLoggedIn, isGuest }: Props) => {
  return (
    <>
      {/* GTM 은 load 이후. @next/third-parties 의 afterInteractive 는 App Router 에서 preload 를 만들어
          139KB 가 High 우선순위로 LCP 창에 들어갔다(그 뒤 gtag 191KB 가 따라온다).
          ⚠️ Mixpanel 은 코드에 없다 — GTM 태그였고 비용 문제로 안 써서 v58(2026-10-17)에 전부 일시중지했다.
          dataLayer 는 root layout <head> 인라인 스크립트가 먼저 만들어 두므로 그 사이 push 는 큐에 남는다. */}
      {IS_PRD ? (
        <Script
          id="gtm"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />
      ) : (
        <MSW />
      )}
      <LazyMotion features={loadMotionFeatures}>
        {/* OS 「동작 줄이기」를 켠 사람에겐 움직임(위치·크기)을 끄고 투명도만 남긴다 — Skeleton motion-safe 와 같은 규칙. */}
        <MotionConfig reducedMotion="user">
          <JotaiProvider>
            <ServerStateProvider device={device} isLoggedIn={isLoggedIn} isGuest={isGuest}>
              <ReactQueryProviders>
                {IS_PRD ? <DeviceId /> : null}
                <ClarityProvider />
                <EntryTracker />
                <WebVitalsReporter />
                <ProductCardTracker />
                <NuqsAdapter>{children}</NuqsAdapter>
                <LazyLoginModal />
                <LazyPushChannelSheet />
                <BrowserHandoffArrival />
                <AppHandoffLanding />
                <KakaoAppOpen />
              </ReactQueryProviders>
            </ServerStateProvider>
          </JotaiProvider>
          <Toaster />
        </MotionConfig>
      </LazyMotion>
      <FCMConfig />
    </>
  );
};
