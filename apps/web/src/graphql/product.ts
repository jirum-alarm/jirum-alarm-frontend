import { gql } from '@apollo/client';

export const QueryProducts = gql`
  query QueryProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryId: Int
    $keyword: String
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

export const QueryProductsRanking = gql`
  query QueryProductsRanking(
    $limit: Int!
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $startDate: DateTime
  ) {
    products(limit: $limit, orderBy: $orderBy, orderOption: $orderOption, startDate: $startDate) {
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

export const MutationCollectProduct = gql`
  mutation MutationCollectProduct($productId: Int!) {
    collectProduct(productId: $productId)
  }
`;
