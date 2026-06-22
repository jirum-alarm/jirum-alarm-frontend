import { execute } from '@/shared/lib/http-client';

import { graphql, useFragment } from '../gql';
import {
  CreateProductImageUploadUrlMutationVariables,
  CreateUserProductMutationVariables,
  MutationReportExpiredProductMutationVariables,
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
  QueryCategorizedReactionKeywordsArgs,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryExpiringSoonHotDealProductsArgs,
  QueryExpiringSoonHotDealProductsQueryVariables,
  QueryGuestRecommendedHotDealsArgs,
  QueryGuestRecommendedHotDealsDocument,
  QueryHotDealRankingProductsArgs,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQuery,
  QueryProductsQueryVariables,
  QueryReportUserNamesQueryVariables,
  TogetherViewedProductsQueryVariables,
  TypedDocumentString,
} from '../gql/graphql';

export type ProductListQueryVariables = QueryProductsQueryVariables & {
  providerId?: number;
  mallGroupId?: number;
};

export class ProductService {
  static async getProduct(variables: ProductQueryVariables) {
    return execute(QueryProduct, variables).then((res) => res.data);
  }

  static async getProductInfo(variables: ProductInfoQueryVariables) {
    return execute(ProductInfoDocument, variables).then((res) =>
      useFragment(ProductInfoFragmentDoc, res.data.product),
    );
  }

  static async getProductStats(variables: ProductStatsQueryVariables) {
    return execute(ProductStatsDocument, variables).then((res) =>
      useFragment(ProductStatsFragmentDoc, res.data.product),
    );
  }

  static async getProductAdditionalInfo(variables: ProductAdditionalInfoQueryVariables) {
    return execute(ProductAdditionalInfoDocument, variables).then((res) =>
      useFragment(ProductAdditionalInfoFragmentDoc, res.data.product),
    );
  }

  static async getProducts(variables: ProductListQueryVariables) {
    return execute(QueryProducts, variables).then((res) => res.data);
  }

  static async getHotDealProductsRandom(
    variables: QueryCommunityRandomRankingProductsQueryVariables,
  ) {
    return execute(QueryCommunityRandomRankingProducts, variables).then((res) => res.data);
  }

  static async getReportUserNames(variables: QueryReportUserNamesQueryVariables) {
    return execute(QueryReportUserNames, variables).then((res) => res.data);
  }

  static async getProductGuides(variables: ProductGuidesQueryVariables) {
    return execute(QueryProductGuides, variables).then((res) => res.data);
  }

  static async getTogetherViewedProducts(variables: TogetherViewedProductsQueryVariables) {
    return execute(QueryTogetherViewedProducts, variables).then((res) => res.data);
  }

  static async collectProduct(variables: {
    productId: number;
    source?: string | null;
    position?: number | null;
  }) {
    return execute(MutationCollectProduct, variables).then((res) => res.data);
  }

  static async recordProductImpressions(variables: {
    source: string;
    impressions: { productId: number; position: number }[];
  }) {
    return execute(MutationRecordProductImpressions, variables).then((res) => res.data);
  }
  static async reportExpiredProduct(variables: MutationReportExpiredProductMutationVariables) {
    return execute(MutationReportExpiredProduct, variables).then((res) => res.data);
  }
  static async createUserProduct(variables: CreateUserProductMutationVariables) {
    return execute(MutationCreateUserProduct, variables).then((res) => res.data.createUserProduct);
  }
  /**
   * 상품 썸네일 이미지를 업로드한다.
   * 1) 서버에서 presigned PUT URL 발급 → 2) S3 에 파일 직접 PUT → 3) CDN imageUrl 반환.
   */
  static async uploadProductImage(file: File): Promise<string> {
    const variables: CreateProductImageUploadUrlMutationVariables = { contentType: file.type };
    const { uploadUrl, imageUrl } = await execute(
      MutationCreateProductImageUploadUrl,
      variables,
    ).then((res) => res.data.createProductImageUploadUrl);

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!uploadRes.ok) {
      throw new Error('이미지 업로드에 실패했어요.');
    }
    return imageUrl;
  }
  static async getProductKeywords() {
    return execute(QueryProductKeywords).then((res) => res.data);
  }
  static async getProductsByKeyword(variables: QueryProductsByKeywordQueryVariables) {
    return execute(QueryProductsByKeyword, variables).then((res) => res.data);
  }

  static async getReactionKeywords(variables: QueryCategorizedReactionKeywordsArgs) {
    return execute(QueryCategorizedReactionKeywords, variables).then((res) => res.data);
  }

  static async getHotDealRankingProducts(variables: QueryHotDealRankingProductsArgs) {
    return execute(QueryHotDealRankingProducts, variables).then((res) => res.data);
  }

  static async getGuestRecommendedHotDeals(variables: QueryGuestRecommendedHotDealsArgs) {
    return execute(QueryGuestRecommendedHotDealsDocument, variables).then((res) => res.data);
  }

  static async getExpiringSoonHotDealProducts(
    variables: QueryExpiringSoonHotDealProductsQueryVariables,
  ) {
    return execute(QueryExpiringSoonHotDealProducts, variables).then((res) => res.data);
  }

  // Track B: 같은 상품의 다른 커뮤니티 글(다나와 미매칭, 클러스터). 최저가순.
  static async getClusteredProducts(variables: { id: number }) {
    return execute(QueryClusteredProducts, variables).then((res) => res.data);
  }
}

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

const QueryProducts = new TypedDocumentString<QueryProductsQuery, ProductListQueryVariables>(`
  query QueryProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryId: Int
    $keyword: String
    $thumbnailType: ThumbnailType
    $isEnd: Boolean
    $isHot: Boolean
    $providerId: Int
    $mallGroupId: Int
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryId: $categoryId
      keyword: $keyword
      thumbnailType: $thumbnailType
      isEnd: $isEnd
      isHot: $isHot
      providerId: $providerId
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
      hotDealType
      provider {
        nameKr
      }
      searchAfter
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

const QueryTogetherViewedProducts = graphql(`
  query togetherViewedProducts($limit: Int!, $productId: Int!) {
    togetherViewedProducts(limit: $limit, productId: $productId) {
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

// CTR 측정용 source/position 추가. codegen 전까지 변수 타입을 손으로 명시한 TypedDocumentString
// 으로 두고, codegen 후 graphql() 로 치환 가능(동작 동일).
const MutationCollectProduct = new TypedDocumentString<
  { collectProduct: boolean },
  { productId: number; source?: string | null; position?: number | null }
>(`
  mutation MutationCollectProduct($productId: Int!, $source: String, $position: Int) {
    collectProduct(productId: $productId, source: $source, position: $position)
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

const MutationCreateUserProduct = graphql(`
  mutation CreateUserProduct(
    $title: String!
    $url: String!
    $categoryId: Int!
    $price: String
    $thumbnail: String
    $content: String
  ) {
    createUserProduct(
      title: $title
      url: $url
      categoryId: $categoryId
      price: $price
      thumbnail: $thumbnail
      content: $content
    )
  }
`);

const MutationCreateProductImageUploadUrl = graphql(`
  mutation CreateProductImageUploadUrl($contentType: String!) {
    createProductImageUploadUrl(contentType: $contentType) {
      uploadUrl
      imageUrl
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
      provider {
        nameKr
      }
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
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

const QueryExpiringSoonHotDealProducts = graphql(`
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
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
      earliestExpiryDate
    }
  }
`);
