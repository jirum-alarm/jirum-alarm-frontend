import { gql } from "@apollo/client";

export const QueryProducts = gql`
  query QueryProducts(
    $limit: Int!
    $searchAfter: [String!]
    $categoryId: Int
    $keyword: String
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      categoryId: $categoryId
      keyword: $keyword
    ) {
      id
      title
      mallId
      url
      providerId
      categoryId
      category
      provider {
        nameKr
      }
      searchAfter
    }
  }
`;

const SubscriptionProducts = gql`
  subscription productAdded {
    productAdded {
      id
    }
  }
`;
