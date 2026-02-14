import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import StatsPage from './components/StatsPage';

const StatsPageRoute = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">통계</h2>
      </div>
      <StatsPage />
    </DefaultLayout>
  );
};

export default StatsPageRoute;
