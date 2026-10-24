/**
 * 검색 화면의 정본 — 필터 후보·라벨·기간 계산·크기·문구. web(widgets/search)과 앱(screens/search)이 같이 쓴다.
 * 전엔 두 앱이 같은 값을 따로 들고 앱 search-parity 테스트가 web 파일 17개를 읽어 대조했다(2026-10-20 정본화).
 * 필터 상태를 어디에 두나(web = URL, 앱 = 화면 state)는 플랫폼마다 다르고, 값과 규칙만 여기 있다.
 */

export const SEARCH_SORTS = ['recent', 'comments', 'relevance'] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const SEARCH_PERIODS = ['all', '1d', '7d', '30d'] as const;
export type SearchPeriod = (typeof SEARCH_PERIODS)[number];

export const SORT_LABELS: Record<SearchSort, string> = {
  recent: '최신순',
  comments: '댓글 많은 순',
  relevance: '정확도순',
};

export const PERIOD_LABELS: Record<SearchPeriod, string> = {
  all: '전체 기간',
  '1d': '오늘',
  '7d': '이번 주',
  '30d': '한 달',
};

/** 기간 → 몇 시간 전부터. 'all' 은 기간 필터 없음. */
export const PERIOD_HOURS: Record<Exclude<SearchPeriod, 'all'>, number> = {
  '1d': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

/**
 * 기간 → startDate. **지금부터 N시간 전**(롤링) — 자정 절단이 아니다('오늘'에 어제 0시부터가 나오던 것).
 * ⚠️결과를 queryKey 에 넣지 말 것 — 호출 시각이 들어가 렌더마다 키가 바뀐다(web 은 기간이 바뀔 때만 다시 계산).
 */
export function periodStartDate(
  period: SearchPeriod,
  now: number = Date.now(),
): string | undefined {
  if (period === 'all') return undefined;
  return new Date(now - PERIOD_HOURS[period] * 60 * 60 * 1000).toISOString();
}

/** 초기화 버튼을 보일지 — 정렬은 '적용된 필터'로 세지 않는다. */
export function hasActiveSearchFilters(filters: {
  categoryIds: readonly number[];
  providerIds: readonly number[];
  ended: boolean;
  period: SearchPeriod;
}): boolean {
  return (
    filters.categoryIds.length > 0 ||
    filters.providerIds.length > 0 ||
    filters.ended ||
    filters.period !== 'all'
  );
}

/** 검색 결과 한 페이지. */
export const SEARCH_PAGE_SIZE = 20;
/** 최근 검색어 보관 개수. */
export const RECENT_KEYWORDS_LIMIT = 10;
/** 추천 검색어(서버 키워드 허브에서 고름) 보여 줄 개수. */
export const RECOMMENDED_KEYWORD_COUNT = 5;
/** 자동완성 개수. */
export const SUGGESTION_LIMIT = 10;
/** 결과 총량 표기 캡 — Meili estimatedTotal 이 이 값에서 멈춰 「5,000건+」로 적는다. */
export const ESTIMATED_TOTAL_CAP = 5000;

const HAS_KOREAN = /[가-힣]/;
/** 자동완성을 부를 최소 길이 — 완성된 한글 음절이 있으면 1자, 그 밖(영문·숫자·자모만)은 2자. */
export const MIN_PREFIX_LENGTH_KOREAN = 1;
export const MIN_PREFIX_LENGTH_OTHER = 2;

export function isPrefixValid(prefix: string): boolean {
  const trimmed = prefix.trim();
  if (!trimmed) return false;
  return HAS_KOREAN.test(trimmed)
    ? trimmed.length >= MIN_PREFIX_LENGTH_KOREAN
    : trimmed.length >= MIN_PREFIX_LENGTH_OTHER;
}

/** 검색 화면 문구. */
export const SEARCH_COPY = {
  placeholder: '핫딜 상품을 검색해주세요',
  noResult: '검색 결과가 없어요',
  /** 필터 때문에 0건 — 두 줄(web <br/>, 앱 \n). 상품이 없다고 말하지 않는다(풀 수 있는 필터가 있다). */
  noFilteredResult: [
    '선택한 필터에 맞는 결과가 없어요.',
    '필터를 조정하면 더 많은 딜을 볼 수 있어요.',
  ],
} as const;

/** 정렬 → 서버 orderBy(ProductOrderType 값). 'recent' 는 안 보낸다(서버 기본이 최신순 — keyword 가 있으면 나머지 orderBy 는 무시된다). */
export function searchOrderBy(sort: SearchSort): 'RELEVANCE' | 'COMMENT_COUNT' | undefined {
  if (sort === 'relevance') return 'RELEVANCE';
  if (sort === 'comments') return 'COMMENT_COUNT';
  return undefined;
}

/**
 * 검색 결과 쿼리의 필터 변수 — web 목록·앱 목록이 같은 값을 보낸다. 빈 칩 목록은 안 보내고,
 * 「품절 포함」은 ON 일 때만 isEnd: true(서버에서 true 는 «종료 포함»). startDate 는 기간이 바뀔 때만 다시 잡게 밖에서 받는다.
 */
export function searchFilterVariables(
  filters: {
    categoryIds: number[];
    providerIds: number[];
    ended: boolean;
    sort: SearchSort;
    /** 오타 교정 없이 입력 그대로 — 교정 안내의 「‘원래’ 그대로 검색」이 켠다. 새 검색이면 다시 꺼진다. */
    exact?: boolean;
  },
  startDate: string | undefined,
) {
  return {
    categoryIds: filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
    providerIds: filters.providerIds.length > 0 ? filters.providerIds : undefined,
    startDate,
    isEnd: filters.ended ? true : undefined,
    orderBy: searchOrderBy(filters.sort),
    exactKeyword: filters.exact ? true : undefined,
  };
}

/**
 * 오타 교정 안내 — 서버가 0건·일부 일치 검색어를 사전 낱말로 고쳐 찾았을 때(응답 correctedKeyword) 결과 위 한 줄.
 * 「‘낫또’ 검색 결과예요 · ‘낫뗘’ 그대로 검색」. 둘째 조각은 exact 를 켜고 같은 검색어로 다시 찾는 링크(web)·버튼(앱).
 */
export const SEARCH_CORRECTED_COPY = {
  shown: (corrected: string) => `‘${corrected}’ 검색 결과예요`,
  searchOriginal: (original: string) => `‘${original}’ 그대로 검색`,
} as const;

/**
 * 진짜 0건일 때 같은 검색어를 종료 포함으로 한 번 더 세는 조회. limit 은 목록과 같은 쪽 크기 —
 * 서버가 검색 엔진에서 limit 만큼 받은 뒤 걸러 내서, 1로 물으면 첫 행이 걸러질 때 0건으로 오판한다.
 */
export const endedRescueVariables = (keyword: string) =>
  ({ limit: SEARCH_PAGE_SIZE, keyword, isEnd: true }) as const;

/** 검색 계측 이벤트 이름(GA4·GTM 이 이 문자열로 받는다). */
export const SEARCH_EVENT = {
  noResult: 'search_no_result',
  endedRescueClick: 'search_ended_rescue_click',
  /** 오타 교정 안내가 보였다(keyword=입력, corrected=교정어) / 「그대로 검색」을 눌렀다 */
  correctedView: 'search_corrected_view',
  correctedUndo: 'search_corrected_undo',
} as const;

/** 결과 위 한 줄 「'X' 새 핫딜, 놓치지 마세요 [알림 받기]」 — 키워드 뒤에 붙는 말. */
export const SEARCH_ALERT_BAR_COPY = {
  off: ' 새 핫딜, 놓치지 마세요',
  on: ' 새 핫딜을 알려드리고 있어요',
} as const;

/** 결과 위 한 줄의 알림 등록 출처(keyword_register source·keyword_prompt placement). */
export const SEARCH_BAR_SOURCE = 'search_bar' as const;
