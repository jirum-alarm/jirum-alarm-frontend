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
    $isApp: Boolean
    $isReward: Boolean
    $isGame: Boolean
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryId: $categoryId
      keyword: $keyword
      isApp: $isApp
      isReward: $isReward
      isGame: $isGame
    ) {
      id
      title
      mallId
      url
      isHot
      isEnd
      ship
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

export const QueryCommunityRandomRankingProducts = gql`
  query QueryCommunityRandomRankingProducts(
    $count: Int!
    $limit: Int!
    $isApp: Boolean
    $isReward: Boolean
    $isGame: Boolean
  ) {
    communityRandomRankingProducts(
      count: $count
      limit: $limit
      isApp: $isApp
      isReward: $isReward
      isGame: $isGame
    ) {
      id
      title
      mallId
      url
      isHot
      isEnd
      ship
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
