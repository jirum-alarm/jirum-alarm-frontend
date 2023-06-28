import { gql } from "@apollo/client";

export const QueryProducts = gql`
  query QueryProducts($limit: Int!, $searchAfter: [String!]) {
    products(limit: $limit, searchAfter: $searchAfter) {
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
