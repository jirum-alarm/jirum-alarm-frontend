'use client';

import { useCallback, useEffect, useRef } from 'react';

const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 50;

// viewport 노출/클릭 계측 공통 훅.
// - impression: 화면에 보인 항목만 디바운스 후 bulk 전송. 마운트 동안 같은 key 1회만.
// - click: 즉시 전송 (fire-and-forget).
// - 탭 이탈/언마운트 시 잔여 impression 자동 flush.
//
// onFlushImpressions: 쌓인 key 배열 → 실제 API 호출 책임은 호출부에.
// onRecordClick: 클릭된 key → 실제 API 호출 책임은 호출부에.
export function useImpressionTracker<TKey>({
  onFlushImpressions,
  onRecordClick,
  toDedupeKey,
}: {
  onFlushImpressions: (keys: TKey[]) => void;
  onRecordClick: (key: TKey) => void;
  toDedupeKey: (key: TKey) => string;
}) {
  const seenRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef<TKey[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (pending.length === 0) return;
    pendingRef.current = [];
    onFlushImpressions(pending);
  }, [onFlushImpressions]);

  const recordImpression = useCallback(
    (key: TKey) => {
      const dedupeKey = toDedupeKey(key);
      if (seenRef.current.has(dedupeKey)) return;
      seenRef.current.add(dedupeKey);
      pendingRef.current.push(key);

      if (pendingRef.current.length >= MAX_BATCH) {
        flush();
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, FLUSH_DEBOUNCE_MS);
    },
    [flush, toDedupeKey],
  );

  const recordClick = useCallback(
    (key: TKey) => {
      onRecordClick(key);
    },
    [onRecordClick],
  );

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
