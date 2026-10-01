import {useCallback, useSyncExternalStore} from 'react';

let routeVisible = true;
let channelTalkOpen = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

/** 지금 탭바가 보이는가(구독 없이 읽기). */
export function getVisible() {
  return routeVisible && !channelTalkOpen;
}

export function setTabBarVisible(visible: boolean) {
  if (routeVisible === visible) return;
  routeVisible = visible;
  emitChange();
}

/**
 * 라우트가 정한 탭바 표시 — 숨김은 **즉시**, 다시 보이기는 **스택 전환이 끝난 뒤**.
 *
 * 예전엔 뒤로 가기를 시작하자마자 탭바가 250ms 미끄러져 올라와, 아직 빠져나가는 상세의
 * 찜·구매 줄 위에서 움직였다(사용자 지적 "상세 들어갔다 나올 때 바텀바 움직이는 게 불편").
 * 지금은 상세가 다 빠진 뒤 제자리에 나타난다. 전환 끝(transitionEnd)이 안 오는 경우
 * (애니메이션 없는 이동 등)를 위해 전환 길이만큼 안전 타이머를 둔다.
 */
const SHOW_AFTER_TRANSITION_MS = 350;
let pendingShow: ReturnType<typeof setTimeout> | null = null;

function cancelPendingShow() {
  if (pendingShow) clearTimeout(pendingShow);
  pendingShow = null;
}

export function requestTabBarVisible(visible: boolean) {
  if (!visible) {
    cancelPendingShow();
    setTabBarVisible(false);
    return;
  }
  if (routeVisible) {
    cancelPendingShow();
    return;
  }
  if (!pendingShow) {
    pendingShow = setTimeout(flushTabBarShow, SHOW_AFTER_TRANSITION_MS);
  }
}

/** 스택 전환이 끝났다 — 기다리던 "다시 보이기" 가 있으면 지금 보인다. */
export function flushTabBarShow() {
  if (!pendingShow) return;
  cancelPendingShow();
  setTabBarVisible(true);
}

export function setChannelTalkOpen(open: boolean) {
  if (channelTalkOpen === open) return;
  channelTalkOpen = open;
  emitChange();
}

export function useTabBarVisibility() {
  return useSyncExternalStore(
    useCallback(listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []),
    getVisible,
  );
}
