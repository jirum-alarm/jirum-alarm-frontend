'use client';
import { PropsWithChildren } from 'react';
import { ApolloSetting } from './apollo';
import RecoilSetting from './recoil';
import CustomerServiceBoot from '../customerservice/CustomerServiceBoot';
import FirebaseConfig from '../firebase/FirebaseConfig';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
      <CustomerServiceBoot />
      <FirebaseConfig />
    </RecoilSetting>
  );
};

export default AppProvider;
