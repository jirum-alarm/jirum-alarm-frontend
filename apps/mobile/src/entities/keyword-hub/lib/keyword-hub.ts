/**
 * 키워드 허브 — 서버 등록부(crawling-server keyword_hub)의 공개 키워드. 검색어가 허브 키워드 자체면
 * 검색 결과 위에 "최근 30일 76건 · 30일 중 29일 · 주로 뽐뿌 62%" 를 띄우고, 누르면 허브 화면(KeywordHubScreen)으로 간다.
 * 문장 규칙은 @jirum/domain/keyword-hub 한 곳(웹·앱이 같은 숫자·같은 말을 해야 한다) — 여기서는 다시 내보내기만 한다.
 * 가격은 넣지 않는다: 같은 키워드라도 다른 상품·묶음이 섞여(생수 500ml 와 2L) "최저 N원" 은 틀린 주장이 된다.
 */
import {KEYWORD_HUB_MIN_DEALS} from '@jirum/domain/keyword-hub';

export {
  buildKeywordHubFacts,
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  findKeywordHubForQuery,
  formatHubCount,
  keywordHubPath,
  KEYWORD_HUB_MIN_DEALS,
  KEYWORD_HUB_WINDOW_DAYS,
} from '@jirum/domain/keyword-hub';

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
