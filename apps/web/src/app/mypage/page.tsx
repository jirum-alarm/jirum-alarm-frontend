import BasicLayout from '@/components/layout/BasicLayout';
import MenuList from './components/MenuList';
import MyProfileSection from './components/MyProfileSection';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import { PreloadQuery } from '@/lib/client';
import { QueryMe } from '@/graphql/auth';
import { getMe } from '@/features/users';

const MyPage = async () => {
  const { data } = await getMe();
  return (
    <BasicLayout hasBackButton hasBottomNav navType={NAV_TYPE.MYPAGE} title="마이페이지">
      <PreloadQuery query={QueryMe}>
        <MyProfileSection me={data.me} />
      </PreloadQuery>
      <MenuList />
    </BasicLayout>
  );
};

export default MyPage;
