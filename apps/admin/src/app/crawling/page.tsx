import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import CrawlingPage from './components/CrawlingPage';

const CrawlingPageRoute = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">크롤링 현황</h2>
        <p className="mt-1 text-sm text-bodydark2">
          provider별 수집 활동, 시계열 추세, 썸네일 수집 상태를 확인합니다.
        </p>
      </div>
      <CrawlingPage />
    </DefaultLayout>
  );
};

export default CrawlingPageRoute;
