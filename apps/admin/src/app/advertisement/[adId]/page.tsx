import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import AdEditLoader from './components/AdEditLoader';

const AdEditPage = async ({ params }: { params: Promise<{ adId: string }> }) => {
  const { adId } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">광고 수정</h2>
      </div>
      <AdEditLoader adId={adId} />
    </DefaultLayout>
  );
};

export default AdEditPage;
