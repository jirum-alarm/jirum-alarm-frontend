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

export const QuerySimilarProducts = gql`
  query QuerySimilarProducts($id: Int!) {
    similarProducts(id: $id) {
      id
      title
      url
      thumbnail
      price
      categoryId
      providerId
      provider {
        name
      }
      postedAt
    }
  }
`;

export const QueryBrandProductsByMatchCountTotalCount = gql`
  query QueryBrandProductsByMatchCountTotalCount($brandItemId: Int, $title: String) {
    brandProductsByMatchCountTotalCount(brandItemId: $brandItemId, title: $title)
  }
`;

export const QueryBrandProductMatchCount = gql`
  query QueryBrandProductMatchCount($brandProductId: Int!) {
    brandProductMatchCount(brandProductId: $brandProductId)
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
