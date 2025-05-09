'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { Provider as JotaiProvider } from 'jotai';
import dynamic from 'next/dynamic';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { IS_PRD } from '@/constants/env';
import { GTM_ID } from '@/constants/gtm';
import FCMConfig from '@/lib/firebase/FCMConfig';

import { ApolloProvider } from './apollo';
import PHProvider from './posthogProvider';
import { ReactQueryProviders } from './ReactQueryProviders';

const MSW = dynamic(() => import('@/components/MSW'), {
  ssr: false,
  loading: () => null,
});

const Toaster = dynamic(() => import('@/components/common/Toast/Toaster'), {
  ssr: false,
  loading: () => null,
});

interface Props {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: Props) => {
  return (
    <>
      {IS_PRD ? <GoogleTagManager gtmId={GTM_ID} /> : <MSW />}
      <JotaiProvider>
        <ReactQueryProviders>
          <PHProvider>
            <NuqsAdapter>
              <ApolloProvider>{children}</ApolloProvider>
            </NuqsAdapter>
            <FCMConfig />
          </PHProvider>
        </ReactQueryProviders>
      </JotaiProvider>
      <Toaster />
    </>
  );
};
