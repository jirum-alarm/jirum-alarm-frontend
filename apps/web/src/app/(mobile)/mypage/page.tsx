import { Suspense } from 'react';

import { checkDevice } from '@/shared/actions/agent';
import CustomerServiceBoot from '@/shared/lib/customerservice/CustomerServiceBoot';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import MenuList from '@/features/mypage/ui/MenuList';
import MyPageOverview from '@/features/mypage/ui/MyPageOverview';
import MyProfileSection from '@/features/mypage/ui/MyProfileSection';

// me 프리페치는 layout.tsx 가 한다(여기서 또 받으면 dehydrate 도 안 되는 API 왕복이 렌더를 막는다).
const MyPage = async () => {
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
