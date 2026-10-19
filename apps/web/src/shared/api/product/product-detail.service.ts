import { execute, isNotFoundError } from '@/shared/lib/http-client';

import { graphql, useFragment } from '../gql';
import {
  ProductAdditionalInfoDocument,
  ProductAdditionalInfoFragmentDoc,
  ProductAdditionalInfoQueryVariables,
  ProductGuidesQueryVariables,
  ProductInfoDocument,
  ProductInfoFragmentDoc,
  ProductInfoQueryVariables,
  ProductQueryVariables,
  ProductStatsDocument,
  ProductStatsFragmentDoc,
  ProductStatsQueryVariables,
  QueryReportUserNamesQueryVariables,
  TypedDocumentString,
} from '../gql/graphql';

const QueryProduct = graphql(`
  query product($id: Int!) {
    product(id: $id) {
      id
      providerId
      category
      categoryId
      mallId
      title
      url
      detailUrl
      isHot
      isEnd
      price
      postedAt
      thumbnail
      wishlistCount
      positiveCommunityReactionCount
      negativeCommunityReactionCount
      author {
        id
        nickname
      }
      provider {
        id
        name
        nameKr
        host
      }
      viewCount
      mallName
      prices {
        id
        target
        type
        price
        createdAt
      }
      hotDealType
      isYearLowest
      hotDealIndex {
        id
        message
        highestPrice
        currentPrice
        lowestPrice
        visualConfig {
          markerPct
          q1Pct
          q3Pct
          medianPct
          isClustered
        }
      }
      isMyLike
      isMyReported
      likeCount
      dislikeCount
      isMyWishlist
      categoryName
    }
  }
`);

const QueryReportUserNames = graphql(`
  query QueryReportUserNames($productId: Int!) {
    reportUserNames(productId: $productId)
  }
`);

const QueryProductGuides = graphql(`
  query productGuides($productId: Int!) {
    productGuides(productId: $productId) {
      id
      title
      content
    }
  }
`);

export interface DealEvidenceItem {
  kind: 'HISTORY' | 'MARKET' | 'COMMUNITY';
  strength: 'STRONG' | 'MILD';
  title: string;
  /** title 안에서 강조할 부분 */
  highlight: string | null;
  detail: string | null;
}

export interface ProductDealEvidence {
  headline: DealEvidenceItem | null;
  /** 헤드라인과 종류가 다른 근거 한 줄 */
  support: string | null;
  /** 근거끼리 엇갈리거나 딜 상태가 바뀌었을 때 한 줄 */
  caveat: string | null;
  /** 가격 조건 한 줄(카드·쿠폰·적립·배송비·행사기간) */
  condition: string | null;
  /** 정보 표에서 뺄 가이드 행(조건 줄로 옮겼거나 제목·쇼핑몰·가격 반복) */
  hiddenGuideIds: string[];
}

interface QueryProductDealEvidenceResult {
  product: {
    id: number;
    dealEvidence: ProductDealEvidence | null;
  } | null;
}

const QueryProductDealEvidence = new TypedDocumentString<
  QueryProductDealEvidenceResult,
  { id: number }
>(`
  query QueryProductDealEvidence($id: Int!) {
    product(id: $id) {
      id
      dealEvidence {
        headline {
          kind
          strength
          title
          highlight
          detail
        }
        support
        caveat
        condition
        hiddenGuideIds
      }
    }
  }
`);

export const ProductDetailService = {
  async getProduct(variables: ProductQueryVariables) {
    return execute(QueryProduct, variables).then((res) => res.data);
  },

  async getProductInfo(variables: ProductInfoQueryVariables) {
    // 없는/만료 상품은 서버가 200+errors(status:404)로 주고 execute가 throw한다.
    // 이걸 예외로 전파하면 상세페이지 SSR 렌더가 통째로 터져(generateMetadata엔 notFound 가드 없음)
    // 무거운 에러 바운더리 재렌더로 CPU를 태운다. 404는 null로 흡수해 호출부 notFound() 경로로 보낸다.
    // (.then 유지: useFragment는 codegen 헬퍼라 hook 아님. await 후 직접 호출 시 rules-of-hooks 오탐.)
    return execute(ProductInfoDocument, variables)
      .then((res) => useFragment(ProductInfoFragmentDoc, res.data.product))
      .catch((error) => {
        if (isNotFoundError(error)) return null;
        throw error;
      });
  },

  async getProductStats(variables: ProductStatsQueryVariables) {
    return execute(ProductStatsDocument, variables).then((res) =>
      useFragment(ProductStatsFragmentDoc, res.data.product),
    );
  },

  async getProductAdditionalInfo(variables: ProductAdditionalInfoQueryVariables) {
    return execute(ProductAdditionalInfoDocument, variables).then((res) =>
      useFragment(ProductAdditionalInfoFragmentDoc, res.data.product),
    );
  },

  async getReportUserNames(variables: QueryReportUserNamesQueryVariables) {
    return execute(QueryReportUserNames, variables).then((res) => res.data);
  },

  async getProductGuides(variables: ProductGuidesQueryVariables) {
    return execute(QueryProductGuides, variables).then((res) => res.data);
  },

  /** 상세 '왜 핫딜인지' 근거 — 서버가 고른 결과를 그대로 그린다. headline 이 없으면 블록 미노출. */
  async getDealEvidence(variables: { id: number }) {
    return execute(QueryProductDealEvidence, variables).then(
      (res) => res.data?.product?.dealEvidence ?? null,
    );
  },
};
