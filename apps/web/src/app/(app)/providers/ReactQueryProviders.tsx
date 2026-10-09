// In Next.js, this file would be called: app/providers.jsx
'use client';

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { QueryClientProvider, skipToken } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { useEffect } from 'react';

import { getQueryClient } from '../react-query/query-client';

const TICK_MS = 15_000;
// 낡기 이만큼 전에 미리 받는다. TICK 보다 커야 다음 틱 전에 낡지 않는다.
const LEAD_MS = 20_000;

/**
 * 떠나 있는 화면(비활성 쿼리)을 낡기 직전에 미리 다시 받아 둔다.
 * 뒤로가기는 라우터 캐시(staleTimes.dynamic 5분)로 옛 화면을 즉시 띄우는데, 그 사이 staleTime 이 지난
 * 쿼리는 마운트 직후 재요청돼 랭킹·목록이 눈앞에서 바뀌었다. 미리 받아 두면 돌아온 순간 이미 최신이다.
 * staleTime 0(찜·알림처럼 늘 다시 받는 것)은 어차피 마운트 때 받으니 건너뛴다.
 * ponytail: 다시 안 갈 화면도 gcTime(5분) 동안 분당 1번꼴로 받는다 — 트래픽이 문제면 직전 화면 쿼리만 고를 것.
 */
function useKeepInactiveQueriesFresh(queryClient: ReturnType<typeof getQueryClient>) {
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      // refetchQueries 를 안 쓰는 이유: initialData 로만 채운 쿼리(홈 토스 목록)를 '한 번도 안 받은' 것으로 보고 건너뛴다.
      for (const query of queryClient.getQueryCache().findAll({ type: 'inactive' })) {
        const { staleTime } = query.options as { staleTime?: unknown };
        const { queryFn } = query.options;
        if (
          // 하이드레이션으로만 들어온 쿼리는 queryFn 이 없다. 데이터가 없는 건 꺼둔(enabled:false) 쿼리일 수 있다.
          queryFn &&
          queryFn !== skipToken &&
          query.state.dataUpdatedAt > 0 &&
          typeof staleTime === 'number' &&
          staleTime > LEAD_MS &&
          now - query.state.dataUpdatedAt > staleTime - LEAD_MS
        ) {
          query.fetch().catch(() => {}); // 실패하면 돌아왔을 때 마운트 재요청이 다시 받는다
        }
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [queryClient]);
}

export function ReactQueryProviders({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  useKeepInactiveQueriesFresh(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
