import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  dehydrate,
  hydrate,
  type DehydratedState,
  type QueryClient,
} from '@tanstack/react-query';

/**
 * 화면 데이터 캐시를 디스크에 남겨, 다음 콜드 스타트에 **마지막으로 보던 목록을 바로** 그린다
 * (토스식 "켜자마자 보이고 조용히 갱신"). 예전엔 메모리 캐시뿐이라 켤 때마다 스켈레톤부터였다.
 *
 * - 저장: 앱이 백그라운드로 갈 때(iOS 는 백그라운드에서 죽인다 — 그 직전이 마지막 기회).
 * - 대상: 목록 화면 루트 키만. 상품 상세처럼 끝없이 늘어나는 키는 넣지 않는다. auth 는 절대 X.
 * - 무한 스크롤은 첫 페이지만 — 깊이 내린 페이지까지 남기면 용량만 커지고 복원 후 순서도 낡는다.
 * - 복원 데이터는 옛 시각을 달고 들어오므로 마운트 때 한 번 다시 받는다(refetchOnMount 참고).
 *
 * ponytail: persist-client 패키지 대신 내장 dehydrate/hydrate + AsyncStorage(둘 다 이미 있음).
 * 쓰기 throttle 이 필요해지면(백그라운드 저장만으로 부족하면) 그때 패키지로.
 */
const STORAGE_KEY = 'rq-cache';
// 쿼리 결과 모양이 바뀌는 변경을 내보낼 때 올린다 — 옛 모양 캐시가 새 화면을 깨지 않게.
const SCHEMA_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// Android AsyncStorage 한 항목은 ~2MB 에서 읽기가 깨진다 — 넉넉히 아래에서 포기한다.
const MAX_BYTES = 1_000_000;

const PERSISTED_ROOTS = new Set([
  'home',
  'trending',
  'category',
  'notification',
  'notification-theme',
  'mypage',
]);

type Snapshot = {
  buster: string;
  savedAt: number;
  state: DehydratedState;
};

/** OTA 가 바뀌면 캐시를 버린다 — 새 번들이 옛 모양 데이터를 받지 않게. */
function buster(): string {
  let updateId = 'embedded';
  try {
    // jest 는 expo-updates(ESM) 를 못 읽는다 — 앱에서만 실제 값이 나온다.
    updateId = require('expo-updates').updateId ?? 'embedded';
  } catch {}
  return `${SCHEMA_VERSION}:${updateId}`;
}

type InfiniteData = {pages: unknown[]; pageParams: unknown[]};
const isInfinite = (data: unknown): data is InfiniteData =>
  !!data &&
  typeof data === 'object' &&
  Array.isArray((data as InfiniteData).pages) &&
  Array.isArray((data as InfiniteData).pageParams);

export function toSnapshotState(client: QueryClient): DehydratedState {
  const state = dehydrate(client, {
    shouldDehydrateQuery: query =>
      query.state.status === 'success' &&
      PERSISTED_ROOTS.has(String(query.queryKey[0])),
  });
  return {
    ...state,
    queries: state.queries.map(q => {
      const data = q.state.data;
      if (!isInfinite(data) || data.pages.length <= 1) return q;
      return {
        ...q,
        state: {
          ...q.state,
          data: {
            pages: data.pages.slice(0, 1),
            pageParams: data.pageParams.slice(0, 1),
          },
        },
      };
    }),
  };
}

export async function saveQueryCache(client: QueryClient): Promise<void> {
  try {
    const snapshot: Snapshot = {
      buster: buster(),
      savedAt: Date.now(),
      state: toSnapshotState(client),
    };
    const json = JSON.stringify(snapshot);
    if (json.length > MAX_BYTES) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.log('query cache save error:', error);
  }
}

export async function restoreQueryCache(client: QueryClient): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return;
    const snapshot: Snapshot = JSON.parse(json);
    if (
      snapshot.buster !== buster() ||
      Date.now() - snapshot.savedAt > MAX_AGE_MS
    ) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    hydrate(client, snapshot.state);
  } catch (error) {
    // 깨진 캐시는 버리고 빈 채로 시작한다 — 캐시 때문에 앱이 안 뜨면 안 된다.
    console.log('query cache restore error:', error);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }
}

/** 로그아웃 — 다음 사람에게 이전 계정의 알림·키워드가 한 프레임도 보이지 않게. */
export const clearQueryCache = () =>
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
