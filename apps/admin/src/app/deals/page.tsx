import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import ModelPagesTable from './components/ModelPagesTable';

// /deals 모델 페이지(에버그린 SEO 페이지) 발행 검수. 자동 발굴 배치가 만든 초안을
// 보고 발행/취소 토글. isPublished=true 만 사이트(/deals)·sitemap 에 노출됨(킬스위치).
const DealsAdminPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-4">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          딜 페이지 발행 검수
        </h2>
        <p className="mt-1 text-sm text-bodydark2">
          자동 발굴된 초안을 검수해 발행하세요. 발행한 페이지만 jirum-alarm.com/deals 와 sitemap 에
          노출됩니다.
        </p>
      </div>
      <ModelPagesTable />
    </DefaultLayout>
  );
};

export default DealsAdminPage;
