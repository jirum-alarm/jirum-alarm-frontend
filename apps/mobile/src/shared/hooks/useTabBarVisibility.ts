import {useCallback, useSyncExternalStore} from 'react';

let tabBarVisible = true;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

export function setTabBarVisible(visible: boolean) {
  if (tabBarVisible === visible) return;
  tabBarVisible = visible;
  emitChange();
}

export function useTabBarVisibility() {
  return useSyncExternalStore(
    useCallback(listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []),
    () => tabBarVisible,
  );
}
