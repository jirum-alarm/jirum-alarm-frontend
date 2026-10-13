import type { KeywordHub } from '@/shared/api/keyword-hub';

/**
 * 키워드 허브(`/keywords/{slug}`) — "삼다수 핫딜" 같은 검색어 그대로의 모음 페이지.
 *
 * 왜: 네이버 "X 핫딜" 질의 상위는 검색어 모양 허브를 가진 사이트다(덥석 `/keywords/신라면` 이 1위,
 * 2026-10-01 실측). 우리 모델 허브(`/deals/농심-신라면`)는 카탈로그 슬러그라 짧은 질의와 안 맞고,
 * 90일 동안 네이버 클릭 0건이었다. 노출 리포트상 의도어 검색 CTR 은 순수 상품명의 2배다.
 *
 * 목록의 주인은 서버(crawling-server keyword_hub)다 — 2026-10-14 이 파일의 화이트리스트를 옮겼다. 목록 밖 키워드는
 * 페이지가 없다(404). 아무 검색어나 열면 얇은 페이지가 무한히 생기고 네이버 스팸 정책(2026-07 "저품질 대량 생성")에
 * 걸린다. 서버 배치가 알림 구독 상위에서 후보를 올리고, 30일 딜 표본이 정말 그 상품인지 판정한 것만 공개된다.
 * 이 파일은 그 목록을 받아 쓰는 순수 함수만 둔다.
 */
export type KeywordHubTerms = Pick<KeywordHub, 'slug' | 'name' | 'aliases' | 'excludes'>;

/** 서버 통계 창과 같은 값. 제목의 "최근 N일 M건" 도 이 창이다. */
export const KEYWORD_HUB_WINDOW_DAYS = 30;
/** 이보다 적으면 noindex — 얇은 허브를 색인에 내지 않는다(링크는 따라가게 follow). */
export const KEYWORD_HUB_MIN_DEALS = 5;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/**
 * 제목이 이 허브의 상품인가. 서버(crawling-server keyword-hub-match.ts)와 같은 규칙 — 상세에서 링크한 허브에
 * 그 딜이 안 보이면 이상하니, 바꾸면 양쪽을 같이 바꾼다.
 */
export function matchesKeywordHub(title: string, hub: KeywordHubTerms): boolean {
  const t = norm(title);
  if (hub.excludes?.some((x) => t.includes(norm(x)))) return false;
  return [hub.name, ...(hub.aliases ?? [])].some((term) => t.includes(norm(term)));
}

/** 상세 → 허브 링크용. 제목에 걸리는 허브(최대 n개, 목록 순서 = 30일 딜 많은 순). */
export function findKeywordHubsForTitle<T extends KeywordHubTerms>(
  title: string,
  hubs: T[],
  max = 2,
): T[] {
  return hubs.filter((h) => matchesKeywordHub(title, h)).slice(0, max);
}

/** 검색어가 허브 키워드 자체인가("삼다수", "플스 5"). 포함이 아니라 같음 — "삼다수 2L" 는 검색 결과가 더 맞다. */
export function findKeywordHubForQuery<T extends KeywordHubTerms>(
  query: string | null | undefined,
  hubs: T[],
): T | undefined {
  const q = norm(query ?? '');
  if (!q) return undefined;
  return hubs.find((h) => [h.slug, h.name, ...(h.aliases ?? [])].some((term) => norm(term) === q));
}

export function keywordHubPath(hub: Pick<KeywordHub, 'slug'>): string {
  return `/keywords/${encodeURIComponent(hub.slug)}`;
}

type HubCount = Pick<KeywordHub, 'recentDealCount' | 'countCapped'>;

/** "76건" / 상한에 걸렸으면 "300건+". */
export function formatHubCount(hub: HubCount): string {
  return `${hub.recentDealCount.toLocaleString()}건${hub.countCapped ? '+' : ''}`;
}

type HubRhythm = Pick<KeywordHub, 'name' | 'activeDays' | 'topSources'>;

/**
 * 이 키워드 핫딜이 얼마나 자주·어디에 올라오나 — 「최근 30일 중 29일 올라왔어요」 + 빈도에 맞는 권유.
 * 날짜·출처는 게시 시각·수집처라 틀릴 일이 없어 그대로 말해도 된다. 같은 딜을 여러 곳에 올려도 「올라온 날」은 하루
 * (서버가 KST 달력 날짜로 센다). 가격은 쓰지 않는다: 같은 키워드라도 다른 상품·묶음이 섞여(생수 500ml 와 2L)
 * "최저 N원" 은 틀린 주장이 된다. 딜이 없으면 null.
 */
