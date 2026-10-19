import { isCrawlerBrowser } from '@/shared/config/user-agent';
import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

/** 상세 «언제 사나» 카드(waitCardForProduct) — 서버 WaitCardOutput 그대로. 대조군·excluded 는 내용 칸이 null. */
export type WaitCard = {
  arm: string;
  eligible: boolean;
  verdict: string | null;
  keyword: string | null;
  unit: string | null;
  goodPrice: number | null;
  goodDays: number | null;
  windowDays: number;
  dealCount: number | null;
  typicalGapDays: number | null;
  lastGoodAt: string | null;
  pageUnitPrice: number | null;
  watching: boolean;
};

const QueryFirstVisitSheetCopy = new TypedDocumentString<
  {
    firstVisitSheetCopy: {
      variant: string;
      dealCount: number | null;
      windowDays: number;
      keyword: string;
      broadened: boolean;
      keywordArm: string | null;
    };
  },
  { keyword: string; productId?: number }
>(`
  query QueryFirstVisitSheetCopy($keyword: String!, $productId: Int) {
    firstVisitSheetCopy(keyword: $keyword, productId: $productId) {
      variant
      dealCount
      windowDays
      keyword
      broadened
      keywordArm
    }
  }
`);

const QueryWaitCardForProduct = new TypedDocumentString<
  { waitCardForProduct: WaitCard | null },
  { productId: number }
>(`
  query QueryWaitCardForProduct($productId: Int!) {
    waitCardForProduct(productId: $productId) {
      arm
      eligible
      verdict
      keyword
      unit
      goodPrice
      goodDays
      windowDays
      dealCount
      typicalGapDays
      lastGoodAt
      pageUnitPrice
      watching
    }
  }
`);

const MutationAddWaitWatchForProduct = new TypedDocumentString<
  { addWaitWatchForProduct: { keyword: string; priced: boolean; created: boolean } },
  { productId: number }
>(`
  mutation MutationAddWaitWatchForProduct($productId: Int!) {
    addWaitWatchForProduct(productId: $productId) {
      keyword
      priced
      created
    }
  }
`);

const QueryCoupangSearchCta = new TypedDocumentString<
  { coupangSearchCta: { url: string; query: string; kind: 'aged' | 'nolink' } | null },
  { productId: number }
>(`
  query QueryCoupangSearchCta($productId: Int!) {
    coupangSearchCta(productId: $productId) {
      url
      query
      kind
    }
  }
`);

export const ProductExperimentService = {
  /** 첫 방문 시트 문구 A/B(first_visit_sheet_frequency_v1) — 서버가 기기(X-Device-Id)로 배정한다. */
  async getFirstVisitSheetCopy(keyword: string, productId?: number) {
    if (isCrawlerBrowser()) return null;
    return execute(QueryFirstVisitSheetCopy, { keyword, productId }).then(
      (res) => res.data?.firstVisitSheetCopy ?? null,
    );
  },

  /**
   * 상세 «언제 사나» 카드 A/B(wait_card_detail_v1) — 서버가 기기(X-Device-Id)로 배정하고 카드를 계산한다.
   * 시작 전(2026-11-05)·꺼짐이면 null. 대조군도 eligible·verdict 는 온다(그리지 않고 노출만 기록).
   */
  async getWaitCard(productId: number): Promise<WaitCard | null> {
    if (isCrawlerBrowser()) return null;
    return execute(QueryWaitCardForProduct, { productId }).then(
      (res) => res.data?.waitCardForProduct ?? null,
    );
  },

  /** 카드 「이 가격 오면 알려줘」 — 게스트 세션이 있어야 한다(useAlertSession 먼저). 서버가 기준가를 다시 정한다. */
  async addWaitWatchForProduct(productId: number) {
    return execute(MutationAddWaitWatchForProduct, { productId }).then(
      (res) => res.data?.addWaitWatchForProduct ?? null,
    );
  },

  // 딜 상세의 「쿠팡에서 지금 가격 보기」 — 오래된 딜(kind=aged, coupang_search_cta_v1)·링크 없는 새 딜(kind=nolink,
  // nolink_coupang_cta_v1). 대상이 아니거나 아직 링크가 없으면 null.
  // 부가 버튼이라 실패는 null.
  async getCoupangSearchCta(variables: { productId: number }) {
    // 실험 버튼(바깥 쇼핑몰 링크)이라 크롤러에겐 안 그린다 — 판독 표본도 사람만.
    if (isCrawlerBrowser()) return null;
    return execute(QueryCoupangSearchCta, variables)
      .then((res) => res.data?.coupangSearchCta ?? null)
      .catch(() => null);
  },
};
