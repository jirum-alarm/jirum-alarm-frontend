import { graphql } from '../gql';
import {
  MutationCollectProductMutationVariables,
  MutationReportExpiredProductMutationVariables,
  ProductGuidesQueryVariables,
  ProductQueryVariables,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryProductsQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '../gql/graphql';

import { httpClient } from '@/shared/lib/http-client';

export class ProductService {
  static async getRankingProducts() {
    return httpClient.execute(QueryRankingProducts).then((res) => res.data);
  }

  static async getProduct(variables: ProductQueryVariables) {
    return httpClient.execute(QueryProduct, variables).then((res) => res.data);
  }

  static async getProductServer(variables: ProductQueryVariables) {
    return httpClient.server_execute(QueryProduct, variables).then((res) => res.data);
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
}

const QueryRankingProducts = graphql(`
  query QueryRankingProducts {
    rankingProducts {
      id
      title
      url
      price
      thumbnail
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
      provider {
        id
        name
        nameKr
        host
      }
      viewCount
      mallName
      guides {
        id
        title
        content
      }
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
