import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import CustomerServiceBoot from '@/lib/customerservice/CustomerServiceBoot';

import { AuthQueries } from '@entities/auth';

import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';

const MyPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(AuthQueries.me());

  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지" hasBackButton>
      <Suspense>
        <MyProfileSection />
        <CustomerServiceBoot />
      </Suspense>
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
