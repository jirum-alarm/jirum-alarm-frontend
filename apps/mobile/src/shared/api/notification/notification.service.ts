import type {
  MutationAddPushTokenMutationVariables,
  QueryNotificationsQuery,
  QueryNotificationsQueryVariables,
} from '../gql/graphql.ts';
import {HttpClient} from '../../lib/client/index.ts';
import {
  MutationAddPushToken,
  MutationReadAllNotifications,
  MutationReadNotification,
  MutationRemoveAllNotifications,
  MutationRemoveNotification,
  QueryNotifications,
  QueryUnreadNotificationsCount,
} from '../../../graphql/notification.ts';

export type NotificationItem = QueryNotificationsQuery['notifications'][number];

export class NotificationService {
  static async addToken(variables: MutationAddPushTokenMutationVariables) {
    return HttpClient.withAccessToken()
      .execute(MutationAddPushToken, variables)
      .then(res => res.data);
  }

  static async getNotifications(variables: QueryNotificationsQueryVariables) {
    return HttpClient.withAccessToken()
      .execute(QueryNotifications, variables)
      .then(res => res.data.notifications);
  }

  static async getUnreadCount() {
    return HttpClient.withAccessToken()
      .execute(QueryUnreadNotificationsCount)
      .then(res => res.data.unreadNotificationsCount);
  }

  static async readNotification(id: number) {
    return HttpClient.withAccessToken()
      .execute(MutationReadNotification, {id})
      .then(res => res.data.readNotification);
  }

  static async readAllNotifications() {
    return HttpClient.withAccessToken()
      .execute(MutationReadAllNotifications)
      .then(res => res.data.readAllNotifications);
  }

  static async removeNotification(id: number) {
    return HttpClient.withAccessToken()
      .execute(MutationRemoveNotification, {id})
      .then(res => res.data.removeNotification);
  }

  static async removeAllNotifications() {
    return HttpClient.withAccessToken()
      .execute(MutationRemoveAllNotifications)
      .then(res => res.data.removeAllNotifications);
  }
}
