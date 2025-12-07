import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import CustomerServiceBoot from '@shared/lib/customerservice/CustomerServiceBoot';
import BasicLayout from '@shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@shared/ui/layout/BottomNav';

import { AuthQueries } from '@entities/auth';

import MenuList from '@features/mypage/ui/MenuList';
import MyProfileSection from '@features/mypage/ui/MyProfileSection';

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
