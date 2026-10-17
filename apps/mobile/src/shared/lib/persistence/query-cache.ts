import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  dehydrate,
  hydrate,
  type DehydratedState,
  type QueryClient,
} from '@tanstack/react-query';
import type {MMKV} from 'react-native-mmkv';

/**
 * 화면 데이터 캐시를 디스크에 남겨, 다음 콜드 스타트에 **마지막으로 보던 목록을 바로** 그린다
 * (토스식 "켜자마자 보이고 조용히 갱신"). 예전엔 메모리 캐시뿐이라 켤 때마다 스켈레톤부터였다.
 *
 * - 저장: 앱이 백그라운드로 갈 때(iOS 는 백그라운드에서 죽인다 — 그 직전이 마지막 기회).
 * - 대상: 목록 화면 루트 키만. 상품 상세처럼 끝없이 늘어나는 키는 넣지 않는다. auth 는 절대 X.
 * - 무한 스크롤은 첫 페이지만 — 깊이 내린 페이지까지 남기면 용량만 커지고 복원 후 순서도 낡는다.
 * - 복원 데이터는 옛 시각을 달고 들어오므로 마운트 때 한 번 다시 받는다(refetchOnMount 참고).
 *
 * ★저장소 = MMKV(1.5.5~). 예전 AsyncStorage 는 비동기라 복원이 끝날 때까지 첫 화면을 막았다
 * (ReactQueryProvider 가 최대 800ms 기다림 — 스플래시가 그만큼 길었다). MMKV 는 동기로 읽어
 * 첫 렌더 전에 hydrate 가 끝나므로 기다릴 게 없다.
 * 네이티브 모듈이 없거나 깨지면(getStore 가 null) 캐시 없이 뜬다 — 캐시 때문에 앱이 안 뜨면 안 된다.
 */
const STORAGE_KEY = 'rq-cache';
// 다른 MMKV 쓰임(있다면)과 섞이지 않게 전용 인스턴스. 앱 비밀(토큰 등)은 여기 두지 않는다.
const MMKV_ID = 'query-cache';
// 1.5.4 까지 AsyncStorage 에 쓰던 같은 이름의 키 — 옮기지 않고 한 번 지운다(캐시일 뿐).
const LEGACY_ASYNC_KEY = 'rq-cache';
const LEGACY_DROPPED_FLAG = 'legacy-async-dropped';
// queryFn 이 서버 응답을 **가공하는 모양**을 바꿀 때 올린다 — 옛 모양 캐시가 새 화면을 깨지 않게.
const SCHEMA_VERSION = 1;
/**
 * GraphQL 문서(코드젠 gql.ts + 손으로 쓴 TypedDocumentString) 지문 — 쿼리 필드가 바뀌면 결과 모양도 바뀌므로 캐시를 버린다.
 * 손으로 맞출 필요 없다: 문서가 바뀌면 query-cache 테스트가 실패하며 새 값을 알려 준다(CI 가 OTA 전에 막는다).
 */
export const QUERY_DOCS_FINGERPRINT = 'ef942249b2d6';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// 복원은 첫 렌더 전에 **동기로** JSON.parse 한다 — 너무 크면 그만큼 첫 화면이 늦으니 상한을 둔다.
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

/**
 * 캐시를 버리는 기준 = **결과 모양**이 바뀌었을 때만.
 * ★예전엔 OTA updateId 를 넣었다 — main 푸시마다 자동 OTA 가 나가니 하루 한 번 켜는 사람은
 * 거의 매번 캐시가 버려져 스켈레톤부터 봤다(알림 → 상세 → 뒤로 가기도 빈 홈).
 */
const buster = () => `${SCHEMA_VERSION}:${QUERY_DOCS_FINGERPRINT}`;

