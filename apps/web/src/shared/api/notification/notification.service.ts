import {
  MutationAddPushTokenDocument,
  MutationAddPushTokenMutationVariables,
  MutationReadAllNotificationsDocument,
  MutationReadNotificationDocument,
  MutationReadNotificationMutationVariables,
  QueryNotificationsDocument,
  QueryNotificationsQueryVariables,
  QueryUnreadNotificationsCountDocument,
} from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

export class NotificationService {
  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return execute(MutationAddPushTokenDocument, variables);
  }

  static async getNotifications(variables: QueryNotificationsQueryVariables) {
    return execute(QueryNotificationsDocument, variables).then((res) => {
      // @ts-expect-error errors type
      if (res.errors) {
        // @ts-expect-error errors type
        throw res.errors;
      }
      return res.data.notifications;
    });
  }

  static async getUnreadCount() {
    return execute(QueryUnreadNotificationsCountDocument).then((res) => {
      // @ts-expect-error errors type
      if (res.errors) throw res.errors;
      return res.data.unreadNotificationsCount;
    });
  }

  static async readNotification(variables: MutationReadNotificationMutationVariables) {
    return execute(MutationReadNotificationDocument, variables);
  }

  static async readAllNotifications() {
    return execute(MutationReadAllNotificationsDocument);
  }
}
