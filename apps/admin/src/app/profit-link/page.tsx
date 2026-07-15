import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import TossSessionPanel from './components/TossSessionPanel';

const ProfitLinkPageRoute = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">수익 링크 · 토스 세션</h2>
        <p className="mt-1 text-sm text-bodydark2">
          토스쇼핑 발급에 쓰는 세션(TBIZAUTH)을 갱신합니다. 만료되면 발급이 자동 중단되고 알림이
          오니, 아래 안내대로 새 쿠키를 넣어주세요.
        </p>
      </div>
      <TossSessionPanel />
    </DefaultLayout>
  );
};

export default ProfitLinkPageRoute;
