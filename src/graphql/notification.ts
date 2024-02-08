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
