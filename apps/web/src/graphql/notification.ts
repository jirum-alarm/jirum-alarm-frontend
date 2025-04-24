import { gql } from '@apollo/client';

export const QueryNotifications = gql`
  query QueryNotifications($offset: Int!, $limit: Int!) {
    notifications(offset: $offset, limit: $limit) {
      id
      readAt
      createdAt
      message
      url
      keyword
      product {
        id
        thumbnail
        price
        isHot
        isEnd
        categoryId
      }
    }
  }
`;

export const QueryUnreadNotificationsCount = gql`
  query QueryUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MutationAddPushToken = gql`
  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
    addPushToken(token: $token, tokenType: $tokenType)
  }
`;
