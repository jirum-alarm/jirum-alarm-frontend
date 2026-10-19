import { execute, type ExecuteOptions } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import {
  QueryCategorizedReactionKeywordsArgs,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryExpiringSoonHotDealProductsQuery,
  QueryExpiringSoonHotDealProductsQueryVariables,
  QueryGuestRecommendedHotDealsArgs,
  QueryGuestRecommendedHotDealsDocument,
  QueryHotDealRankingProductsArgs,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQuery,
  QueryProductsQueryVariables,
  TypedDocumentString,
} from '../gql/graphql';

export type ProductListQueryVariables = QueryProductsQueryVariables & {
  categoryIds?: number[] | null;
  providerId?: number | null;
  providerIds?: number[] | null;
  mallGroupId?: number | null;
};

// ponytail: 카드에 판매처를 노출하려고 목록 쿼리에 mallName 을 추가했다. codegen 이 이 레포에서
// 깨끗하게 돌지 않아(dev-api 는 운영보다 뒤처져 mallGroupId/providerIds 가 없고, 커밋된
// schema.graphql 은 반대로 priceDropOnly/role 이 없다) 생성 타입엔 mallName 이 없다.
// 위 ProductListQueryVariables 가 변수 쪽에 하는 것과 같은 보강을 결과 쪽에 한다.
// codegen 이 복구되면 지우면 된다. graphql() 로 만든 쿼리도 TypedDocumentString 으로 바꾸면
// 문서 문자열을 직접 소유해 같은 보강을 할 수 있다(아래 QueryExpiringSoonHotDealProducts).
export type ProductListResult = Omit<QueryProductsQuery, 'products'> & {
  products: (QueryProductsQuery['products'][number] & {
    mallName?: string | null;
    /** 랭킹 목록에서 같은 딜을 접으며 센 커뮤니티 수(서버 same-deal-collapse). 랭킹 아닌 목록은 null. */
    postedCommunityCount?: number | null;
    /** 급상승(서버 ranking/rising.ts). 랭킹 아닌 목록은 null. */
    isRising?: boolean | null;
  })[];
};

// crawling-server ProductsArgs.keyword @MaxLength(100)
const KEYWORD_MAX_LENGTH = 100;

const QueryProducts = new TypedDocumentString<ProductListResult, ProductListQueryVariables>(`
  query QueryProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryId: Int
    $categoryIds: [Int!]
    $keyword: String
    $thumbnailType: ThumbnailType
    $isEnd: Boolean
    $isHot: Boolean
    $providerId: Int
    $providerIds: [Int!]
    $mallGroupId: Int
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryId: $categoryId
      categoryIds: $categoryIds
      keyword: $keyword
      thumbnailType: $thumbnailType
      isEnd: $isEnd
      isHot: $isHot
      providerId: $providerId
      providerIds: $providerIds
      mallGroupId: $mallGroupId
    ) {
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
      provider {
        nameKr
      }
      searchAfter
      estimatedTotal
      postedCommunityCount
      isRising
      postedAt
    }
  }
`);

const QueryCommunityRandomRankingProducts = graphql(`
  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {
    communityRandomRankingProducts(count: $count, limit: $limit) {
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
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

const QueryProductKeywords = graphql(`
  query QueryProductKeywords {
    productKeywords
  }
`);

const QueryProductsByKeyword = graphql(`
  query QueryProductsByKeyword(
    $limit: Int!
    $searchAfter: [String!]
    $keyword: String!
    $orderBy: KeywordProductOrderType!
    $orderOption: OrderOptionType!
  ) {
    productsByKeyword(
      limit: $limit
      searchAfter: $searchAfter
      keyword: $keyword
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
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
      hotDealType
      isYearLowest
      provider {
        nameKr
      }
      # 토스 하루특가 배지(data.toss.todayDeal*·dealStatus·pageViewCount) — 20개에 ~14KB.
      data
      searchAfter
      postedAt
    }
  }
`);

const QueryCategorizedReactionKeywords = graphql(`
  query QueryCategorizedReactionKeywords($id: Int!) {
    categorizedReactionKeywords(id: $id) {
      lastUpdatedAt
      items {
        type
        name
        count
        tag
        role
      }
    }
  }
`);

const QueryHotDealRankingProducts = graphql(`
  query QueryHotDealRankingProducts($page: Int!, $limit: Int!) {
    hotDealRankingProducts(page: $page, limit: $limit) {
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
      hotDealType
      isYearLowest
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

// mallName 을 넣으려면 문서 문자열을 고쳐야 하는데 graphql() 로는 생성 맵 lookup 이 깨진다.
// 위 QueryProducts·QueryClusteredProducts 와 같은 TypedDocumentString + 인라인 타입 패턴으로
// 바꿔 문자열을 직접 소유한다. codegen 이 복구되면 graphql() 로 되돌릴 수 있다.
type ExpiringSoonResult = {
  expiringSoonHotDealProducts: (QueryExpiringSoonHotDealProductsQuery['expiringSoonHotDealProducts'][number] & {
    mallName?: string | null;
  })[];
};

const QueryExpiringSoonHotDealProducts = new TypedDocumentString<
  ExpiringSoonResult,
  QueryExpiringSoonHotDealProductsQueryVariables
>(`
  query QueryExpiringSoonHotDealProducts(
    $daysUntilExpiry: Int!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    expiringSoonHotDealProducts(
      daysUntilExpiry: $daysUntilExpiry
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      title
      mallId
      mallName
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      isYearLowest
      provider {
        nameKr
      }
      searchAfter
      postedAt
      earliestExpiryDate
    }
  }
`);

export const ProductListService = {
  async getProducts(variables: ProductListQueryVariables, opts?: ExecuteOptions) {
    // 서버가 keyword 100자 초과를 BAD_REQUEST 로 거절해 상세 렌더가 통째로 실패했다(Sentry 2026-10, 1천여 건).
    const keyword = variables.keyword?.trim().slice(0, KEYWORD_MAX_LENGTH) || undefined;
    return execute(QueryProducts, { ...variables, keyword }, opts).then((res) => res.data);
  },

  async getHotDealProductsRandom(variables: QueryCommunityRandomRankingProductsQueryVariables) {
    return execute(QueryCommunityRandomRankingProducts, variables).then((res) => res.data);
  },

  async getProductKeywords() {
    return execute(QueryProductKeywords).then((res) => res.data);
  },

  async getProductsByKeyword(variables: QueryProductsByKeywordQueryVariables) {
    return execute(QueryProductsByKeyword, variables).then((res) => res.data);
  },

  async getReactionKeywords(variables: QueryCategorizedReactionKeywordsArgs) {
    return execute(QueryCategorizedReactionKeywords, variables).then((res) => res.data);
  },

  async getHotDealRankingProducts(variables: QueryHotDealRankingProductsArgs) {
    return execute(QueryHotDealRankingProducts, variables).then((res) => res.data);
  },

  async getGuestRecommendedHotDeals(variables: QueryGuestRecommendedHotDealsArgs) {
    return execute(QueryGuestRecommendedHotDealsDocument, variables).then((res) => res.data);
  },

  async getExpiringSoonHotDealProducts(variables: QueryExpiringSoonHotDealProductsQueryVariables) {
    return execute(QueryExpiringSoonHotDealProducts, variables).then((res) => res.data);
  },
};
