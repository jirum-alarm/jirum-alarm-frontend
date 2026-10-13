/**
 * 키워드 허브 — 서버 등록부(crawling-server keyword_hub)의 공개 키워드. 검색어가 허브 키워드 자체면
 * 검색 결과 위에 "최근 30일 76건 · 30일 중 29일 · 주로 뽐뿌 62%" 를 띄운다.
 * web entities/keyword-hub/lib/keyword-hub.ts 와 같은 규칙(값이 한 글자도 다르면 안 된다 — 웹·앱이 같은 숫자를 말해야 한다).
 * 가격은 넣지 않는다: 같은 키워드라도 다른 상품·묶음이 섞여(생수 500ml 와 2L) "최저 N원" 은 틀린 주장이 된다.
 */
export type KeywordHubSummary = {
  slug: string;
  name: string;
  aliases?: string[] | null;
  recentDealCount: number;
  countCapped: boolean;
  /** 최근 30일(KST 달력) 중 딜이 올라온 날 수. */
  activeDays: number;
  /** 많이 올라온 곳 최대 2곳(몫 15%+), share 는 %. */
  topSources: {name: string; share: number}[];
};

export const KEYWORD_HUB_WINDOW_DAYS = 30;
export const KEYWORD_HUB_MIN_DEALS = 5;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** 검색어가 허브 키워드 자체인가("삼다수", "플스 5"). 포함이 아니라 같음 — "삼다수 2L" 는 검색 결과가 더 맞다. */
export function findKeywordHubForQuery<T extends KeywordHubSummary>(
  query: string | null | undefined,
  hubs: T[],
): T | undefined {
  const q = norm(query ?? '');
  if (!q) return undefined;
  return hubs.find(h =>
    [h.slug, h.name, ...(h.aliases ?? [])].some(term => norm(term) === q),
  );
}

/** "76건" / 수집 상한에 걸렸으면 "300건+". */
export function formatHubCount(
  hub: Pick<KeywordHubSummary, 'recentDealCount' | 'countCapped'>,
): string {
  return `${hub.recentDealCount.toLocaleString()}건${
    hub.countCapped ? '+' : ''
  }`;
}

/** 「30일 중 M일 · 주로 X N%」 — 얼마나 자주·주로 어디에. 같은 딜이 여러 곳에 올라와도 하루로 센다(서버). */
export function buildKeywordHubFacts(
  hub: Pick<KeywordHubSummary, 'activeDays' | 'topSources'>,
): string[] {
  const facts: string[] = [];
  if (hub.activeDays > 0) {
    facts.push(`${KEYWORD_HUB_WINDOW_DAYS}일 중 ${hub.activeDays}일`);
  }
  const top = hub.topSources[0];
  if (top) facts.push(`주로 ${top.name} ${top.share}%`);
  return facts;
}

/** 추천 검색어 — 30일 딜이 충분한 허브 중 무작위 n개(web RecommendationKeywords 와 같은 규칙). */
export function pickRecommendedKeywords(
  hubs: Pick<KeywordHubSummary, 'name' | 'recentDealCount'>[],
  count: number,
  random: () => number,
): string[] {
  return hubs
    .filter(h => h.recentDealCount >= KEYWORD_HUB_MIN_DEALS)
    .map(h => h.name)
    .sort(() => 0.5 - random())
    .slice(0, count);
}
