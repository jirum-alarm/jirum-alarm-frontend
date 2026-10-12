import React, {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import {
  restoreQueryCache,
  saveQueryCache,
} from '@/shared/lib/persistence/query-cache';
import {getAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';
import {AuthQueries} from '@/entities/auth';
import {captureQueryError} from '@/shared/lib/monitoring/sentry';

// 이 실행이 시작된 시각 — 이보다 오래된 데이터는 디스크에서 복원된 것이다.
const BOOT_TIME = Date.now();
// 복원이 늦어도 화면을 막지 않는다(스플래시가 그만큼 길어질 뿐).
const RESTORE_TIMEOUT_MS = 800;

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
  // 화면이 「다시 시도」로 삼키는 실패도 Sentry 에 남긴다(네트워크·인증·취소는 거른다).
  queryCache: new QueryCache({
    onError: (error, query) =>
      captureQueryError(error, {kind: 'query', key: query.queryKey}),
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) =>
      captureQueryError(error, {
        kind: 'mutation',
        key: mutation.options.mutationKey,
      }),
  }),
  defaultOptions: {
    queries: {
      retry: false,
      // staleTime 이 0 이면 탭을 오갈 때마다 전부 재요청 → 매번 스피너부터 다시.
      // 핫딜 목록은 분 단위로 바뀌는 데이터라 1분이면 신선도에 문제 없고,
      // 그 사이 재진입은 캐시로 즉시 그려진다.
      staleTime: 60 * 1000,
      // 마운트마다 자동 재요청하지 않는다(위 staleTime 과 짝). 화면 복귀가 잦은
      // 탭 구조에서 이게 켜져 있으면 staleTime 을 줘도 로딩이 다시 뜬다.
      // ★디스크에서 복원한 데이터(BOOT_TIME 이전)만은 처음 마운트될 때 조용히 다시 받는다 —
      // 안 그러면 어제 목록이 그대로 굳는다. 화면엔 복원본이 먼저 보이고 바꿔치기된다.
      refetchOnMount: query => query.state.dataUpdatedAt < BOOT_TIME,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function ReactQueryProvider({children}: {children: React.ReactNode}) {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    /**
     * 토큰 갱신을 복원과 **동시에** 시작한다. 예전엔 복원(최대 800ms)이 끝나 화면이 마운트된 뒤에야
     * useAuth 가 갱신을 걸었고, 홈 쿼리(access token)는 그 왕복을 또 기다렸다(waitForInitialAuth).
     * 같은 키라 useAuth 는 진행 중인 요청을 그대로 이어받는다. 복원 스냅숏엔 auth 가 없어(PERSISTED_ROOTS)
     * hydrate 와 부딪히지 않는다. refresh token 이 없으면 걸지 않는다 — 곧 거절될 요청을 두 번 보내지 않게.
     */
    getAsyncStorage(StorageKey.REFRESH_TOKEN)
      .then(token => {
        if (token) {
          queryClient.prefetchQuery(AuthQueries.loginByRefreshToken());
        }
      })
      .catch(() => {});

    const done = () => setRestored(true);
    const timer = setTimeout(done, RESTORE_TIMEOUT_MS);
    restoreQueryCache(queryClient).finally(() => {
      clearTimeout(timer);
      done();
    });
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') saveQueryCache(queryClient);
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* 복원 전에 화면을 그리면 빈 캐시로 첫 요청이 먼저 나간다. 그동안은 스플래시가 덮고 있다. */}
      {restored ? children : null}
    </QueryClientProvider>
  );
}

export default ReactQueryProvider;
