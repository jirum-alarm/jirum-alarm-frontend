import {
  MutationAddPushTokenDocument,
  MutationAddPushTokenMutationVariables,
} from '@shared/api/gql/graphql';
import { httpClient } from '@shared/lib/http-client';

export class NotificationService {
  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return httpClient.execute(MutationAddPushTokenDocument, variables);
  }
}
