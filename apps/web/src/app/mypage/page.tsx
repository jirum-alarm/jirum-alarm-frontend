import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { authQueries } from '@/entities/auth/auth.queries';

export const dynamic = 'force-dynamic';

const MyPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(authQueries.me());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BasicLayout hasBackButton hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지">
        <Suspense>
          <MyProfileSection />
        </Suspense>
        <MenuList />
      </BasicLayout>
    </HydrationBoundary>
  );
};

export default MyPage;
