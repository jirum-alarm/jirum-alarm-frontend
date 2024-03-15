'use client';
import { PropsWithChildren } from 'react';
import { ApolloSetting } from './apollo';
import CustomerServiceBoot from '../customerservice/CustomerServiceBoot';
import FCMConfig from '../firebase/FCMConfig';
import { RecoilRoot } from 'recoil';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilRoot>
      <ApolloSetting>{children}</ApolloSetting>
      <CustomerServiceBoot />
      <FCMConfig />
    </RecoilRoot>
  );
};

export default AppProvider;
