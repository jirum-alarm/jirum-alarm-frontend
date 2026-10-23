/**
 * 키워드 탭 «내 키워드 상황판»(web /keywords MyKeywordsSection · 앱 KeywordsTabScreen) — 카드 한 장이
 * «이 키워드가 지금 어떤가»를 말하는 규칙. web·앱이 같은 숫자·같은 말을 해야 해서 여기 한 곳에 둔다.
 *
 * 왜(2026-10-23): 키워드 탭은 10/20 하단 탭이 된 뒤에도 공개 허브 목록(카탈로그)이라 사흘간 앱 사용자 18명만 열었고
 * 탭에서 허브로 간 건 1명이었다. 키워드 등록자의 74% 는 푸시 받을 통로가 없어 «걸어 둔 키워드가 일하고 있다»를 볼 자리가
 * 없었다(vault 2026-10-21 실측). 그래서 탭의 본체를 «내 키워드가 잡은 최근 딜 + 지금 사기 좋은가»로 바꾼다.
 *
 * 숫자는 서버 keywordDealFrequencies(키워드 알림과 같은 매칭·같은 커뮤니티 풀): dealCount(90일)·lastDealAt·weekDealCount(7일)·
 * recentDeals(최신 N). 가격 판정(1년 최저가·기준가 대비)은 서버가 카드 필드로 준다 — 여기는 그걸 세고 말로 바꿀 뿐
 * «싸다»를 새로 판정하지 않는다(frontend-judgment-boundary).
 */

export type KeywordBoardDeal = {
  id: string | number;
  isEnd?: boolean | null;
  /** 지난 1년 같은 상품 딜 중 가장 싼 신기록 — 서버가 끝난 딜은 false 로 준다. */
  isYearLowest?: boolean | null;
  /** 기준가(평소·쿠팡·다나와) 대비 할인율 — 서버가 끝난 딜은 null 로 준다. */
  priceSaving?: { basis: string; percent: number } | null;
};

export type KeywordBoardEntry = {
  keyword: string;
  /** 지난 windowDays 일 뜬 횟수(같은 날 같은 가격은 한 번). */
  dealCount: number;
  windowDays: number;
  /** 없으면(생성 타입이 optional) null 과 같다. */
  lastDealAt?: string | Date | null;
  /** 지난 7일 뜬 횟수. */
  weekDealCount: number;
  /** 최신순. */
  recentDeals: readonly KeywordBoardDeal[];
};

/** 카드가 보여 주는 최근 딜 수 — 서버 recentDeals(limit) 의 기본값과 같다. */
export const KEYWORD_BOARD_RECENT_LIMIT = 3;
/** 「이번 주 N건」 창 — 서버 weekDealCount 와 같은 7일. */
export const KEYWORD_BOARD_WEEK_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

const toMs = (at: string | Date | null | undefined): number | null => {
  if (at == null) return null;
  const ms = at instanceof Date ? at.getTime() : Date.parse(at);
  return Number.isNaN(ms) ? null : ms;
};

/** 지금 사기 좋은 딜 — 서버 배지(1년 최저가·기준가 대비)가 붙은 진행 중 딜. 배지 규칙은 product-card.ts 와 같다(percent > 0). */
export function isGoodDeal(deal: KeywordBoardDeal): boolean {
  return !deal.isEnd && (!!deal.isYearLowest || (deal.priceSaving?.percent ?? 0) > 0);
}

export type KeywordActivity = {
  /** today = 하루 안(강조), week = 이번 주, quiet = 이번 주엔 없음, none = 90일 동안 없음. */
  tone: 'today' | 'week' | 'quiet' | 'none';
  text: string;
};

/**
 * 카드 머리의 한 줄 — «얼마나 살아 있나». 날짜·건수는 게시 시각·매칭 횟수라 틀릴 일이 없어 그대로 말한다.
 * 90일 동안 0건이면 none — 화면은 이 자리에 «넓혀 받기»(keyword-frequency broadenSuggestion)를 붙인다.
 * lastLabel 은 호출부가 relative-time 의 relativeTimeLabel(entry.lastDealAt, now) 로 만든다 — 이 패키지는 모듈끼리
 * import 하지 않는다(테스트가 파일 하나씩 읽는다).
 */
