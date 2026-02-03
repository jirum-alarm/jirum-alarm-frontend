import { execute } from '@/shared/lib/http-client';

import { graphql, useFragment } from '../gql';
import {
  MutationCollectProductMutationVariables,
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

  static async collectProduct(variables: MutationCollectProductMutationVariables) {
    return execute(MutationCollectProduct, variables).then((res) => res.data);
  }
  static async reportExpiredProduct(variables: MutationReportExpiredProductMutationVariables) {
    return execute(MutationReportExpiredProduct, variables).then((res) => res.data);
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

  static async getExpiringSoonHotDealProducts(variables: QueryExpiringSoonHotDealProductsArgs) {
    return execute(QueryExpiringSoonHotDealProducts, variables).then((res) => res.data);
  }
}

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

const MutationCollectProduct = graphql(`
  mutation MutationCollectProduct($productId: Int!) {
    collectProduct(productId: $productId)
  }
`);

const MutationReportExpiredProduct = graphql(`
  mutation MutationReportExpiredProduct($productId: Int!) {
    reportExpiredProduct(productId: $productId)
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
    }
  }
`);
