const LAST_READ_AT_KEY = 'gr-alarm-last-read-at';
const UNREAD_COUNT_KEY = 'gr-alarm-unread-count-after-read';

export function getLastAlarmReadAt(): number {
  try {
    return Number(localStorage.getItem(LAST_READ_AT_KEY) ?? '0');
  } catch {
    return 0;
  }
}

export function getUnreadCountAfterLastRead(): number {
  try {
    const value = localStorage.getItem(UNREAD_COUNT_KEY);
    return value === null ? -1 : Number(value);
  } catch {
    return -1;
  }
}

export function setAlarmReadState(remainingUnreadCount: number): void {
  try {
    localStorage.setItem(LAST_READ_AT_KEY, String(Date.now()));
    localStorage.setItem(UNREAD_COUNT_KEY, String(remainingUnreadCount));
  } catch {
    // ignore localStorage errors (private mode, quota, etc.)
  }
}

export function setUnreadCountSnapshot(count: number): void {
  try {
    localStorage.setItem(UNREAD_COUNT_KEY, String(count));
  } catch {
    // ignore localStorage errors
  }
}

export function setLastAlarmReadAt(): void {
  try {
    localStorage.setItem(LAST_READ_AT_KEY, String(Date.now()));
  } catch {
    // ignore localStorage errors
  }
}
