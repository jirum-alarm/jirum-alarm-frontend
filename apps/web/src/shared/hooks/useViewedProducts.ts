'use client';

import { useMemo } from 'react';

import { useIsHydrated } from '@/shared/hooks/useIsHydrated';
import { getViewedProductIds } from '@/shared/lib/viewedProducts';

/**
 * 목록 카드에서 "이미 본 상품인지" 판정용.
 *
 * SSR엔 localStorage가 없으니 하이드레이션 전엔 전부 false(=안 흐림)로 두고,
 * 하이드레이션 후 한 번만 읽는다. 반대로 하면 서버/클라 마크업이 어긋난다.
 *
 * ponytail: 마운트 시 1회 스냅샷. 같은 목록을 보는 동안 새 탭에서 본 건 즉시
 * 반영되지 않는다(재방문/리마운트 때 갱신). 실시간이 필요해지면 storage 이벤트
 * 구독으로 올릴 것.
 */
export const useViewedProducts = () => {
  const isHydrated = useIsHydrated();

  const viewedIds = useMemo(
    () => (isHydrated ? new Set(getViewedProductIds()) : new Set<string>()),
    [isHydrated],
  );

  return (productId: string | number) => viewedIds.has(String(productId));
};
