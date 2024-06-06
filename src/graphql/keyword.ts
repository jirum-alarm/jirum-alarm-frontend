import { gql } from '@apollo/client';

export const QueryHotDealKeywordsByAdmin = gql`
  query QueryHotDealKeywordsByAdmin(
    $orderBy: HotDealKeywordOrderType!
    $orderOption: OrderOptionType!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    hotDealKeywordsByAdmin(
      orderBy: $orderBy
      orderOption: $orderOption
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      type
      keyword
      weight
      isMajor
    }
  }
`;

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
