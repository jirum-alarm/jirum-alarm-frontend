import { Suspense } from 'react';

import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import CustomerServiceBoot from '../../lib/customerservice/CustomerServiceBoot';

import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';

const MyPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지">
      <Suspense>
        <MyProfileSection />
        <CustomerServiceBoot />
      </Suspense>
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
