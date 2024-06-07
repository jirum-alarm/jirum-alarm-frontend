import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';

const MyPage = () => {
  return (
    <BasicLayout hasBackButton title="마이페이지">
      <MyProfileSection />
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
