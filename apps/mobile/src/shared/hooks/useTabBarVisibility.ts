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

/**
 * 라우트가 정한 탭바 표시. 숨김도 다시 보이기도 **즉시**다.
 *
 * 한때 "다시 보이기"를 스택 전환이 끝날 때까지(최대 350ms) 미뤘다 — 뒤로 가기 중 탭바가
 * 250ms 미끄러져 올라오는 게 거슬린다는 지적 때문. 그런데 슬라이드를 없앤 뒤엔 미루기만 남아
 * "상세에서 나오면 바텀바가 뒤늦게 생긴다"(2026-10-01 사용자)가 됐다. 슬라이드가 없으니
 * 바로 보여도 움직이지 않는다 — 뒤로 가기를 시작하는 순간 제자리에 있다.
 */
export function setTabBarVisible(visible: boolean) {
  if (routeVisible === visible) return;
  routeVisible = visible;
  emitChange();
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
