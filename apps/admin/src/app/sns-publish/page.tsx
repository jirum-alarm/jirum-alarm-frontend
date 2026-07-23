import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import { listAwaiting } from './actions';
import SnsPublishTable from './components/SnsPublishTable';

// 발행 대기 목록은 실시간성이 중요(10분 안에 발행됨) → 매 요청 조회.
export const dynamic = 'force-dynamic';

const SnsPublishPageRoute = async () => {
  const token = await getAccessToken();
  let drafts: Awaited<ReturnType<typeof listAwaiting>> = [];
  let error: string | null = null;
  try {
    drafts = await listAwaiting();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">SNS 발행</h2>
        <p className="mt-1 text-sm text-bodydark2">
          핫딜을 Threads 에 자동 발행합니다. 초안은 <b>기본 자동 승인</b>되어 10분마다 발행되며,
          아래 목록에서 발행 전 반려할 수 있습니다. isEnd·부정반응·돈 이모지·재촉 어투는 이미 자동
          필터됩니다.
        </p>
      </div>
      {error ? (
        <div className="border-red-300 bg-red-50 text-red-700 rounded border p-4 text-sm">
          publisher 서비스 조회 실패: {error}
        </div>
      ) : (
        <SnsPublishTable initialDrafts={drafts} />
      )}
    </DefaultLayout>
  );
};

export default SnsPublishPageRoute;
