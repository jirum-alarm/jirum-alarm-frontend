import {useCallback, useSyncExternalStore} from 'react';

let unreadCount = 0;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

export function setUnreadCount(count: number) {
  unreadCount = count;
  emitChange();
}

export function getUnreadCount() {
  return unreadCount;
}

export function useUnreadNotifications() {
  const count = useSyncExternalStore(
    useCallback(listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []),
    () => unreadCount,
  );

  return count;
}
