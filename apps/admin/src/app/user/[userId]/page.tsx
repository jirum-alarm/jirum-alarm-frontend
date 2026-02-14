import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import UserDetail from './components/UserDetail';

const UserDetailPage = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">사용자 상세</h2>
      </div>
      <UserDetail userId={userId} />
    </DefaultLayout>
  );
};

export default UserDetailPage;
