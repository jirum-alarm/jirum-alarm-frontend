import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import AdForm from '../components/AdForm';

const AdRegisterPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">광고 등록</h2>
      </div>
      <AdForm mode="create" />
    </DefaultLayout>
  );
};

export default AdRegisterPage;
