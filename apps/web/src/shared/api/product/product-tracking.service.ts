import { isCrawlerBrowser } from '@/shared/config/user-agent';
import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import { MutationReportExpiredProductMutationVariables, TypedDocumentString } from '../gql/graphql';

// CTR 측정용 source/position 추가. codegen 전까지 변수 타입을 손으로 명시한 TypedDocumentString
// 으로 두고, codegen 후 graphql() 로 치환 가능(동작 동일).
// nid = 이 상세를 연 푸시의 발송 id(notification-origin) — 서버가 user_history 에 같이 적어 발송 → 열람을 잇는다.
const MutationCollectProduct = new TypedDocumentString<
  { collectProduct: boolean },
  { productId: number; source?: string | null; position?: number | null; nid?: string | null }
>(`
  mutation MutationCollectProduct($productId: Int!, $source: String, $position: Int, $nid: String) {
    collectProduct(productId: $productId, source: $source, position: $position, nid: $nid)
  }
`);

// 구매(수익링크) 버튼 클릭 — GA4 purchase_link_click 과 같은 순간 서버에도 남긴다(상품·그룹별 수요 신호).
const MutationCollectPurchaseClick = new TypedDocumentString<
  { collectPurchaseClick: boolean },
  { productId: number; source?: string | null; entry?: string | null; nid?: string | null }
>(`
  mutation MutationCollectPurchaseClick(
    $productId: Int!
    $source: String
    $entry: String
    $nid: String
  ) {
    collectPurchaseClick(productId: $productId, source: $source, entry: $entry, nid: $nid)
  }
`);

// 상세 가격 맥락(판정 카드·가격 추이) 노출/클릭. detail = '종류:근거'(노출) | '종류:요소'(클릭).
type PriceContextEventVariables = { productId: number; source: string; detail: string };

const MutationCollectPriceContextImpression = new TypedDocumentString<
  { collectPriceContextImpression: boolean },
  PriceContextEventVariables
>(`
  mutation MutationCollectPriceContextImpression($productId: Int!, $source: String, $detail: String!) {
    collectPriceContextImpression(productId: $productId, source: $source, detail: $detail)
  }
`);

const MutationCollectPriceContextClick = new TypedDocumentString<
  { collectPriceContextClick: boolean },
  PriceContextEventVariables
>(`
  mutation MutationCollectPriceContextClick($productId: Int!, $source: String, $detail: String!) {
    collectPriceContextClick(productId: $productId, source: $source, detail: $detail)
  }
`);

// 프론트 viewport(IntersectionObserver) 가 보고하는 노출 기록 (CTR 분모).
const MutationRecordProductImpressions = new TypedDocumentString<
  { recordProductImpressions: boolean },
  { source: string; impressions: { productId: number; position: number }[] }
>(`
  mutation MutationRecordProductImpressions(
    $source: String!
    $impressions: [ProductImpressionInput!]!
  ) {
    recordProductImpressions(source: $source, impressions: $impressions)
  }
`);

const MutationReportExpiredProduct = graphql(`
  mutation MutationReportExpiredProduct($productId: Int!) {
    reportExpiredProduct(productId: $productId)
  }
`);

export const ProductTrackingService = {
  async collectProduct(variables: {
    productId: number;
    source?: string | null;
    position?: number | null;
    nid?: string | null;
  }) {
    // 크롤러 렌더는 조회가 아니고(서버도 버린다) 요청 자체가 크롤 예산을 쓴다 — isCrawlerUA 주석.
    if (isCrawlerBrowser()) return null;
    return execute(MutationCollectProduct, variables).then((res) => res.data);
  },

  async collectPurchaseClick(variables: {
    productId: number;
    source?: string | null;
    entry?: string | null;
    nid?: string | null;
  }) {
    return execute(MutationCollectPurchaseClick, variables, { keepalive: true }).then(
      (res) => res.data,
    );
  },

  async collectPriceContextImpression(variables: PriceContextEventVariables) {
    if (isCrawlerBrowser()) return null;
    return execute(MutationCollectPriceContextImpression, variables).then((res) => res.data);
  },

  async collectPriceContextClick(variables: PriceContextEventVariables) {
    return execute(MutationCollectPriceContextClick, variables).then((res) => res.data);
  },

  async recordProductImpressions(variables: {
    source: string;
    impressions: { productId: number; position: number }[];
  }) {
    if (isCrawlerBrowser()) return null;
    return execute(MutationRecordProductImpressions, variables).then((res) => res.data);
  },

  async reportExpiredProduct(variables: MutationReportExpiredProductMutationVariables) {
    return execute(MutationReportExpiredProduct, variables).then((res) => res.data);
  },
};
