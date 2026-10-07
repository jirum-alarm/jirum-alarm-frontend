import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import CustomerServiceBoot from '@/shared/lib/customerservice/CustomerServiceBoot';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { AuthQueries } from '@/entities/auth';

import MenuList from '@/features/mypage/ui/MenuList';
import MyPageOverview from '@/features/mypage/ui/MyPageOverview';
import MyProfileSection from '@/features/mypage/ui/MyProfileSection';

const MyPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(AuthQueries.me());

  // PC 는 프로필·메뉴가 사이드바(MyPageShell)에 있어 첫 화면은 메뉴 카드만.
  if (!(await checkDevice()).isMobile) {
    return (
      <BasicLayout title="마이페이지">
        <MyPageOverview />
      </BasicLayout>
    );
  }

  return (
    <BasicLayout title="마이페이지">
      <Suspense>
        <MyProfileSection />
        <CustomerServiceBoot />
      </Suspense>
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
