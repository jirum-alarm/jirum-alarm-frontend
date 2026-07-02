import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { AdvertisementService } from '@/shared/api/advertisement';
import {
  ActiveAdsQueryVariables,
  RecordAdClickMutationVariables,
  RecordAdImpressionsMutationVariables,
} from '@/shared/api/gql/graphql';

export const AdvertisementQueries = {
  all: () => ['advertisement'],
  activeAds: (variables: ActiveAdsQueryVariables) =>
    queryOptions({
      queryKey: [...AdvertisementQueries.all(), 'activeAds', variables] as const,
      queryFn: () => AdvertisementService.getActiveAds(variables),
      staleTime: 60 * 1000,
    }),
};

export const AdvertisementMutations = {
  recordAdImpressions: () =>
    mutationOptions({
      mutationFn: (variables: RecordAdImpressionsMutationVariables) =>
        AdvertisementService.recordAdImpressions(variables),
    }),
  recordAdClick: () =>
    mutationOptions({
      mutationFn: (variables: RecordAdClickMutationVariables) =>
        AdvertisementService.recordAdClick(variables),
    }),
};
