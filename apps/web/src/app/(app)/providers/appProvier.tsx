'use client';
import { RecoilRoot } from 'recoil';

import { ApolloProvider } from './apollo';
import PHProvider from './posthogProvider';
import { ReactQueryProviders } from './ReactQueryProviders';
import FCMConfig from '../../../lib/firebase/FCMConfig';

interface Props {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: Props) => {
  return (
    <RecoilRoot>
      <ReactQueryProviders>
        <PHProvider>
          <ApolloProvider>{children}</ApolloProvider>
          <FCMConfig />
        </PHProvider>
      </ReactQueryProviders>
    </RecoilRoot>
  );
};
