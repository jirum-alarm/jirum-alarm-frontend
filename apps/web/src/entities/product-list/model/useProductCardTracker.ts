'use client';

import { useCallback, useEffect, useRef } from 'react';

import { ProductService } from '@/shared/api/product';

import { rememberCardClick } from '@/entities/product-list/model/card-click-origin';

// 상품 카드 노출/클릭 추적기 (CTR 측정 인프라) — 랭킹 탭·종료 딜 '최신 핫딜' 블록.
// - 노출(분모): viewport 에 실제 보인 카드만 (productId, position) 으로 모아 디바운스 후 일괄 전송.
//   화면에 안 보인 하위 랭크는 기록되지 않음 → fetch 50개 과대계상 회피.
// - 클릭(분자): 카드 클릭 때 source·position 을 적어 두면 상세 진입(CollectProductOnView)이 실어 보낸다.
//   여기서 collectProduct 를 직접 부르면 상세 진입과 합쳐 post_view 가 두 번 남는다(2026-10-12 까지 그랬다).
// - dedup: 같은 (productId, position) 노출은 마운트 동안 1회만.
const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 50;

export function useProductCardTracker(source: string) {
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
    (productId: number, position: number) => rememberCardClick({ productId, source, position }),
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
