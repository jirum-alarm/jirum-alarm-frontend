import type {MutationAddPushTokenMutationVariables} from '../gql/graphql.ts';
import {HttpClient} from '../../lib/client/index.ts';
import {MutationAddPushToken} from '../../../graphql/notification.ts';

export class NotificationService {
  static async addToken(variables: MutationAddPushTokenMutationVariables) {
    return HttpClient.withAccessToken()
      .execute(MutationAddPushToken, variables)
      .then(res => res.data);
  }
}
