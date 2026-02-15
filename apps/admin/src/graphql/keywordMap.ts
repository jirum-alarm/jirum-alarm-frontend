import { gql } from '@apollo/client';

export const QueryKeywordMapGroupsByAdmin = gql`
  query QueryKeywordMapGroupsByAdmin(
    $orderBy: KeywordMapGroupOrderType!
    $orderOption: OrderOptionType!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    keywordMapGroupsByAdmin(
      orderBy: $orderBy
      orderOption: $orderOption
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      name
      description
      entryCount
      searchAfter
    }
  }
`;

export const QueryKeywordMapGroupByAdmin = gql`
  query QueryKeywordMapGroupByAdmin($id: Int!) {
    keywordMapGroupByAdmin(id: $id) {
      id
      name
      description
      entryCount
      entries {
        id
        keyword
      }
    }
  }
`;

export const MutationAddKeywordMapGroupByAdmin = gql`
  mutation MutationAddKeywordMapGroupByAdmin($name: String!, $description: String) {
    addKeywordMapGroupByAdmin(name: $name, description: $description)
  }
`;

export const MutationUpdateKeywordMapGroupByAdmin = gql`
  mutation MutationUpdateKeywordMapGroupByAdmin($id: Int!, $name: String, $description: String) {
    updateKeywordMapGroupByAdmin(id: $id, name: $name, description: $description)
  }
`;

export const MutationRemoveKeywordMapGroupByAdmin = gql`
  mutation MutationRemoveKeywordMapGroupByAdmin($id: Int!) {
    removeKeywordMapGroupByAdmin(id: $id)
  }
`;

export const MutationAddKeywordMapEntryByAdmin = gql`
  mutation MutationAddKeywordMapEntryByAdmin($groupId: Int!, $keyword: String!) {
    addKeywordMapEntryByAdmin(groupId: $groupId, keyword: $keyword)
  }
`;

export const MutationAddKeywordMapEntriesByAdmin = gql`
  mutation MutationAddKeywordMapEntriesByAdmin($groupId: Int!, $keywords: [String!]!) {
    addKeywordMapEntriesByAdmin(groupId: $groupId, keywords: $keywords)
  }
`;

export const MutationRemoveKeywordMapEntryByAdmin = gql`
  mutation MutationRemoveKeywordMapEntryByAdmin($id: Int!) {
    removeKeywordMapEntryByAdmin(id: $id)
  }
`;
