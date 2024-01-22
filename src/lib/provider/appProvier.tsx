'use client';
import { PropsWithChildren } from 'react';
import { ApolloSetting } from './apollo';
import RecoilSetting from './recoil';
import CustomerServiceBoot from '../customerservice/CustomerServiceBoot';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
      <CustomerServiceBoot />
    </RecoilSetting>
  );
};

export default AppProvider;