export function describeKeywordActivity(
  entry: Pick<KeywordBoardEntry, 'dealCount' | 'windowDays' | 'lastDealAt' | 'weekDealCount'>,
  lastLabel: string | null,
  now: number = Date.now(),
): KeywordActivity {
  const last = toMs(entry.lastDealAt);
  if (last != null && now - last < DAY_MS && entry.weekDealCount > 0) {
    return { tone: 'today', text: `오늘 올라왔어요 · 이번 주 ${entry.weekDealCount}건` };
  }
  if (entry.weekDealCount > 0) {
    return {
      tone: 'week',
      text: `이번 주 ${entry.weekDealCount}건${lastLabel ? ` · 마지막 ${lastLabel}` : ''}`,
    };
  }
  if (entry.dealCount > 0) {
    return {
      tone: 'quiet',
      text: `이번 주엔 없었어요 · 최근 ${entry.windowDays}일 ${entry.dealCount}번${lastLabel ? ` · 마지막 ${lastLabel}` : ''}`,
    };
  }
  return { tone: 'none', text: `최근 ${entry.windowDays}일 동안 올라온 적이 없어요` };
}

/** 카드 순서 — 마지막 딜이 최근인 키워드부터, 딜이 없던 키워드는 맨 뒤(같으면 등록 순 그대로). */
export function sortKeywordBoard<T extends Pick<KeywordBoardEntry, 'lastDealAt'>>(entries: readonly T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index, at: toMs(entry.lastDealAt) ?? -1 }))
    .sort((a, b) => b.at - a.at || a.index - b.index)
    .map(({ entry }) => entry);
}

export type KeywordBoardSummary = {
  keywordCount: number;
  /** 이번 주 올라온 딜 합(키워드별 합 — 두 키워드에 같은 딜이 걸리면 두 번 센다). */
  weekDealCount: number;
  /** 최근 딜 중 지금 사기 좋은 딜(같은 딜은 한 번). */
  goodDealCount: number;
  /** 이번 주 딜이 있던 키워드 수. */
  activeKeywordCount: number;
};

export function summarizeKeywordBoard(entries: readonly KeywordBoardEntry[]): KeywordBoardSummary {
  const good = new Set<string>();
  let weekDealCount = 0;
  let activeKeywordCount = 0;
  for (const entry of entries) {
    weekDealCount += entry.weekDealCount;
    if (entry.weekDealCount > 0) activeKeywordCount += 1;
    for (const deal of entry.recentDeals) if (isGoodDeal(deal)) good.add(String(deal.id));
  }
  return { keywordCount: entries.length, weekDealCount, goodDealCount: good.size, activeKeywordCount };
}

/**
 * 상황판 머리말 — «내 키워드가 일하고 있다»를 숫자로. 푸시를 못 받는 사람(등록자의 74%)에게는 이 줄이 알림의 전부다.
 * 지금 사기 좋은 딜이 있으면 그걸 먼저 — 서비스의 답(«지금 사도 되나»)이 키워드 탭에서도 나오게.
 */
export function keywordBoardHeadline(summary: KeywordBoardSummary): { title: string; description: string } {
  if (summary.goodDealCount > 0) {
    return {
      title: `지금 사기 좋은 딜 ${summary.goodDealCount}건이 있어요`,
      description: `이번 주 내 키워드에 올라온 핫딜 ${summary.weekDealCount}건 중 1년 최저가거나 기준가보다 싼 딜이에요.`,
    };
  }
  if (summary.weekDealCount > 0) {
    return {
      title: `이번 주 내 키워드에 올라온 핫딜 ${summary.weekDealCount}건`,
      description: `키워드 ${summary.keywordCount}개 중 ${summary.activeKeywordCount}개에서 올라왔어요. 평소보다 싼 딜이 뜨면 카드에 표시해 드려요.`,
    };
  }
  return {
    title: '이번 주엔 조용했어요',
    description: `키워드 ${summary.keywordCount}개를 지켜보고 있어요. 올라오면 바로 알려드려요.`,
  };
}

/** 키워드 탭 문구 — web·앱이 같은 말. */
export const KEYWORD_BOARD_COPY = {
  mineTitle: '내 키워드',
  manage: '알림 관리',
  /** 공개 허브인 키워드 — 30일 모음으로. */
  hub: '모아보기',
  /** 허브가 아닌 키워드 — 지금 올라온 딜 검색으로. */
  search: '전체 보기',
  noRecent: '최근 올라온 딜이 없어요',
  emptyTitle: '키워드를 걸어 두면 핫딜이 올라올 때 알려드려요',
  emptyBody: '아래 키워드를 누르면 바로 걸리고, 이 자리에 최근 핫딜이 보여요.',
  recommendedTitle: '요즘 많이 받는 키워드',
  addMore: '직접 입력해서 걸기',
  /** 계정이 없는 웹 방문자. */
  guestTitle: '키워드를 걸어 두면 핫딜이 올라올 때 알려드려요',
  guestCta: '키워드 알림 걸기',
} as const;
