import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import UserListTable from './components/UserListTable';

const UserListPage = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">사용자 관리</h2>
      </div>
      <UserListTable />
    </DefaultLayout>
  );
};

export default UserListPage;
