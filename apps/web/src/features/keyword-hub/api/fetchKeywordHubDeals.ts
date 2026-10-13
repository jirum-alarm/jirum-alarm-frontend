import { cache } from 'react';

import { ProductService } from '@/shared/api/product';

import {
  KEYWORD_HUB_WINDOW_DAYS,
  type KeywordHub,
  matchesKeywordHub,
} from '@/entities/keyword-hub/lib/keyword-hub';

const PAGE_SIZE = 50;
/** 검색 결과가 동의어로 넓어져도 이 페이지 수에서 멈춘다(허브 하나당 GraphQL 최대 4회, 30분 캐시). */
const MAX_PAGES = 4;
const REVALIDATE_SECONDS = 1800;

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 이만큼 넘게 최신으로 되뛰면 다음 묶음의 시작으로 본다(같은 묶음 안 순서 흔들림은 몇 시간). */
const TIER_RESTART_MS = 2 * DAY_MS;
const kstDayIndex = (d: Date) => Math.floor((d.getTime() + KST_OFFSET_MS) / DAY_MS);

/**
 * 허브에 실을 최근 딜.
 * windowDays = 받은 딜이 실제로 덮는 기간(일). 페이지 상한에 먼저 닿으면 30일이 아니다 — 세제·커피처럼
 * 하루 20건 넘게 걸리는 검색어는 200건이 8~9일치뿐이었다(2026-10-14 실측: 세제 30일 698건인데 제목엔
 * 「최근 30일 200건」). 건수·「며칠 올라왔나」는 이 기간으로 말해야 맞다. 검색 API 는 묶음마다 게시일 내림차순으로 준다
 * (아래 루프 주석) — 창 밖으로 넘어가면 멈춘다.
 * 공개 조회(public)라 cookies() 를 안 읽어 데이터 캐시가 된다. 실패하면 빈 목록(허브는 noindex 로 떨어진다).
 * generateMetadata 와 페이지가 같은 요청에서 두 번 부르므로 cache 로 묶는다.
 */
export const fetchKeywordHubDeals = cache(async (hub: KeywordHub) => {
  const since = new Date(Date.now() - KEYWORD_HUB_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const deals = [];
  let searchAfter: string[] | null | undefined;
  let complete = false;
  let oldest: Date | null = null;
  let prev: Date | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const data = await ProductService.getProducts(
        { limit: PAGE_SIZE, keyword: hub.name, startDate: since.toISOString(), searchAfter },
        { public: true, revalidate: REVALIDATE_SECONDS },
      );
      const items = data?.products ?? [];
      let reachedEnd = items.length < PAGE_SIZE;
      for (const item of items) {
        const posted = new Date(item.postedAt);
        if (posted < since) {
          reachedEnd = true;
          break;
        }
        // 검색 결과는 두 묶음이다 — 키워드가 그대로 있는 글이 창 끝까지 최신순으로 내려온 뒤, 넓힌(유사어) 묶음이
        // 다시 최신부터 시작한다(2026-10-14 갤럭시: 9/14 까지 내려오다 10/13 으로 되뛴다). 크게 되뛰면 첫 묶음이
        // 창을 다 덮었다는 뜻이라 기간은 30일로 말해도 된다. 둘째 묶음은 페이지가 남는 만큼 더 받는다.
        if (prev && posted.getTime() - prev.getTime() > TIER_RESTART_MS) complete = true;
        prev = posted;
        if (!oldest || posted < oldest) oldest = posted;
        if (matchesKeywordHub(item.title, hub)) deals.push(item);
      }
      if (reachedEnd) {
        complete = true;
        break;
      }
      searchAfter = items[items.length - 1]?.searchAfter;
      if (!searchAfter) {
        complete = true;
        break;
      }
    }
  } catch {
    // 일부만 받았으면 받은 만큼 쓴다.
  }

  // 실패로 끊겼거나 페이지 상한에 닿았으면 받은 것 중 가장 오래된 글까지가 덮은 기간이다.
  // 「올라온 날」을 KST 달력 날짜로 세므로 기간도 달력 날짜(가장 오래된 글의 날 ~ 오늘, 양끝 포함)로 센다 —
  // 경과 시간으로 세면 「최근 11일 중 13일」처럼 어긋났다.
  const windowDays =
    complete || !oldest
      ? KEYWORD_HUB_WINDOW_DAYS
      : Math.min(KEYWORD_HUB_WINDOW_DAYS, kstDayIndex(new Date()) - kstDayIndex(oldest) + 1);
  return { deals, windowDays };
});

export type KeywordHubDeal = Awaited<ReturnType<typeof fetchKeywordHubDeals>>['deals'][number];
