import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import { getMe } from '@/features/users/server/me';

export const dynamic = 'force-dynamic';

const MyPage = async () => {
  const { data } = await getMe();
  return (
    <BasicLayout hasBackButton hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지">
      <MyProfileSection me={data.me} />
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
