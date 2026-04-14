import {useCallback, useSyncExternalStore} from 'react';

let hasNewAlarm = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

export function setHasNewAlarm(value: boolean) {
  hasNewAlarm = value;
  emitChange();
}

export function useHasNewAlarm() {
  return useSyncExternalStore(
    useCallback(listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []),
    () => hasNewAlarm,
  );
}
