import { gql } from '@apollo/client';

export const QueryProduct = gql`
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
`;
export const QueryProductGuides = gql`
  query productGuides($productId: Int!) {
    productGuides(productId: $productId) {
      id
      title
      content
    }
  }
`;

export const QueryProducts = gql`
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
`;

export const QueryRankingProducts = gql`
  query QueryRankingProducts {
    rankingProducts {
      id
      title
      url
      price
      thumbnail
    }
  }
`;

export const QueryCommunityRandomRankingProducts = gql`
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
`;

export const QueryTogetherViewedProducts = gql`
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
`;

export const MutationCollectProduct = gql`
  mutation MutationCollectProduct($productId: Int!) {
    collectProduct(productId: $productId)
  }
`;

export const MutationReportExpiredProduct = gql`
  mutation MutationReportExpiredProduct($productId: Int!) {
    reportExpiredProduct(productId: $productId)
  }
`;
