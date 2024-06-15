import { gql } from '@apollo/client';

export const MutationAddHotDealKeywordSynonymByAdmin = gql`
  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keywords: [String!]!) {
    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keywords: $keywords)
  }
`;
export const MutationAddHotDealExcludeKeywordByAdmin = gql`
  mutation MutationAddHotDealExcludeKeywordByAdmin(
    $hotDealKeywordId: Int!
    $excludeKeywords: [String!]!
  ) {
    addHotDealExcludeKeywordByAdmin(
      hotDealKeywordId: $hotDealKeywordId
      excludeKeywords: $excludeKeywords
    )
  }
`;

export const MutationRemoveHotDealKeywordSynonymByAdmin = gql`
  mutation MutationRemoveHotDealKeywordSynonymByAdmin($ids: [Int!]!) {
    removeHotDealKeywordSynonymByAdmin(ids: $ids)
  }
`;

export const MutationRemoveHotDealExcludeKeywordByAdmin = gql`
  mutation MutationRemoveHotDealExcludeKeywordByAdmin($ids: [Int!]!) {
    removeHotDealExcludeKeywordByAdmin(ids: $ids)
  }
`;
