import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // staleTime 이 0 이면 탭을 오갈 때마다 전부 재요청 → 매번 스피너부터 다시.
      // 핫딜 목록은 분 단위로 바뀌는 데이터라 1분이면 신선도에 문제 없고,
      // 그 사이 재진입은 캐시로 즉시 그려진다.
      staleTime: 60 * 1000,
      // 마운트마다 자동 재요청하지 않는다(위 staleTime 과 짝). 화면 복귀가 잦은
      // 탭 구조에서 이게 켜져 있으면 staleTime 을 줘도 로딩이 다시 뜬다.
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function ReactQueryProvider({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ReactQueryProvider;
