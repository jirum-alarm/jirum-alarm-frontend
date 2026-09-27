import { gql } from '@apollo/client';

export const QueryBrandProductsOrderByMatchCount = gql`
  query QueryBrandProductsOrderByMatchCount(
    $limit: Int!
    $searchAfter: [String!]
    $brandItemId: Int
    $title: String
  ) {
    brandProductsOrderByMatchCount(
      limit: $limit
      searchAfter: $searchAfter
      brandItemId: $brandItemId
      title: $title
    ) {
      id
      danawaProductId
      brandItemId
      brandName
      productName
      volume
      amount
      matchCount
      pendingVerificationCount
      createdAt
      searchAfter
    }
  }
`;

export const QueryBrandItemsOrderByTotalMatchCount = gql`
  query QueryBrandItemsOrderByTotalMatchCount(
    $limit: Int!
    $searchAfter: [String!]
    $title: String
  ) {
    brandItemsOrderByTotalMatchCount(limit: $limit, searchAfter: $searchAfter, title: $title) {
      id
      brandName
      productName
      totalMatchCount
      pendingVerificationCount
      searchAfter
    }
  }
`;

export const QueryBrandItemsByMatchCountTotalCount = gql`
  query QueryBrandItemsByMatchCountTotalCount($title: String) {
    brandItemsByMatchCountTotalCount(title: $title)
  }
`;

export const QuerySimilarProductsByTitle = gql`
  query QuerySimilarProductsByTitle($title: String!, $limit: Int!) {
    similarProductsByTitle(title: $title, limit: $limit) {
      id
      title
      url
      thumbnail
      price
      similarity
      provider {
        name
      }
      productMapping {
        target
        targetId
        verificationStatus
      }
    }
  }
`;

export const MutationAddProductMapping = gql`
  mutation MutationAddProductMapping($productId: Int!, $brandProductId: Int!) {
    addProductMapping(productId: $productId, brandProductId: $brandProductId)
  }
`;
