import {useSyncExternalStore} from 'react';
import {AppState} from 'react-native';

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

/**
 * 1분 단위 현재 시각 — 「N분 전」(displayTime) 같은 상대 시각용. 1초 타이머를 쓰면 시각 문구가 있는
 * 카드가 매초 다시 그려지므로 따로 돈다(목록 카드 수십 장 × 1초는 낭비).
 * React Compiler 는 렌더 중 `Date.now()` 를 입력(createdAt)만 보고 캐시해 문구가 멈춘다 —
 * 이 값을 인자로 넘기면 시각이 바뀔 때만 다시 계산된다(2026-10-15).
 * 앱이 백그라운드에 있으면 interval 이 멈추므로 다시 켜질 때 바로 한 번 갱신한다.
 * 분 단위로 내린 값이라 구독자가 없을 때도 그 자리에서 계산해 돌려줄 수 있다(같은 분이면 같은 값) —
 * 안 그러면 몇 시간 쉬었다 처음 마운트될 때 옛 시각으로 한 번 그려진다.
 */
const floorMinute = () => Math.floor(Date.now() / 60_000) * 60_000;
let minuteNow = floorMinute();
let minuteTimer: ReturnType<typeof setInterval> | undefined;
let appStateSub: {remove: () => void} | undefined;
const minuteListeners = new Set<() => void>();

const tickMinute = () => {
  minuteNow = floorMinute();
  minuteListeners.forEach(listener => listener());
};

const subscribeMinute = (onChange: () => void) => {
  minuteListeners.add(onChange);
  if (!minuteTimer) {
    minuteNow = floorMinute();
    minuteTimer = setInterval(tickMinute, 60_000);
    appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') tickMinute();
    });
  }
  return () => {
    minuteListeners.delete(onChange);
    if (minuteListeners.size === 0 && minuteTimer) {
      clearInterval(minuteTimer);
      minuteTimer = undefined;
      appStateSub?.remove();
      appStateSub = undefined;
    }
  };
};

const getMinuteNow = () => (minuteTimer ? minuteNow : floorMinute());

export const useNowMinute = (): number =>
  useSyncExternalStore(subscribeMinute, getMinuteNow);
