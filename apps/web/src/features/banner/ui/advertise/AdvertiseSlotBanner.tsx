'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';

import { AdvertisementMutations, AdvertisementQueries } from '@/entities/advertisement/api';

import AdvertiseBanner from './AdvertiseBanner';

import type { AdvertiseCreative } from './advertise-graphic';

interface AdvertiseSlotBannerProps {
  slotLocation: AdvertiseSlotLocation;
  className?: string;
  priority?: boolean;
}

export default function AdvertiseSlotBanner({
  slotLocation,
  className,
  priority,
}: AdvertiseSlotBannerProps) {
  const { data: ads = [] } = useQuery(AdvertisementQueries.activeAds({ slotLocation }));
  const recordImpressions = useMutation(AdvertisementMutations.recordAdImpressions());
  const recordClick = useMutation(AdvertisementMutations.recordAdClick());
  const creative = ads[0];

  const handleImpression = useCallback(
    (ad: AdvertiseCreative) => {
      const creativeId = Number(ad.id);
      if (!Number.isFinite(creativeId)) return;
      recordImpressions.mutate({ events: [{ creativeId, slotLocation }] });
    },
    [recordImpressions, slotLocation],
  );

  const handleClick = useCallback(
    (ad: AdvertiseCreative) => {
      const creativeId = Number(ad.id);
      if (!Number.isFinite(creativeId)) return;
      recordClick.mutate({ creativeId, slotLocation });
    },
    [recordClick, slotLocation],
  );

  if (!creative) return null;

  return (
    <AdvertiseBanner
      creative={creative}
      className={className}
      priority={priority}
      onImpression={handleImpression}
      onClickAd={handleClick}
    />
  );
}
