import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';

/**
 * 알림 목록의 "새 알림" 강조 기준 시각.
 *
 * web 은 같은 값을 localStorage(`gr-alarm-last-read-at`)에 뒀지만, 네이티브 탭은
 * 웹 localStorage 를 못 읽는다. 강조 표시는 화면 안에서만 쓰는 로컬 상태이므로
 * ponytail: 브릿지로 웹과 동기화하지 않고 AsyncStorage 에 따로 둔다.
 * (읽음 여부 자체는 서버 `readAt` 이 정본이라 두 저장소가 갈려도 데이터는 안 어긋난다.)
 */
export async function getLastAlarmReadAt(): Promise<number> {
  const stored = await getAsyncStorage(StorageKey.ALARM_LAST_READ_AT);
  return typeof stored === 'number' ? stored : 0;
}

export async function setLastAlarmReadAt(): Promise<void> {
  await setAsyncStorage(StorageKey.ALARM_LAST_READ_AT, Date.now());
}
