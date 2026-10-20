import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

import type { ProductListResult } from './product-list.service';

/** liveAlternativeDeals 한 줄. same=같은 상품(다른 곳·다른 값), related=같은 라인(용량·구성·색이 다름). */
export type LiveAlternativeDeal = {
  kind: 'same' | 'related';
  /** 이 딜 값 − 지금 보는 딜 값(원). 같은 상품·원화끼리만, 아니면 null. */
  priceDiff: number | null;
  product: ProductListResult['products'][number];
};

// Track B 클러스터 — 상세 "다른 커뮤니티 가격" 블록.
// ponytail: codegen 타입 생기기 전(dev-api 미배포)에도 빌드되도록 QueryProducts 와 같은
// TypedDocumentString + 인라인 타입 패턴. develop 배포 후 graphql() 로 치환 가능(동작 동일).
export interface ClusteredProduct {
  id: number;
  title: string;
  url: string;
  parsedPrice: number | null;
  priceCurrency: string | null;
  providerId: number;
  mallName: string | null;
  thumbnail: string | null;
  postedAt: string | null;
  provider: { nameKr: string | null } | null;
}
interface QueryClusteredProductsResult {
  clusteredProducts: ClusteredProduct[];
}
const QueryClusteredProducts = new TypedDocumentString<
  QueryClusteredProductsResult,
  { id: number }
>(`
  query QueryClusteredProducts($id: Int!) {
    clusteredProducts(id: $id) {
      id
      title
      url
      parsedPrice
      priceCurrency
      providerId
      mallName
      thumbnail
      postedAt
      provider {
        nameKr
      }
    }
  }
`);

// Meili 유사검색 폴백 — ClusteredProduct 와 동일 카드 필드(같은 UI 재사용).
// ponytail: ClusteredProduct 형태 그대로 재활용. url 은 similarProducts 리졸버가 안 줄 수 있어 옵셔널.
interface QuerySimilarProductsResult {
  similarProducts: ClusteredProduct[];
}
const QuerySimilarProducts = new TypedDocumentString<QuerySimilarProductsResult, { id: number }>(`
  query QuerySimilarProducts($id: Int!) {
    similarProducts(id: $id) {
      id
      title
      url
      parsedPrice
      priceCurrency
      providerId
      mallName
      thumbnail
      postedAt
      provider {
        nameKr
      }
    }
  }
`);

const QuerySameProductDeals = new TypedDocumentString<
  { sameProductDeals: ProductListResult['products'] },
  { id: number }
>(`
  query QuerySameProductDeals($id: Int!) {
    sameProductDeals(id: $id) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      mallName
      hotDealType
      isYearLowest
      priceSaving {
        basis
        percent
      }
      provider {
        nameKr
      }
      searchAfter
      estimatedTotal
      postedAt
    }
  }
`);

const QueryTossInternalLinks = new TypedDocumentString<
  { tossInternalLinks: ProductListResult['products'] },
  { id: number }
>(`
  query QueryTossInternalLinks($id: Int!) {
    tossInternalLinks(id: $id) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      mallName
      hotDealType
      isYearLowest
      priceSaving {
        basis
        percent
      }
      provider {
        nameKr
      }
      searchAfter
      estimatedTotal
      postedAt
    }
  }
`);

const QueryLiveAlternativeDeals = new TypedDocumentString<
  { liveAlternativeDeals: LiveAlternativeDeal[] },
  { id: number; limit?: number }
>(`
  query QueryLiveAlternativeDeals($id: Int!, $limit: Int) {
    liveAlternativeDeals(id: $id, limit: $limit) {
      kind
      priceDiff
      product {
        id
        title
        mallId
        url
        isHot
        isEnd
        price
        providerId
        categoryId
        category
        thumbnail
        mallName
        hotDealType
        isYearLowest
        priceSaving {
          basis
          percent
        }
        provider {
          nameKr
        }
        postedAt
      }
    }
  }
`);

const QueryLatestSimilarDeals = new TypedDocumentString<
  { latestSimilarDeals: ProductListResult['products'] },
  { id: number; limit?: number }
>(`
  query QueryLatestSimilarDeals($id: Int!, $limit: Int) {
    latestSimilarDeals(id: $id, limit: $limit) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      mallName
      hotDealType
      isYearLowest
      priceSaving {
        basis
        percent
      }
      provider {
        nameKr
      }
      searchAfter
      estimatedTotal
      postedAt
    }
  }
`);

export const ProductRelatedService = {
  // Track B: 같은 상품의 다른 커뮤니티 글(다나와 미매칭, 클러스터). 최저가순.
  async getClusteredProducts(variables: { id: number }) {
    return execute(QueryClusteredProducts, variables).then((res) => res.data);
  },

  // 동일상품 그룹의 진행 중 딜(최신순). 같은 그룹이면 어느 상세에서 열어도 같은 목록.
  // 부가 블록이라 실패는 빈 목록 — 백엔드 배포 전이거나 오류여도 키워드 결과는 그대로 뜬다.
  async getSameProductDeals(variables: { id: number }) {
    const empty = { sameProductDeals: [] as ProductListResult['products'] };
    return execute(QuerySameProductDeals, variables)
      .then((res) => res.data ?? empty)
      .catch(() => empty);
  },

  // 종료됐을 수 있는 딜의 '최신 핫딜' — 이 글보다 새 진행 중 딜 중 같은 상품 먼저, 같은 라인 뒤(서버가 무관 상품을 거른다).
  // 부가 블록이라 실패는 빈 목록.
  async getLatestSimilarDeals(variables: { id: number; limit?: number }) {
    const empty = { latestSimilarDeals: [] as ProductListResult['products'] };
    return execute(QueryLatestSimilarDeals, variables)
      .then((res) => res.data ?? empty)
      .catch(() => empty);
  },

  // 진행 중 딜의 「다른 곳 진행 중인 딜」 — 최근 7일 같은 상품(싼 순)·같은 라인(서버 live-alternative-deals.logic).
  // 부가 블록이라 실패는 빈 목록.
  async getLiveAlternativeDeals(variables: { id: number; limit?: number }) {
    const empty: { liveAlternativeDeals: LiveAlternativeDeal[] } = { liveAlternativeDeals: [] };
    return execute(QueryLiveAlternativeDeals, variables)
      .then((res) => res.data ?? empty)
      .catch(() => empty);
  },

  // 토스 상세의 「토스에서 함께 보는 상품」(실험 toss_internal_link_v1) — 토스 상품이 아니면 빈 목록.
  // 부가 블록이라 실패는 빈 목록.
  async getTossInternalLinks(variables: { id: number }) {
    const empty = { tossInternalLinks: [] as ProductListResult['products'] };
    return execute(QueryTossInternalLinks, variables)
      .then((res) => res.data ?? empty)
      .catch(() => empty);
  },

  // Meili 유사검색(상품명 기반 + 브랜드 충돌 필터). Track B 클러스터가 없을 때 폴백.
  async getSimilarProducts(variables: { id: number }) {
    return execute(QuerySimilarProducts, variables).then((res) => res.data);
  },
};
