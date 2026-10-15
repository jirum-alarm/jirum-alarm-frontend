import {useSyncExternalStore} from 'react';

/**
 * 1초마다 갱신되는 현재 시각 — 타이머용. 화면의 타이머가 몇 개든 interval 은 하나만 돈다.
 * web shared/hooks/useNow 와 같다(웹은 하이드레이션 때문에 처음에 null 이지만 앱은 바로 시각을 준다).
 */
let current = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (!timer) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      listeners.forEach(listener => listener());
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

export const useNow = (): number =>
  useSyncExternalStore(subscribe, () => current);
