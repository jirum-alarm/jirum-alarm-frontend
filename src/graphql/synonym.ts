import { gql } from '@apollo/client';

export const MutationAddHotDealKeywordSynonymByAdmin = gql`
  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keyword: String!) {
    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keyword: $keyword)
  }
`;
export const MutationAddHotDealExcludeKeywordByAdmin = gql`
  mutation MutationAddHotDealExcludeKeywordByAdmin(
    $hotDealKeywordId: Int!
    $excludeKeyword: String!
  ) {
    addHotDealExcludeKeywordByAdmin(
      hotDealKeywordId: $hotDealKeywordId
      excludeKeyword: $excludeKeyword
    )
  }
`;
