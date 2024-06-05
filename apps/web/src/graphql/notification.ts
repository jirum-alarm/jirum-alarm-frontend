import { gql } from '@apollo/client';

export const QueryNotifications = gql`
  query QueryNotifications($offset: Int!, $limit: Int!) {
    notifications(offset: $offset, limit: $limit) {
      id
      groupId
      receiverId
      senderId
      senderType
      target
      targetId
      title
      message
      url
      category
      readAt
      createdAt
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
