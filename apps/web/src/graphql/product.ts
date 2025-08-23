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
`;

export const QueryProductAdditionalInfo = gql`
  fragment ProductAdditionalInfo on ProductOutput {
    id
    url
    positiveCommunityReactionCount
    negativeCommunityReactionCount
    provider {
      id
      name
      nameKr
      host
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
    commentSummary {
      additionalInfo
      option
      price
      productId
      purchaseMethod
      satisfaction
      summary
    }
  }
  query ProductAdditionalInfo($id: Int!) {
    product(id: $id) {
      ...ProductAdditionalInfo
    }
  }
`;

export const QueryProductInfo = gql`
  fragment ProductInfo on ProductOutput {
    id
    categoryId
    categoryName
    title
    url
    detailUrl
    isHot
    isEnd
    price
    postedAt
    thumbnail
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
    hotDealType
    viewCount
    mallName
  }
  query ProductInfo($id: Int!) {
    product(id: $id) {
      ...ProductInfo
    }
  }
`;

export const QueryProductStats = gql`
  fragment ProductStats on ProductOutput {
    id
    isHot
    isEnd
    wishlistCount
    isMyLike
    isMyReported
    likeCount
    isMyWishlist
  }
  query ProductStats($id: Int!) {
    product(id: $id) {
      ...ProductStats
    }
  }
`;

export const QueryReportUserNames = gql`
  query QueryReportUserNames($productId: Int!) {
    reportUserNames(productId: $productId)
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
      hotDealType
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
      categoryId
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

export const QueryProductKeywords = gql`
  query QueryProductKeywords {
    productKeywords
  }
`;

export const QueryProductsByKeyword = gql`
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

export const QueryCategorizedReactionKeywords = gql`
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
`;
