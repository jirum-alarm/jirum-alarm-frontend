import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import AdListTable from './components/AdListTable';

const AdvertisementPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">광고 관리</h2>
      </div>
      <AdListTable />
    </DefaultLayout>
  );
};

export default AdvertisementPage;
