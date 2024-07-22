'use client';
import { PropsWithChildren } from 'react';
import { ApolloProvider } from './apollo';
import CustomerServiceBoot from '../customerservice/CustomerServiceBoot';
import FCMConfig from '../firebase/FCMConfig';
import { RecoilRoot } from 'recoil';
import PHProvider from './posthogProvider';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilRoot>
      <PHProvider>
        <ApolloProvider>{children}</ApolloProvider>
        <CustomerServiceBoot />
        <FCMConfig />
      </PHProvider>
    </RecoilRoot>
  );
};

export default AppProvider;
