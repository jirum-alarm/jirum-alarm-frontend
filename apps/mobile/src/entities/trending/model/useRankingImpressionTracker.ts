import {useCallback, useEffect, useRef} from 'react';
import {AppState} from 'react-native';

import {ProductService} from '@/shared/api/product/product.service';

/**
 * 랭킹 탭 노출/클릭 추적기(CTR 계측).
 * web 정본: widgets/trending/model/useRankingImpressionTracker.ts
 *
 * - 노출(분모): 실제로 화면에 보인 카드만 (productId, position) 으로 모아
 *   디바운스 후 일괄 전송. fetch 50개를 다 세면 CTR 이 과소계상된다.
 * - 클릭(분자): 카드를 누르는 즉시 source 와 함께 전송.
 * - dedup: 같은 (productId, position) 노출은 마운트 동안 1회만.
 *
 * ★ web 은 IntersectionObserver + visibilitychange 를 쓴다. RN 엔 둘 다 없어
 * 뷰포트 판정은 FlatList 의 onViewableItemsChanged 가, 이탈 감지는
 * AppState('background')가 대신한다.
 */
const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 50;

export function useRankingImpressionTracker(source: string) {
  const seenRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef<{productId: number; position: number}[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const impressions = pendingRef.current;
    if (impressions.length === 0) return;
    pendingRef.current = [];
    // fire-and-forget. 실패해도 UX 영향 없음.
    void ProductService.recordProductImpressions({source, impressions}).catch(
      () => {},
    );
  }, [source]);

  const recordImpression = useCallback(
    (productId: number, position: number) => {
      const key = `${productId}:${position}`;
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);
      pendingRef.current.push({productId, position});

      if (pendingRef.current.length >= MAX_BATCH) {
        flush();
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, FLUSH_DEBOUNCE_MS);
    },
    [flush],
  );

  const recordClick = useCallback(
    (productId: number, position: number) => {
      void ProductService.collectProduct({productId, source, position}).catch(
        () => {},
      );
    },
    [source],
  );

  // 앱이 백그라운드로 가거나 화면이 사라질 때 잔여 노출 전송.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') flush();
    });
    return () => {
      sub.remove();
      flush();
    };
  }, [flush]);

  return {recordImpression, recordClick};
}
