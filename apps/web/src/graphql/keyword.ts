import { gql } from '@apollo/client';

export const MutationAddNotificationKeyword = gql`
  mutation MutationAddNotificationKeyword($keyword: String!) {
    addNotificationKeyword(keyword: $keyword)
  }
`;

export const MutationRemoveNotificationKeyword = gql`
  mutation MutationRemoveNotificationKeyword($id: Float!) {
    removeNotificationKeyword(id: $id)
  }
`;

export const QueryMypageKeyword = gql`
  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {
    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
      id
      keyword
    }
  }
`;
// export const QueryNotificationKeywordsByMe = gql`
//   query QueryNotificationKeywordsByMe($limit: Int!, $searchAfter: [String!]) {
//     notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
//       id
//       userId
//       keyword
//       isActive
//       createdAt
//     }
//   }
// `;
