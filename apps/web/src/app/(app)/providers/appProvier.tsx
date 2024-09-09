'use client';
import { ApolloProvider } from './apollo';
import CustomerServiceBoot from '../../../lib/customerservice/CustomerServiceBoot';
import FCMConfig from '../../../lib/firebase/FCMConfig';
import { RecoilRoot } from 'recoil';
import PHProvider from './posthogProvider';
import { ReactQueryProviders } from './ReactQueryProviders';

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