// undefined = 아직 안 열어 봄, null = 열 수 없음(네이티브 모듈 없음 등) → 캐시 없이 동작.
let store: MMKV | null | undefined;
function getStore(): MMKV | null {
  if (store !== undefined) return store;
  try {
    // 지연 require — react-native-mmkv 는 import 만 해도 Nitro 네이티브 모듈을 찾아 없으면 던진다.
    const {createMMKV} =
      require('react-native-mmkv') as typeof import('react-native-mmkv');
    store = createMMKV({id: MMKV_ID});
  } catch (error) {
    console.log('query cache store unavailable:', error);
    store = null;
  }
  return store;
}

/** 테스트 전용 — 다음 getStore 가 저장소를 다시 열게 한다. */
export function resetQueryCacheStoreForTest(): void {
  store = undefined;
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

export function saveQueryCache(client: QueryClient): void {
  const mmkv = getStore();
  if (!mmkv) return;
  try {
    const snapshot: Snapshot = {
      buster: buster(),
      savedAt: Date.now(),
      state: toSnapshotState(client),
    };
    const json = JSON.stringify(snapshot);
    if (json.length > MAX_BYTES) {
      mmkv.remove(STORAGE_KEY);
      return;
    }
    mmkv.set(STORAGE_KEY, json);
  } catch (error) {
    console.log('query cache save error:', error);
  }
}

/**
 * **동기** 복원 — 첫 렌더 전에 부른다. 복원했으면 true.
 * 지문이 다르거나(옛 문서로 저장) 오래됐거나 깨진 캐시는 지우고 빈 채로 시작한다.
 */
export function restoreQueryCache(client: QueryClient): boolean {
  const mmkv = getStore();
  if (!mmkv) return false;
  try {
    const json = mmkv.getString(STORAGE_KEY);
    if (!json) return false;
    const snapshot: Snapshot = JSON.parse(json);
    if (
      snapshot.buster !== buster() ||
      Date.now() - snapshot.savedAt > MAX_AGE_MS
    ) {
      mmkv.remove(STORAGE_KEY);
      return false;
    }
    hydrate(client, snapshot.state);
    return true;
  } catch (error) {
    // 깨진 캐시는 버리고 빈 채로 시작한다 — 캐시 때문에 앱이 안 뜨면 안 된다.
    console.log('query cache restore error:', error);
    try {
      mmkv.remove(STORAGE_KEY);
    } catch {}
    return false;
  }
}

/**
 * 1.5.4 까지 AsyncStorage 에 남긴 캐시(최대 1MB)를 한 번 지운다. **이 키 하나만** —
 * 토큰·deviceId·설정 등 AsyncStorage 의 다른 키는 건드리지 않는다. 지웠으면 MMKV 에 표시해 다음부턴 안 부른다.
 */
export async function dropLegacyAsyncCache(): Promise<void> {
  const mmkv = getStore();
  try {
    if (mmkv?.getBoolean(LEGACY_DROPPED_FLAG)) return;
    await AsyncStorage.removeItem(LEGACY_ASYNC_KEY);
    mmkv?.set(LEGACY_DROPPED_FLAG, true);
  } catch (error) {
    console.log('legacy query cache drop error:', error);
  }
}

/** 로그아웃 — 다음 사람에게 이전 계정의 알림·키워드가 한 프레임도 보이지 않게. */
export const clearQueryCache = async (): Promise<void> => {
  try {
    getStore()?.remove(STORAGE_KEY);
  } catch {}
};

/**
 * 로그아웃·세션 거절 — **메모리** 캐시에서 계정 데이터를 버린다(auth 만 남긴다).
 *
 * 디스크(clearQueryCache)만 지우면 부족하다: 메모리에 남은 이전 계정의 알림·홈 추천·찜 표시가
 * 다음 백그라운드 진입 때 saveQueryCache 로 **디스크에 다시 쓰이고**, 다음 사람이 로그인하면 복원된다.
 * auth 는 남긴다 — 지우면 로그아웃 무효화와 겹쳐 갱신 재조회가 두 번 돈다(useLogout 주석).
 * 'auth' 는 AuthQueries.keys.all 의 루트(shared → entities 역참조를 피해 글자로 둔다).
 */
export function dropAccountQueries(client: QueryClient): void {
  client.removeQueries({predicate: query => query.queryKey[0] !== 'auth'});
}
