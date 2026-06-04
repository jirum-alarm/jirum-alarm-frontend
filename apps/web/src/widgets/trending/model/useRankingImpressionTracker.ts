'use client';

import { useCallback, useEffect, useRef } from 'react';

import { ProductService } from '@/shared/api/product';

// 랭킹 탭 노출/클릭 추적기 (CTR 측정 인프라, 블록1).
// - 노출(분모): viewport 에 실제 보인 카드만 (productId, position) 으로 모아 디바운스 후 일괄 전송.
//   화면에 안 보인 하위 랭크는 기록되지 않음 → fetch 50개 과대계상 회피.
// - 클릭(분자): 카드 클릭 즉시 source='ranking_tab' 로 collectProduct 전송.
// - dedup: 같은 (productId, position) 노출은 마운트 동안 1회만.
const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 50;

export function useRankingImpressionTracker(source: string) {
  // 이번 마운트에서 이미 기록한 노출 키 (productId:position).
  const seenRef = useRef<Set<string>>(new Set());
  // 아직 전송 안 한 노출 버퍼.
  const pendingRef = useRef<{ productId: number; position: number }[]>([]);
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
    void ProductService.recordProductImpressions({ source, impressions }).catch(() => {});
  }, [source]);

  const recordImpression = useCallback(
    (productId: number, position: number) => {
      const key = `${productId}:${position}`;
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);
      pendingRef.current.push({ productId, position });

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
      void ProductService.collectProduct({ productId, source, position }).catch(() => {});
    },
    [source],
  );

  // 탭 이탈/언마운트 시 잔여 노출 전송.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [flush]);

  return { recordImpression, recordClick };
}
