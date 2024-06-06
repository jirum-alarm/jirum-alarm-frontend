import { gql } from '@apollo/client';

export const MutationAddHotDealKeywordSynonymByAdmin = gql`
  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keyword: [String!]!) {
    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keyword: $keyword)
  }
`;
export const MutationAddHotDealExcludeKeywordByAdmin = gql`
  mutation MutationAddHotDealExcludeKeywordByAdmin(
    $hotDealKeywordId: Int!
    $excludeKeyword: [String!]!
  ) {
    addHotDealExcludeKeywordByAdmin(
      hotDealKeywordId: $hotDealKeywordId
      excludeKeyword: $excludeKeyword
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
