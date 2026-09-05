'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { Provider as JotaiProvider } from 'jotai';
import dynamic from 'next/dynamic';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { IS_PRD } from '@/shared/config/env';
import { GTM_ID } from '@/shared/config/gtm';
import FCMConfig from '@/shared/lib/firebase/FCMConfig';

import LoginModal from '@/features/auth/ui/login/LoginModal';

import { AdSenseProvider } from './adsenseProvider';
import { ClarityProvider } from './clarityProvider';
import { DeviceId } from './deviceId';
import { MixpanelIdentifyProvider } from './mixpanelIdentifyProvider';
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

interface Props {
  children: React.ReactNode;
  /** 서버(root layout)가 UA·쿠키로 판정한 값. 클라이언트 atom 초깃값이 된다. */
  device: CheckDeviceResult;
  isLoggedIn: boolean;
}

export const AppProvider = ({ children, device, isLoggedIn }: Props) => {
  return (
    <>
      <ClarityProvider />
      <MixpanelIdentifyProvider />
      <AdSenseProvider />
      {IS_PRD ? <GoogleTagManager gtmId={GTM_ID} /> : <MSW />}
      <JotaiProvider>
        <ServerStateProvider device={device} isLoggedIn={isLoggedIn}>
          <ReactQueryProviders>
            {IS_PRD ? <DeviceId /> : null}
            {/* <PHProvider> */}
            <NuqsAdapter>{children}</NuqsAdapter>
            {/* </PHProvider> */}
            <LoginModal />
          </ReactQueryProviders>
        </ServerStateProvider>
      </JotaiProvider>
      <Toaster />
      <FCMConfig />
    </>
  );
};
