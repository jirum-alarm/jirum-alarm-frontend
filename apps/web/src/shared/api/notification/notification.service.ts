import { http } from '@/shared/lib/http';

import { graphql } from '../gql';
import {
  MutationAddPushTokenMutationVariables,
  QueryNotificationsQueryVariables,
} from '../gql/graphql';

export class NotificationService {
  static async getNotifications(variables: QueryNotificationsQueryVariables) {
    return http.execute(QueryNotifications, variables);
  }

  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return http.execute(MutationAddPushToken, variables);
  }
}

export const QueryNotifications = graphql(`
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
`);

export const MutationAddPushToken = graphql(`
  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
    addPushToken(token: $token, tokenType: $tokenType)
  }
`);
