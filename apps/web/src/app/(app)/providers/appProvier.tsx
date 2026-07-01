'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { Provider as JotaiProvider } from 'jotai';
import dynamic from 'next/dynamic';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { IS_PRD } from '@/shared/config/env';
import { GTM_ID } from '@/shared/config/gtm';
import FCMConfig from '@/shared/lib/firebase/FCMConfig';

import InterstitialPromotionAd from '@/widgets/ad/ui/InterstitialPromotionAd';

import { AdSenseProvider } from './adsenseProvider';
import { ClarityProvider } from './clarityProvider';
import { DeviceId } from './deviceId';
import { MixpanelIdentifyProvider } from './mixpanelIdentifyProvider';
import { ReactQueryProviders } from './ReactQueryProviders';

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
}

export const AppProvider = ({ children }: Props) => {
  return (
    <>
      <ClarityProvider />
      <MixpanelIdentifyProvider />
      <AdSenseProvider />
      {IS_PRD ? <GoogleTagManager gtmId={GTM_ID} /> : <MSW />}
      <JotaiProvider>
        <ReactQueryProviders>
          {IS_PRD ? <DeviceId /> : null}
          {/* <PHProvider> */}
          <NuqsAdapter>
            {children}
            <InterstitialPromotionAd />
          </NuqsAdapter>
          {/* </PHProvider> */}
        </ReactQueryProviders>
      </JotaiProvider>
      <Toaster />
      <FCMConfig />
    </>
  );
};