export function describeKeywordHubRhythm(hub: HubRhythm) {
  if (hub.activeDays <= 0) return null;
  const windowDays = KEYWORD_HUB_WINDOW_DAYS;
  const often = hub.activeDays >= Math.round(windowDays * 0.7);
  return {
    headline: `최근 ${windowDays}일 중 ${hub.activeDays}일 올라왔어요`,
    advice: often
      ? `${hub.name} 핫딜은 거의 매일 올라와요. 급하지 않다면 알림을 걸어 두고 마음에 드는 딜을 골라도 돼요.`
      : `${hub.name} 핫딜은 매일 올라오지는 않아요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.`,
    sources: hub.topSources.map((src) => `${src.name} ${src.share}%`).join(' · '),
  };
}

/** 검색 요약 카드·앱 요약 줄용 짧은 조각 — 「30일 중 29일 · 주로 뽐뿌 62%」. */
export function buildKeywordHubFacts(hub: HubRhythm): string[] {
  const facts: string[] = [];
  if (hub.activeDays > 0) facts.push(`${KEYWORD_HUB_WINDOW_DAYS}일 중 ${hub.activeDays}일`);
  const top = hub.topSources[0];
  if (top) facts.push(`주로 ${top.name} ${top.share}%`);
  return facts;
}

type HubDeal = {
  title: string;
  price?: string | null;
  postedAt: string | Date;
  provider?: { nameKr?: string | null } | null;
};

function formatKstMonthDay(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

/**
 * 허브 제목·설명. 건수·올라온 날은 서버 배치 통계(최근 30일, 종료 포함)다. 최저가는 넣지 않는다 — 원값에 오독이 많다
 * (삼다수 "4,320원"은 25,920원 딜을 잘못 읽은 값, 2026-10-01 실측).
 */
export function buildKeywordHubSeo(hub: HubRhythm & HubCount, deals: HubDeal[]) {
  const count = hub.recentDealCount;
  const countText = formatHubCount(hub);
  const title =
    count > 0
      ? `${hub.name} 핫딜 모음 · 최근 ${KEYWORD_HUB_WINDOW_DAYS}일 ${countText} | 지름알림`
      : `${hub.name} 핫딜 모음 | 지름알림`;

  // 화면 목록은 진행 중 먼저라, "가장 최근 딜"은 게시일로 따로 고른다.
  const latest = deals.reduce<HubDeal | undefined>(
    (acc, d) => (!acc || new Date(d.postedAt) > new Date(acc.postedAt) ? d : acc),
    undefined,
  );
  const latestText = latest
    ? (() => {
        const posted = new Date(latest.postedAt);
        const meta = [
          latest.provider?.nameKr?.trim(),
          Number.isNaN(posted.getTime()) ? null : formatKstMonthDay(posted),
        ]
          .filter(Boolean)
          .join(' · ');
        // 원문 제목에 가격이 이미 있으면("… 14,980원") 다시 붙이지 않는다.
        const price =
          latest.price && !latest.title.includes(latest.price.replace(/원$/, ''))
            ? ` ${latest.price}`
            : '';
        return ` 가장 최근 딜은 ${latest.title}${price}${meta ? `(${meta})` : ''}.`;
      })()
    : '';

  // 토스·네이버쇼핑 같은 쇼핑몰 특가도 섞여 있다(커뮤니티만이 아니다).
  const lead =
    count > 0
      ? `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 동안 커뮤니티·쇼핑몰 특가에 올라온 ${hub.name} 핫딜 ${countText}을 모았어요.${latestText}`
      : `커뮤니티·쇼핑몰 특가에 올라오는 ${hub.name} 핫딜을 모아 보여드려요.`;

  // 설명(검색결과 스니펫)엔 「며칠 올라왔나」를 덧붙인다 — 건수보다 「얼마나 자주」가 기다릴지 정하는 데 쓰인다.
  const rhythm = describeKeywordHubRhythm(hub);

  return {
    title,
    lead,
    rhythm,
    description: `${lead}${rhythm ? ` ${rhythm.headline}.` : ''} ${hub.name} 핫딜이 올라오면 바로 받아보게 키워드 알림도 걸어두세요.`,
    indexable: count >= KEYWORD_HUB_MIN_DEALS,
  };
}
