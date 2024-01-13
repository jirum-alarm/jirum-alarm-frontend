import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import MyVersion from './components/MyVersion';

export const dynamic = 'force-dynamic';

const MyPage = () => {
  return (
    <BasicLayout hasBackButton title="마이페이지">
      <MyProfileSection />
      <MenuList />
      <MyVersion />
    </BasicLayout>
  );
};

export default MyPage;
