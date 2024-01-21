'use client';
import { PropsWithChildren } from 'react';
import { ApolloSetting } from './apollo';
import RecoilSetting from './recoil';
import ChannelTalkBoot from '@/features/channeltalk/components/ChannelTalkBoot';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
      <ChannelTalkBoot />
    </RecoilSetting>
  );
};

export default AppProvider;
