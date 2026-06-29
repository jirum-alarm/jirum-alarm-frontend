import { execute } from '@/shared/lib/http-client';

import {
  ActiveAdsDocument,
  ActiveAdsQueryVariables,
  RecordAdClickDocument,
  RecordAdClickMutationVariables,
  RecordAdImpressionsDocument,
  RecordAdImpressionsMutationVariables,
} from '../gql/graphql';

export class AdService {
  static async getActiveAds(variables: ActiveAdsQueryVariables) {
    return execute(ActiveAdsDocument, variables).then((res) => res.data.activeAds);
  }

  static async recordImpressions(variables: RecordAdImpressionsMutationVariables) {
    return execute(RecordAdImpressionsDocument, variables).then((res) => res.data);
  }

  static async recordClick(variables: RecordAdClickMutationVariables) {
    return execute(RecordAdClickDocument, variables).then((res) => res.data);
  }
}
