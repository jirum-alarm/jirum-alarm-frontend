import {useCallback, useRef} from 'react';

import {HomeService} from '@/shared/api/home/home.service';
import {AdvertiseSlotLocation} from '@/shared/api/gql/graphql';

/**
 * 자체 광고 슬롯의 노출·클릭 집계.
 *
 * ⚠️ 이게 빠지면 화면은 멀쩡한데 광고 매출 측정이 조용히 죽는다.
 * 애드센스와 다른 시스템이다 — 애드센스는 구글이 세지만 이건 우리가 센다.
 *
 * web 대응:
 *   useInView({threshold:0.5, triggerOnce:true})  → 호출부가 가시성 판정
 *   impressedCreativeIdRef                        → 아래 impressedRef (같은 역할)
 *
 * ★ triggerOnce 를 훅 안에서 보장한다. 캐러셀은 슬라이드를 오가므로 같은
 * 크리에이티브가 여러 번 보이는데, 그때마다 쏘면 노출이 부풀려진다.
 */
export function useAdTracking(
  slotLocation: AdvertiseSlotLocation = AdvertiseSlotLocation.HomeCarouselBanner,
) {
  const impressedRef = useRef<Set<number>>(new Set());

  const recordImpression = useCallback(
    (creativeId: number) => {
      if (!Number.isFinite(creativeId)) return;
      if (impressedRef.current.has(creativeId)) return;
      impressedRef.current.add(creativeId);

      // 집계 실패로 화면이 깨지면 안 된다. 조용히 삼키되 낙관 기록은 유지한다
      // (재시도하면 중복 집계가 되는 쪽이 더 나쁘다).
      HomeService.recordAdImpressions({
        events: [{creativeId, slotLocation}],
      }).catch(() => {});
    },
    [slotLocation],
  );

  const recordClick = useCallback(
    (creativeId: number) => {
      if (!Number.isFinite(creativeId)) return;
      HomeService.recordAdClick({creativeId, slotLocation}).catch(() => {});
    },
    [slotLocation],
  );

  return {recordImpression, recordClick};
}
