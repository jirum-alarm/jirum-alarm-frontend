'use client';
import { PropsWithChildren } from 'react';
import { ApolloProvider } from './apollo';
import CustomerServiceBoot from '../customerservice/CustomerServiceBoot';
import FCMConfig from '../firebase/FCMConfig';
import { RecoilRoot } from 'recoil';
import PHProvider from './posthogProvider';

interface Props {
  children: React.ReactNode;
  token?: string;
}

const AppProvider = ({ children, token }: Props) => {
  return (
    <RecoilRoot>
      <PHProvider>
        <ApolloProvider token={token}>{children}</ApolloProvider>
        <CustomerServiceBoot />
        <FCMConfig />
      </PHProvider>
    </RecoilRoot>
  );
};

export default AppProvider;
