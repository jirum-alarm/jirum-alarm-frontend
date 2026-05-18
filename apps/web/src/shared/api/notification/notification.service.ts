import {
  MutationAddPushTokenDocument,
  MutationAddPushTokenMutationVariables,
  MutationReadAllNotificationsDocument,
  MutationReadNotificationDocument,
  MutationReadNotificationMutationVariables,
  QueryNotificationsDocument,
  QueryNotificationsQueryVariables,
  QueryUnreadNotificationsCountDocument,
  TypedDocumentString,
} from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

type RemoveNotificationResult = { removeNotification: boolean };
type RemoveNotificationVariables = { id: number };

type RemoveAllNotificationsResult = { removeAllNotifications: boolean };

const MutationRemoveNotificationDocument = new TypedDocumentString<
  RemoveNotificationResult,
  RemoveNotificationVariables
>(`
  mutation MutationRemoveNotification($id: Int!) {
    removeNotification(id: $id)
  }
`);

const MutationRemoveAllNotificationsDocument = new TypedDocumentString<
  RemoveAllNotificationsResult,
  Record<string, never>
>(`
  mutation MutationRemoveAllNotifications {
    removeAllNotifications
  }
`);

export class NotificationService {
  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return execute(MutationAddPushTokenDocument, variables);
  }

  static async getNotifications(variables: QueryNotificationsQueryVariables) {
    return execute(QueryNotificationsDocument, variables).then((res) => res.data.notifications);
  }

  static async getUnreadCount() {
    return execute(QueryUnreadNotificationsCountDocument).then(
      (res) => res.data.unreadNotificationsCount,
    );
  }

  static async readNotification(variables: MutationReadNotificationMutationVariables) {
    return execute(MutationReadNotificationDocument, variables);
  }

  static async readAllNotifications() {
    return execute(MutationReadAllNotificationsDocument);
  }

  static async removeNotification(variables: RemoveNotificationVariables) {
    return execute(MutationRemoveNotificationDocument, variables);
  }

  static async removeAllNotifications() {
    return execute(MutationRemoveAllNotificationsDocument);
  }
}
