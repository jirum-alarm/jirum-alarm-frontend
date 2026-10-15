'use client';

import { useSyncExternalStore } from 'react';

/**
 * 1초마다 갱신되는 현재 시각 — 타이머용. 화면의 타이머가 몇 개든 interval 은 하나만 돈다.
 * 서버 렌더·하이드레이션 땐 null — 서버와 브라우저 시각이 달라 하이드레이션이 깨지지 않게 그 뒤에 채운다.
 */
let current: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (!timer) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      listeners.forEach((listener) => listener());
    }, 1000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};

export const useNow = (): number | null =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
