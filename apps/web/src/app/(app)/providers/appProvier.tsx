'use client';

import { Provider as JotaiProvider } from 'jotai';
import { LazyMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { IS_PRD } from '@/shared/config/env';
import { GTM_ID } from '@/shared/config/gtm';
import FCMConfig from '@/shared/lib/firebase/FCMConfig';

import LoginModal from '@/features/auth/ui/login/LoginModal';

import { ClarityProvider } from './clarityProvider';
import { DeviceId } from './deviceId';
import { ReactQueryProviders } from './ReactQueryProviders';
import ServerStateProvider from './ServerStateProvider';

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
}

export const AppProvider = ({ children, device, isLoggedIn }: Props) => {
  return (
    <>
      {/* GTM 은 load 이후. @next/third-parties 의 afterInteractive 는 App Router 에서 preload 를 만들어
          139KB 가 High 우선순위로 LCP 창에 들어갔다(그 뒤 gtag 191KB·mixpanel 33KB 가 따라온다).
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
        <JotaiProvider>
          <ServerStateProvider device={device} isLoggedIn={isLoggedIn}>
            <ReactQueryProviders>
              {IS_PRD ? <DeviceId /> : null}
              <ClarityProvider />
              <NuqsAdapter>{children}</NuqsAdapter>
              <LoginModal />
            </ReactQueryProviders>
          </ServerStateProvider>
        </JotaiProvider>
        <Toaster />
      </LazyMotion>
      <FCMConfig />
    </>
  );
};
