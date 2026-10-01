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

/**
 * 허브에 실을 최근 딜. 검색 API 는 게시일 내림차순으로 준다(2026-10-01 실측) — 창 밖으로 넘어가면 멈춘다.
 * 공개 조회(public)라 cookies() 를 안 읽어 데이터 캐시가 된다. 실패하면 빈 목록(허브는 noindex 로 떨어진다).
 * generateMetadata 와 페이지가 같은 요청에서 두 번 부르므로 cache 로 묶는다.
 */
export const fetchKeywordHubDeals = cache(async (hub: KeywordHub) => {
  const since = new Date(Date.now() - KEYWORD_HUB_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const deals = [];
  let searchAfter: string[] | null | undefined;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const data = await ProductService.getProducts(
        { limit: PAGE_SIZE, keyword: hub.name, startDate: since.toISOString(), searchAfter },
        { public: true, revalidate: REVALIDATE_SECONDS },
      );
      const items = data?.products ?? [];
      let reachedEnd = items.length < PAGE_SIZE;
      for (const item of items) {
        if (new Date(item.postedAt) < since) {
          reachedEnd = true;
          break;
        }
        if (matchesKeywordHub(item.title, hub)) deals.push(item);
      }
      if (reachedEnd) break;
      searchAfter = items[items.length - 1]?.searchAfter;
      if (!searchAfter) break;
    }
  } catch {
    // 일부만 받았으면 받은 만큼 쓴다.
  }

  return deals;
});

export type KeywordHubDeal = Awaited<ReturnType<typeof fetchKeywordHubDeals>>[number];
