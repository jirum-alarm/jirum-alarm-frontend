import {
  getAsyncStorage,
  removeAsyncStorage,
  setAsyncStorage,
} from '@/shared/lib/persistence';

/**
 * 최근 검색어 저장소. web: `localStorage['gr-recent-keywords']`
 * (useSearchInputViewModel 의 `setRecentKeyord` + RecentKeywords 의 삭제).
 *
 * ★web 의 값을 이어받지 못한다 — 웹뷰 localStorage 와 앱 AsyncStorage 는 다른
 * 저장소다. 검색 화면이 네이티브가 되는 순간 목록이 앱 전용으로 새로 쌓인다
 * (이관 경로를 만들려면 웹뷰를 한 번 띄워 읽어와야 하는데, 그 비용이 "최근
 * 검색어 10개"보다 크다).
 *
 * ponytail: 키를 `StorageKey` 상수 테이블에 올리지 않고 여기 둔다 — 이 값을 읽고
 * 쓰는 곳이 이 파일뿐이고, 그 파일은 이번 작업의 소유가 아니다
 * (선례: shared/lib/alarm-unread-snapshot.ts).
 */
const RECENT_KEYWORDS_KEY = 'recentSearchKeywords';

/** web RECENT_KEYWORDS_LIMIT 과 같은 10개. */
export const RECENT_KEYWORDS_LIMIT = 10;

/**
 * 검색어 하나를 목록 맨 앞에 넣는다(순수 함수 — 테스트에서 바로 돌린다).
 * web 과 같은 규칙: 이미 있으면 지우고 맨 앞으로, 10개까지만 남긴다.
 */
export function addRecentKeyword(list: string[], keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed) return list;
  return [trimmed, ...list.filter(k => k !== trimmed)].slice(
    0,
    RECENT_KEYWORDS_LIMIT,
  );
}

/** 검색어 하나 삭제. web 의 칩 X 버튼. */
export function removeRecentKeyword(list: string[], keyword: string): string[] {
  return list.filter(k => k !== keyword);
}

/** 저장된 목록. 형식이 깨졌으면 빈 목록으로 취급한다(화면이 죽는 쪽이 더 나쁘다). */
export async function loadRecentKeywords(): Promise<string[]> {
  try {
    const stored = await getAsyncStorage(RECENT_KEYWORDS_KEY);
    if (!Array.isArray(stored)) return [];
    return stored.filter((k): k is string => typeof k === 'string');
  } catch {
    return [];
  }
}

/** 디스크 쓰기 실패가 검색을 막아서는 안 된다 — 화면 state 가 이미 정답이다. */
export async function saveRecentKeywords(list: string[]): Promise<void> {
  try {
    if (list.length === 0) {
      await removeAsyncStorage(RECENT_KEYWORDS_KEY);
      return;
    }
    await setAsyncStorage(RECENT_KEYWORDS_KEY, list);
  } catch {
    // 무시.
  }
}
