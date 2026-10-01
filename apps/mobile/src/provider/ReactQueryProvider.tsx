import React from 'react';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';

/**
 * react-query 의 "포커스"·"온라인" 감지는 브라우저 이벤트(visibilitychange·online)만 본다 —
 * RN 엔 둘 다 없어서 그동안 **앱으로 돌아와도·재연결돼도 아무것도 다시 안 받았다**
 * (반나절 뒤 열어도 옛 핫딜, auth 의 refetchOnReconnect 도 죽어 있었음).
 * 앱 복귀 = 포커스, NetInfo = 온라인으로 이어 준다. 복귀 때는 staleTime(1분) 지난
 * 화면 데이터만 조용히 다시 받는다 — 화면은 그대로 두고 바꿔치기.
 */
focusManager.setEventListener(setFocused => {
  const sub = AppState.addEventListener('change', state =>
    setFocused(state === 'active'),
  );
  return () => sub.remove();
});
onlineManager.setEventListener(setOnline =>
  NetInfo.addEventListener(state => setOnline(state.isConnected !== false)),
);

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
