import {graphql} from '../shared/api/gql';

export const MutationAddPushToken = graphql(`
  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
    addPushToken(token: $token, tokenType: $tokenType)
  }
`);

export const QueryNotifications = graphql(`
  query QueryNotifications($limit: Int!, $offset: Int!) {
    notifications(limit: $limit, offset: $offset) {
      id
      message
      createdAt
      readAt
      keyword
      product {
        id
        thumbnail
        price
        isHot
        isEnd
      }
    }
  }
`);

export const QueryUnreadNotificationsCount = graphql(`
  query QueryUnreadNotificationsCount {
    unreadNotificationsCount
  }
`);

export const MutationReadNotification = graphql(`
  mutation MutationReadNotification($id: Int!) {
    readNotification(id: $id)
  }
`);

export const MutationReadAllNotifications = graphql(`
  mutation MutationReadAllNotifications {
    readAllNotifications
  }
`);

export const MutationRemoveNotification = graphql(`
  mutation MutationRemoveNotification($id: Int!) {
    removeNotification(id: $id)
  }
`);

export const MutationRemoveAllNotifications = graphql(`
  mutation MutationRemoveAllNotifications {
    removeAllNotifications
  }
`);
