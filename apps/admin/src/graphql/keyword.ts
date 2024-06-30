import { gql } from '@apollo/client';

export const QueryHotDealKeywordsByAdmin = gql`
  query QueryHotDealKeywordsByAdmin(
    $type: HotDealKeywordType
    $orderBy: HotDealKeywordOrderType!
    $orderOption: OrderOptionType!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    hotDealKeywordsByAdmin(
      type: $type
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
      lastUpdatedAt
      synonymCount
      excludeKeywordCount
      searchAfter
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

export const MutationRemoveHotDealKeywordByAdmin = gql`
  mutation MutationRemoveHotDealKeywordByAdmin($id: Int!) {
    removeHotDealKeywordByAdmin(id: $id)
  }
`;

export const MutationUpdateHotDealKeywordByAdmin = gql`
  mutation MutationUpdateHotDealKeywordByAdmin(
    $id: Int!
    $keyword: String
    $weight: Float
    $isMajor: Boolean
  ) {
    updateHotDealKeywordByAdmin(id: $id, keyword: $keyword, weight: $weight, isMajor: $isMajor)
  }
`;

export const QueryHotDealKeywordByAdmin = gql`
  query QueryHotDealKeywordByAdmin($id: Int!) {
    hotDealKeywordByAdmin(id: $id) {
      id
      type
      keyword
      weight
      isMajor
      synonyms {
        id
        hotDealKeywordId
        keyword
      }
      excludeKeywords {
        id
        hotDealKeywordId
        excludeKeyword
      }
    }
  }
`;

export const QueryHotDealKeywordDetailByAdmin = gql`
  query QueryHotDealKeywordDetailByAdmin($id: Int!) {
    hotDealKeywordByAdmin(id: $id) {
      id
      type
      keyword
      weight
      isMajor
    }
  }
`;
