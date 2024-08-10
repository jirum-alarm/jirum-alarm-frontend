import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import { Suspense } from 'react';

const MyPage = () => {
  return (
    <BasicLayout hasBackButton hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지">
      <Suspense>
        <MyProfileSection />
      </Suspense>
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
