import { execute } from '@/shared/lib/http-client';

import {
  MutationAddPushTokenDocument,
  MutationAddPushTokenMutationVariables,
  QueryNotificationsDocument,
  QueryNotificationsQueryVariables,
} from '@shared/api/gql/graphql';

export class NotificationService {
  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return execute(MutationAddPushTokenDocument, variables);
  }

  static async getNotifications(variables: QueryNotificationsQueryVariables) {
    return execute(QueryNotificationsDocument, variables).then((res) => res.data);
  }
}
