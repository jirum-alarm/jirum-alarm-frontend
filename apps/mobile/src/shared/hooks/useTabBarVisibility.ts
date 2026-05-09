import {useCallback, useSyncExternalStore} from 'react';

let routeVisible = true;
let channelTalkOpen = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function getVisible() {
  return routeVisible && !channelTalkOpen;
}

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
