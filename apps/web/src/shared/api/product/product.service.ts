import { httpClient } from '@/shared/lib/http-client';

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
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
  QueryReportUserNamesQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '../gql/graphql';

export class ProductService {
  static async getRankingProducts() {
    return httpClient.execute(QueryRankingProducts).then((res) => res.data);
  }

  static async getProduct(variables: ProductQueryVariables) {
    return httpClient.execute(QueryProduct, variables).then((res) => res.data);
  }

  static async getProductInfo(variables: ProductInfoQueryVariables) {
    return httpClient
      .execute(ProductInfoDocument, variables)
      .then((res) => useFragment(ProductInfoFragmentDoc, res.data.product));
  }

  static async getProductStats(variables: ProductStatsQueryVariables) {
    return httpClient
      .execute(ProductStatsDocument, variables)
      .then((res) => useFragment(ProductStatsFragmentDoc, res.data.product));
  }

  static async getProductAdditionalInfo(variables: ProductAdditionalInfoQueryVariables) {
    return httpClient
      .execute(ProductAdditionalInfoDocument, variables)
      .then((res) => useFragment(ProductAdditionalInfoFragmentDoc, res.data.product));
  }

  static async getProducts(variables: QueryProductsQueryVariables) {
    return httpClient.execute(QueryProducts, variables).then((res) => res.data);
  }

  static async getHotDealProductsRandom(
    variables: QueryCommunityRandomRankingProductsQueryVariables,
  ) {
    return httpClient
      .execute(QueryCommunityRandomRankingProducts, variables)
      .then((res) => res.data);
  }

  static async getReportUserNames(variables: QueryReportUserNamesQueryVariables) {
    return httpClient.execute(QueryReportUserNames, variables).then((res) => res.data);
  }

  static async getProductGuides(variables: ProductGuidesQueryVariables) {
    return httpClient.execute(QueryProductGuides, variables).then((res) => res.data);
  }

  static async getTogetherViewedProducts(variables: TogetherViewedProductsQueryVariables) {
    return httpClient.execute(QueryTogetherViewedProducts, variables).then((res) => res.data);
  }

  static async collectProduct(variables: MutationCollectProductMutationVariables) {
    return httpClient.execute(MutationCollectProduct, variables).then((res) => res.data);
  }
  static async reportExpiredProduct(variables: MutationReportExpiredProductMutationVariables) {
    return httpClient.execute(MutationReportExpiredProduct, variables).then((res) => res.data);
  }
  static async getProductKeywords() {
    return httpClient.execute(QueryProductKeywords).then((res) => res.data);
  }
  static async getProductsByKeyword(variables: QueryProductsByKeywordQueryVariables) {
    return httpClient.execute(QueryProductsByKeyword, variables).then((res) => res.data);
  }

  static async getReactionKeywords(variables: QueryCategorizedReactionKeywordsArgs) {
    return httpClient.execute(QueryCategorizedReactionKeywords, variables).then((res) => res.data);
  }
}

const QueryRankingProducts = graphql(`
  query QueryRankingProducts {
    rankingProducts {
      id
      title
      url
      price
      thumbnail
      categoryId
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

const QueryProducts = graphql(`
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
