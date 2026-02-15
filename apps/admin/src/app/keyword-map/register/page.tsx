import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import GroupRegister from './components/GroupRegister';

const GroupRegisterPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <GroupRegister />
    </DefaultLayout>
  );
};

export default GroupRegisterPage;
