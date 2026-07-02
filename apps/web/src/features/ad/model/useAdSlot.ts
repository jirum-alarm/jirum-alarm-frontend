'use client';

import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { AdService } from '@/shared/api/ad';
import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import { useImpressionTracker } from '@/shared/hooks/useImpressionTracker';

const adQueries = {
  activeAds: (slotLocation: AdvertiseSlotLocation) =>
    queryOptions({
      queryKey: ['ad', 'active', slotLocation],
      queryFn: () => AdService.getActiveAds({ slotLocation }),
      staleTime: 60_000,
    }),
};

type AdImpressionKey = { creativeId: number; slotLocation: AdvertiseSlotLocation };

// activeAds 조회 + impression/click 계측. useImpressionTracker 위에 광고 API를 연결한 래퍼.
export function useAdSlot(slotLocation: AdvertiseSlotLocation) {
  const { data: ads } = useSuspenseQuery(adQueries.activeAds(slotLocation));

  const { recordImpression, recordClick } = useImpressionTracker<AdImpressionKey>({
    toDedupeKey: ({ creativeId }) => String(creativeId),
    onFlushImpressions: useCallback((keys) => {
      void AdService.recordImpressions({ events: keys }).catch(() => {});
    }, []),
    onRecordClick: useCallback(({ creativeId, slotLocation: loc }) => {
      void AdService.recordClick({ creativeId, slotLocation: loc }).catch(() => {});
    }, []),
  });

  const recordAdImpression = useCallback(
    (creativeId: number) => recordImpression({ creativeId, slotLocation }),
    [recordImpression, slotLocation],
  );

  const recordAdClick = useCallback(
    (creativeId: number) => recordClick({ creativeId, slotLocation }),
    [recordClick, slotLocation],
  );

  return { ads, recordImpression: recordAdImpression, recordClick: recordAdClick };
}
