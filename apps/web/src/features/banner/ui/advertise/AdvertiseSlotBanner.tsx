'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';

import { AdvertisementMutations, AdvertisementQueries } from '@/entities/advertisement/api';

import AdvertiseBanner from './AdvertiseBanner';

import type { AdvertiseCreative } from './advertise-graphic';

const sentImpressionKeys = new Set<string>();
const shouldLogAdImpression = process.env.NODE_ENV !== 'production';
let activeSlotMountCount = 0;
let currentRouteKey: string | null = null;
let currentPageViewId = createPageViewId();

function createPageViewId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function reservePageViewId(routeKey: string) {
  if (currentRouteKey !== routeKey || activeSlotMountCount === 0) {
    currentRouteKey = routeKey;
    currentPageViewId = createPageViewId();
  }

  activeSlotMountCount += 1;
  return currentPageViewId;
}

function releasePageViewId() {
  activeSlotMountCount = Math.max(0, activeSlotMountCount - 1);
}

interface AdvertiseSlotBannerProps {
  slotLocation: AdvertiseSlotLocation;
  creative?: AdvertiseCreative;
  className?: string;
  surfaceClassName?: string;
  priority?: boolean;
}

export default function AdvertiseSlotBanner({
  slotLocation,
  creative: creativeProp,
  className,
  surfaceClassName,
  priority,
}: AdvertiseSlotBannerProps) {
  const pathname = usePathname();
  const [pageViewId, setPageViewId] = useState<string | null>(null);
  const activeAdsQuery = AdvertisementQueries.activeAds({ slotLocation });
  const { data: ads = [] } = useQuery({
    ...activeAdsQuery,
    enabled: !creativeProp,
  });
  const recordImpressions = useMutation(AdvertisementMutations.recordAdImpressions());
  const recordClick = useMutation(AdvertisementMutations.recordAdClick());
  const creative = creativeProp ?? ads[0];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 페이지뷰 ID 는 같은 화면의 슬롯들이 마운트 수를 세어 공유하는 모듈 밖 상태다(정리 함수가 짝). 마운트·경로 변경 때만 예약한다.
    setPageViewId(reservePageViewId(pathname));
    return releasePageViewId;
  }, [pathname]);

  const handleImpression = useCallback(
    (ad: AdvertiseCreative) => {
      if (!pageViewId) return false;
      const creativeId = Number(ad.id);
      if (!Number.isFinite(creativeId)) return false;
      const impressionKey = `${pageViewId}:${slotLocation}:${creativeId}`;
      if (sentImpressionKeys.has(impressionKey)) return true;
      sentImpressionKeys.add(impressionKey);
      if (shouldLogAdImpression) {
        console.info('[Advertisement] impression sent', {
          creativeId,
          slotLocation,
          pathname,
          pageViewId,
          impressionKey,
        });
      }
      recordImpressions.mutate(
        { events: [{ creativeId, slotLocation }] },
        { onError: () => sentImpressionKeys.delete(impressionKey) },
      );
      return true;
    },
    [pageViewId, pathname, recordImpressions, slotLocation],
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
      surfaceClassName={surfaceClassName}
      priority={priority}
      onImpression={handleImpression}
      onClickAd={handleClick}
    />
  );
}
