import {
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  formatHubCount,
  KEYWORD_HUB_MIN_DEALS,
  KEYWORD_HUB_WINDOW_DAYS,
} from '@jirum/domain/keyword-hub';

import type { KeywordHub } from '@/shared/api/keyword-hub';

// 문장·숫자 규칙(건수·리듬·한 줄 소개·허브 주소)은 앱과 같은 말을 해야 해서 @jirum/domain 이 정본이다(2026-10-17 앱 허브 화면).
// 여기엔 web 만 쓰는 것 — 제목 매칭(제외어 포함)·SEO 제목·설명 — 만 둔다.
export {
  buildKeywordHubFacts,
  describeKeywordHubRhythm,
  findKeywordHubForQuery,
  findKeywordHubsForTitle,
  findThemesForHub,
  formatHubCount,
  KEYWORD_HUB_MIN_DEALS,
  KEYWORD_HUB_WINDOW_DAYS,
  keywordHubPath,
  matchesKeywordHub,
} from '@jirum/domain/keyword-hub';
export type { KeywordHubMatchTerms as KeywordHubTerms } from '@jirum/domain/keyword-hub';

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
type HubRhythm = Pick<KeywordHub, 'name' | 'activeDays' | 'topSources'>;
type HubCount = Pick<KeywordHub, 'recentDealCount' | 'countCapped'>;

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
  const lead = `${buildKeywordHubLead(hub)}${count > 0 ? latestText : ''}`;

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
