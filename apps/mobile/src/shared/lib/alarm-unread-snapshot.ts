import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

/**
 * "알림함을 마지막으로 본 시점의 미읽음 수" 스냅샷.
 *
 * 탭바 빨간 점의 판정은 `미읽음 > 0` 이 **아니다** — 마지막으로 본 뒤로
 * 미읽음이 늘었는지로 켠다(web `gr-alarm-unread-count-after-read` 와 같은 규칙).
 * 안 읽고 남겨둔 알림이 점을 영구히 켜두면 점이 신호 역할을 못 한다.
 *
 * web 은 localStorage 를 렌더 중 동기로 읽지만 AsyncStorage 는 비동기다 →
 * 메모리에 들고(useSyncExternalStore 소스) 쓸 때마다 디스크로 미러링한다.
 * 첫 프레임엔 NO_SNAPSHOT 이라 미읽음이 있으면 점이 켜져 보이고, hydrate 가
 * 도착하면 정정된다 — 점이 늦게 켜지는 쪽보다 늦게 꺼지는 쪽이 덜 나쁘다.
 */
export const NO_SNAPSHOT = -1;

// ponytail: 키를 StorageKey 상수 테이블에 올리지 않고 여기 둔다. 이 값을 읽고 쓰는
// 곳이 이 파일뿐이라 등록해서 얻는 이득이 없다(그 파일은 지금 다른 작업 소유이기도 하다).
const SNAPSHOT_KEY = 'alarmUnreadCountAfterRead';

let snapshot: number = NO_SNAPSHOT;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

export function getAlarmUnreadSnapshot() {
  return snapshot;
}

export function subscribeAlarmUnreadSnapshot(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 알림함을 본 순간의 미읽음 수를 기준선으로 박는다. */
export function setAlarmUnreadSnapshot(count: number) {
  snapshot = count;
  emitChange();
  // 디스크 쓰기 실패(용량 등)가 점 판정을 깨서는 안 된다 — 메모리 값이 이미 정답이다.
  setAsyncStorage(SNAPSHOT_KEY, count).catch(() => {});
}

/**
 * 앱 시작 시 한 번. 이미 이번 실행에서 기준선을 박았으면 덮지 않는다 —
 * 디스크 값은 더 낡았다(hydrate 가 늦게 도착해 방금 본 기록을 되돌리던 자리).
 */
export async function hydrateAlarmUnreadSnapshot() {
  if (snapshot !== NO_SNAPSHOT) return;
  try {
    const stored = await getAsyncStorage(SNAPSHOT_KEY);
    if (snapshot === NO_SNAPSHOT && typeof stored === 'number') {
      snapshot = stored;
      emitChange();
    }
  } catch {
    // 못 읽으면 NO_SNAPSHOT 유지 = 미읽음이 있으면 점을 켠다(안전한 쪽).
  }
}
