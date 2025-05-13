import { http } from '@/shared/lib/http';

import { graphql } from '../gql';
import {
  MutationCollectProductMutationVariables,
  MutationReportExpiredProductMutationVariables,
  ProductGuidesQueryVariables,
  ProductQueryVariables,
  QueryCategorizedReactionKeywordsArgs,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
  QueryReportUserNamesQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '../gql/graphql';

export class ProductService {
  static async getRankingProducts() {
    return http.execute(QueryRankingProducts);
  }

  static async getProduct(variables: ProductQueryVariables) {
    return http.execute(QueryProduct, variables);
  }

  static async getProductServer(variables: ProductQueryVariables, cookieHeader: string) {
    return http.executeServer(cookieHeader, QueryProduct, variables);
  }

  static async getProducts(variables: QueryProductsQueryVariables) {
    return http.execute(QueryProducts, variables);
  }

  static async getProductsServer(variables: QueryProductsQueryVariables, cookieHeader: string) {
    return http.executeServer(cookieHeader, QueryProducts, variables);
  }

  static async getHotDealProductsRandom(
    variables: QueryCommunityRandomRankingProductsQueryVariables,
  ) {
    return http.execute(QueryCommunityRandomRankingProducts, variables);
  }

  static async getReportUserNames(variables: QueryReportUserNamesQueryVariables) {
    return http.execute(QueryReportUserNames, variables);
  }

  static async getProductGuides(variables: ProductGuidesQueryVariables) {
    return http.execute(QueryProductGuides, variables);
  }

  static async getTogetherViewedProducts(variables: TogetherViewedProductsQueryVariables) {
    return http.execute(QueryTogetherViewedProducts, variables);
  }

  static async collectProduct(variables: MutationCollectProductMutationVariables) {
    return http.execute(MutationCollectProduct, variables);
  }
  static async reportExpiredProduct(variables: MutationReportExpiredProductMutationVariables) {
    return http.execute(MutationReportExpiredProduct, variables);
  }
  static async getProductKeywords() {
    return http.execute(QueryProductKeywords);
  }
  static async getProductKeywordsServer(cookieHeader: string) {
    return http.executeServer(cookieHeader, QueryProductKeywords);
  }
  static async getProductsByKeyword(variables: QueryProductsByKeywordQueryVariables) {
    return http.execute(QueryProductsByKeyword, variables);
  }

  static async getReactionKeywords(variables: QueryCategorizedReactionKeywordsArgs) {
    return http.execute(QueryCategorizedReactionKeywords, variables);
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
