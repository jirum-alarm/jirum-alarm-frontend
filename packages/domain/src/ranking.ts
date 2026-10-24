/**
 * 발견 탭(실시간·핫딜만·랭킹)의 규칙 — 랭킹 기간·카테고리 칩 순서. web 발견 탭·앱 발견 탭이 같이 쓴다(2026-10-20 정본화,
 * 전엔 두 앱이 따로 들고 앱 테스트가 web 파일을 읽어 대조했다).
 * 날짜 계산(KST 자정 등)은 플랫폼 도구가 다르니 각 앱에서, «며칠 볼지»만 여기 있다.
 */

/** 딜이 드문 카테고리 — 3 화장품, 5 도서, 7 등산레저, 8 상품권, 10 육아. 3일로 자르면 랭킹이 빈다. */
export const SPARSE_RANKING_CATEGORY_IDS: readonly number[] = [3, 5, 7, 8, 10];

/** 랭킹을 며칠 전부터 볼지. categoryId null = 전체. */
export function rankingWindowDays(categoryId: number | null): number {
  return categoryId !== null && SPARSE_RANKING_CATEGORY_IDS.includes(categoryId) ? 60 : 3;
}

/**
 * 발견 탭 카테고리 칩 순서. 서버는 id 순으로 주지만 칩 줄만 이 순서로 다시 세운다
 * (키워드·관심 카테고리 화면은 서버 순서 그대로).
 *
 * ★왜(2026-10-13): GA4 웹 탭 이동 28일 실측 — 옆으로 넘기면 앞 탭을 거치므로 앞자리일수록 수가 부푸는데도
 * 디지털(9번째)이 3~8번째를 다 이겼고, 의류·잡화가 바로 앞 화장품의 2배, 도서는 5번째인데 9위였다.
 * 그 자리를 거슬러 이긴 것만 옮겼다. 육아는 화장품 뒤(사용자 지정). 기타는 인기와 무관하게 항상 끝.
 * 판독: crawling-server experiment-registry `trending-tab-order`.
 */
export const TRENDING_TAB_ORDER: readonly number[] = [1, 9, 2, 4, 6, 3, 10, 8, 7, 5]; // 컴퓨터·디지털·생활식품·의류잡화·가전가구·화장품·육아·상품권·등산레저·도서
const OTHER_CATEGORY_ID = 11; // 기타

const tabRankOf = (id: number) => {
  if (id === OTHER_CATEGORY_ID) return Number.MAX_SAFE_INTEGER;
  const index = TRENDING_TAB_ORDER.indexOf(id);
  // 새로 생긴 카테고리는 아는 것 뒤·기타 앞에(서버 순서 유지).
  return index === -1 ? TRENDING_TAB_ORDER.length : index;
};

export function orderTrendingCategories<T extends { id: number }>(categories: readonly T[]): T[] {
  return [...categories].sort((a, b) => tabRankOf(a.id) - tabRankOf(b.id));
}

/** 발견 탭이 보여 주는 세 화면. */
export type TrendingView = 'live' | 'hot' | 'ranking';

/**
 * 발견 탭 위 화면 탭 — 순서·이름 정본. 「핫딜만」은 전부(실시간)와 점수순(랭킹) 사이: 문턱을 넘은 딜만 시간순.
 * ★왜(2026-10-24): 뽐뿌 인기 탭이 유용한 건 «여러 사람이 고른 것만, 위가 최신»이라서다. 실시간은 하루 ~1,200건이라
 * 소음이고 랭킹은 점수를 섞어 왜 거기 있는지 안 보인다 — 그 사이가 비어 있었다(서버 hotDealFeedProducts).
 */
export const TRENDING_VIEW_TABS: readonly { view: TrendingView; label: string }[] = [
  { view: 'live', label: '실시간' },
  { view: 'hot', label: '핫딜만' },
  { view: 'ranking', label: '랭킹' },
];

/** 「핫딜만」 목록 위 한 줄 — 왜 여기 있는지(기준)를 보여 줘야 목록을 믿는다. 기준 정본은 서버 ranking-hot.ts. */
export const HOT_FEED_COPY = {
  lead: '사람들이 몰렸거나 평소보다 확실히 싼 딜만, 핫딜이 된 순서로 모았어요',
  empty: '지금 올라온 핫딜이 없어요',
} as const;

/** 「핫딜만」 한 번에 받는 카드 수(서버 상한 20). */
export const HOT_FEED_PAGE_SIZE = 20;

/** 「핫딜만」 카드의 노출·클릭 출처 — 백엔드 노출 집계(recordProductImpressions)와 GA4 가 이 문자열로 거른다. */
export const HOT_FEED_CARD_SOURCE = 'hot_feed' as const;

/**
 * 하단 「발견」을 눌렀을 때 갈 화면 — 랭킹을 보고 있으면 실시간, 그 밖(실시간·다른 탭)이면 랭킹.
 * web 하단 네비 링크와 앱 탭바(재탭 = 전환, 다른 탭에서 = 랭킹)가 이 규칙 하나를 쓴다.
 */
export const nextTrendingView = (current: TrendingView | null): TrendingView =>
  current === 'ranking' ? 'live' : 'ranking';

/** 랭킹 목록 카드의 노출·클릭 출처. 백엔드 CTR 집계가 이 문자열로 거른다 — 갈리면 분모가 사라진다. */
export const RANKING_CARD_SOURCE = 'ranking_tab' as const;
