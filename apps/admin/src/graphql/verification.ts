import { gql } from '@apollo/client';

export const QueryPendingVerifications = gql`
  query QueryPendingVerifications(
    $limit: Int!
    $searchAfter: [String!]
    $prioritizeOld: Boolean
    $orderBy: OrderOptionType
    $brandProductId: Int
  ) {
    pendingVerifications(
      limit: $limit
      searchAfter: $searchAfter
      prioritizeOld: $prioritizeOld
      orderBy: $orderBy
      brandProductId: $brandProductId
    ) {
      id
      productId
      brandProduct
      product {
        title
        thumbnail
      }
      danawaUrl

      verificationStatus
      verifiedBy
      verifiedAt
      verificationNote
      createdAt
      searchAfter
    }
  }
`;

export const QueryVerificationStatistics = gql`
  query QueryVerificationStatistics {
    verificationStatistics {
      pending
      verified
      rejected
      total
    }
  }
`;

export const QueryVerificationHistory = gql`
  query QueryVerificationHistory(
    $limit: Int!
    $searchAfter: [String!]
    $verificationStatus: [ProductMappingVerificationStatus!]
    $matchStatus: [ProductMappingMatchStatus!]
    $target: ProductMappingTarget
    $productId: Int
    $verifiedBy: Int
    $orderBy: OrderOptionType
  ) {
    verificationHistory(
      limit: $limit
      searchAfter: $searchAfter
      verificationStatus: $verificationStatus
      matchStatus: $matchStatus
      target: $target
      productId: $productId
      verifiedBy: $verifiedBy
      orderBy: $orderBy
    ) {
      id
      productId
      brandProduct
      product {
        title
        thumbnail
      }
      danawaUrl

      verificationStatus
      verifiedBy
      verifiedAt
      verificationNote
      createdAt
      searchAfter
    }
  }
`;

export const MutationVerifyProductMapping = gql`
  mutation MutationVerifyProductMapping(
    $productMappingId: Int!
    $result: ProductMappingVerificationStatus!
    $feedback: String
  ) {
    verifyProductMapping(productMappingId: $productMappingId, result: $result, feedback: $feedback)
  }
`;

export const MutationBatchVerifyProductMapping = gql`
  mutation MutationBatchVerifyProductMapping(
    $productMappingIds: [Int!]!
    $result: ProductMappingVerificationStatus!
    $feedback: String
  ) {
    batchVerifyProductMapping(
      productMappingIds: $productMappingIds
      result: $result
      feedback: $feedback
    )
  }
`;

export const MutationRemoveProductMapping = gql`
  mutation MutationRemoveProductMapping($productId: Int!) {
    removeProductMapping(productId: $productId)
  }
`;

export const MutationCancelVerification = gql`
  mutation MutationCancelVerification($productMappingId: Int!, $reason: String) {
    cancelVerification(productMappingId: $productMappingId, reason: $reason)
  }
`;

export const QueryPendingVerificationsTotalCount = gql`
  query QueryPendingVerificationsTotalCount($brandProductId: Int) {
    pendingVerificationsTotalCount(brandProductId: $brandProductId)
  }
`;
