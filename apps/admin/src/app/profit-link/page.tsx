import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import ProfitLinkTabs from './components/ProfitLinkTabs';

const ProfitLinkPageRoute = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">수익 링크</h2>
        <p className="mt-1 text-sm text-bodydark2">
          발급·판매 생존 신호, 발급 퍼널, 노출 대비 누락 딜, retry 큐 상태를 한눈에. 토스
          세션(TBIZAUTH) 갱신은 토스 세션 탭에서.
        </p>
      </div>
      <ProfitLinkTabs />
    </DefaultLayout>
  );
};

export default ProfitLinkPageRoute;
