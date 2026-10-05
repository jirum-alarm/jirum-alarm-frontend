import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

import { COLOR_SCHEME_COOKIE, isDarkCookie } from '@/shared/config/color-scheme';
import CustomerServiceBoot from '@/shared/lib/customerservice/CustomerServiceBoot';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { AuthQueries } from '@/entities/auth';

import MenuList from '@/features/mypage/ui/MenuList';
import MyProfileSection from '@/features/mypage/ui/MyProfileSection';

const MyPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(AuthQueries.me());
  const isDark = isDarkCookie((await cookies()).get(COLOR_SCHEME_COOKIE)?.value);

  return (
    <BasicLayout title="마이페이지">
      <Suspense>
        <MyProfileSection />
        <CustomerServiceBoot />
      </Suspense>
      <MenuList isDark={isDark} />
    </BasicLayout>
  );
};

export default MyPage;
