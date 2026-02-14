import { gql } from '@apollo/client';

export const QueryNotificationsByAdmin = gql`
  query QueryNotificationsByAdmin($limit: Int!, $searchAfter: [String!]) {
    notificationsByAdmin(limit: $limit, searchAfter: $searchAfter) {
      id
      title
      message
      target
      targetId
      createdAt
      searchAfter
    }
  }
`;

export const MutationSendNotificationByAdmin = gql`
  mutation MutationSendNotificationByAdmin(
    $title: String!
    $message: String!
    $type: NotificationType!
    $target: NotificationTarget
    $targetId: Int
    $url: String
    $userIds: [Int!]
  ) {
    sendNotificationByAdmin(
      title: $title
      message: $message
      type: $type
      target: $target
      targetId: $targetId
      url: $url
      userIds: $userIds
    )
  }
`;
