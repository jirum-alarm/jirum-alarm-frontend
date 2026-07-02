import {
  ActiveAdsDocument,
  ActiveAdsQueryVariables,
  RecordAdClickDocument,
  RecordAdClickMutationVariables,
  RecordAdImpressionsDocument,
  RecordAdImpressionsMutationVariables,
} from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

export class AdvertisementService {
  static async getActiveAds(variables: ActiveAdsQueryVariables) {
    return execute(ActiveAdsDocument, variables).then((res) => res.data.activeAds);
  }

  static async recordAdImpressions(variables: RecordAdImpressionsMutationVariables) {
    return execute(RecordAdImpressionsDocument, variables).then(
      (res) => res.data.recordAdImpressions,
    );
  }

  static async recordAdClick(variables: RecordAdClickMutationVariables) {
    return execute(RecordAdClickDocument, variables).then((res) => res.data.recordAdClick);
  }
}
