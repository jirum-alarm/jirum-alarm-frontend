/**
 * 발견 탭(실시간[핫딜만·전부]·랭킹)의 규칙 — 랭킹 기간·카테고리 칩 순서. web 발견 탭·앱 발견 탭이 같이 쓴다(2026-10-20 정본화,
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

/** 발견 탭이 보여 주는 세 화면 — 주소(/trending/live·hot·ranking)와 1:1. */
export type TrendingView = 'live' | 'hot' | 'ranking';

/**
 * 발견 탭 위 탭 — 「실시간」·「랭킹」 둘. view 는 그 탭을 누르면 여는 화면.
 * 「실시간」 안에서 「핫딜만」 칩을 켜면 hot(문턱 넘은 딜만 핫딜 된 시각순), 끄면 live(올라온 딜 전부 최신순).
 * ★왜(2026-10-24): 세 화면은 두 축이다 — 무엇을(전부·문턱 넘은 것) × 어떤 순서(시간·점수). 실시간과 핫딜만은
 * 순서가 같고 거르는 것만 달라 탭 둘로 두면 같은 목록이 두 번 보였다. 랭킹은 순서(점수)·순위 배지·기간이 달라 따로 둔다.
 * 「핫딜만」 기본 켬 — 뽐뿌 인기 탭이 유용한 건 «여러 사람이 고른 것만, 위가 최신»이라서다(실시간은 하루 ~1,200건).
 */
export const TRENDING_VIEW_TABS: readonly { view: TrendingView; label: string }[] = [
  { view: 'hot', label: '실시간' },
  { view: 'ranking', label: '랭킹' },
];

/** 이 화면이 어느 탭 소속인가 — 실시간(전부)·핫딜만은 둘 다 「실시간」 탭(TRENDING_VIEW_TABS 의 view = hot). */
export const trendingTabView = (view: TrendingView): TrendingView =>
  view === 'ranking' ? 'ranking' : 'hot';

/** 「실시간」 목록 위 칩·한 줄. 기준 정본은 서버 ranking-hot.ts — 왜 여기 있는지 보여 줘야 목록을 믿는다. */
export const HOT_FEED_COPY = {
  toggle: '핫딜만',
  lead: '사람들이 몰렸거나 평소보다 확실히 싼 딜만, 핫딜이 된 순서로 모았어요',
  liveLead: '올라온 딜 전부를 최신순으로 보여 드려요',
  empty: '지금 올라온 핫딜이 없어요',
} as const;

/** 「핫딜만」 한 번에 받는 카드 수(서버 상한 20). */
export const HOT_FEED_PAGE_SIZE = 20;

/** 「핫딜만」 카드의 노출·클릭 출처 — 백엔드 노출 집계(recordProductImpressions)와 GA4 가 이 문자열로 거른다. */
export const HOT_FEED_CARD_SOURCE = 'hot_feed' as const;

/**
 * 하단 「발견」을 눌렀을 때 갈 화면 — 랭킹을 보고 있으면 「실시간」(핫딜만), 그 밖(실시간·다른 탭)이면 랭킹.
 * web 하단 네비 링크와 앱 탭바(재탭 = 전환, 다른 탭에서 = 랭킹)가 이 규칙 하나를 쓴다.
 */
export const nextTrendingView = (current: TrendingView | null): TrendingView =>
  current === 'ranking' ? 'hot' : 'ranking';

/** 랭킹 목록 카드의 노출·클릭 출처. 백엔드 CTR 집계가 이 문자열로 거른다 — 갈리면 분모가 사라진다. */
export const RANKING_CARD_SOURCE = 'ranking_tab' as const;
