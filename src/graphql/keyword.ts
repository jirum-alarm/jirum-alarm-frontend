import { gql } from '@apollo/client';

export const MutationAddHotDealKeywordByAdmin = gql`
  mutation MutationAddHotDealKeywordByAdmin(
    $type: HotDealKeywordType!
    $keyword: String!
    $weight: Float!
    $isMajor: Boolean!
  ) {
    addHotDealKeywordByAdmin(type: $type, keyword: $keyword, weight: $weight, isMajor: $isMajor)
  }
`;
