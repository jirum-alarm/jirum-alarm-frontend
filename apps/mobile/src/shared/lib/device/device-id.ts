import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';

/** web 이 localStorage 에 쓰는 키와 같아야 한다(웹뷰에서 읽어올 때 대조용). */
export const WEB_DEVICE_ID_KEY = 'jirum-alarm-device-id';

let cached: string | null = null;
/** deviceId 를 기다리는 쪽(푸시 토큰 등록)에게 도착을 알리는 콜백. */
const waiters = new Set<(deviceId: string) => void>();

/**
 * 기기 식별자(X-Device-Id). 조회 수집·푸시 토큰 회수·게스트 계정이 이걸로 기기를 가른다.
 *
 * 예전엔 새로 만들지 않고 웹뷰(TabWebView)의 web localStorage 값을 받아 썼다 — 같은 사람이
 * 둘로 쪼개지지 않게. 그런데 다섯 탭이 네이티브가 된 뒤(2026-09) TabWebView 가 아예 마운트되지
 * 않아, 새로 설치한 앱은 id 가 영영 없었다(2026-10-09 실측: 비로그인 iOS 토큰 55개 전부 기기 없음).
 * id 가 없으면 게스트 계정을 못 만들고 푸시 토큰 회수도 안 된다 → 없으면 여기서 만든다.
 * 이미 받아 둔 웹 값이 있으면 그대로 쓴다.
 */
export async function getDeviceId(): Promise<string | null> {
  if (cached) return cached;
  const stored = await getAsyncStorage(StorageKey.DEVICE_ID);
  if (stored) {
    cached = stored;
    return stored;
  }
  const created = generateDeviceId();
  cached = created;
  await setAsyncStorage(StorageKey.DEVICE_ID, created).catch(() => {});
  return created;
}

/**
 * UUID v4. ponytail: Math.random — 기기 구분용이지 비밀이 아니다. 앱엔 crypto.getRandomValues 가 없고
 * expo-crypto 를 넣으면 네이티브 변경(스토어 빌드)이 된다. 추측 저항이 필요해지면 그때 바꾼다.
 */
function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = Math.floor(Math.random() * 16);
    return (ch === 'x' ? r : 8 + (r % 4)).toString(16); // y = 8~b(variant)
  });
}

/** 웹뷰에서 읽어온 deviceId 를 네이티브 쪽에 저장한다. */
export async function syncDeviceIdFromWeb(deviceId: string | null | undefined) {
  if (!deviceId || cached === deviceId) return;
  cached = deviceId;
  await setAsyncStorage(StorageKey.DEVICE_ID, deviceId);
  // 먼저 떠서 기다리고 있는 푸시 토큰 등록을 깨운다(아래 waitForDeviceId 참고).
  for (const notify of waiters) notify(deviceId);
  waiters.clear();
}

/**
 * deviceId 가 준비될 때까지 기다린다. 없으면 timeoutMs 후 null.
 *
 * 푸시 토큰 등록(addPushToken)에 X-Device-Id 가 빠지면 서버가 deviceId=NULL 로 저장하고,
 * 그 토큰은 "같은 기기의 옛 토큰 회수" 대상에서 영구히 제외돼 알림이 중복 발송된다
 * (서버는 살아있는 토큰당 1건 보낸다). 첫 설치/스토리지 클리어 후 첫 실행에서는
 * FCM 등록이 웹뷰의 DEVICE_ID_SYNC 보다 먼저 떠서 실제로 이 상황이 발생한다.
 *
 * 그래서 등록만 잠깐 기다린다. 무한정 기다리지는 않는다 — 웹뷰가 안 뜨는 경로(권한 거부,
 * 오프라인)에서 푸시 등록 자체가 막히면 알림이 아예 안 가는 더 큰 사고다.
 */
export function waitForDeviceId(timeoutMs = 10_000): Promise<string | null> {
  if (cached) return Promise.resolve(cached);

  return new Promise(resolve => {
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      waiters.delete(notify);
      clearTimeout(timer);
      resolve(value);
    };
    const notify = (deviceId: string) => finish(deviceId);
    const timer = setTimeout(() => finish(null), timeoutMs);

    waiters.add(notify);
    // 경합 방지: waiter 를 등록하는 사이에 AsyncStorage 에서 채워졌을 수 있다.
    getDeviceId().then(stored => {
      if (stored) finish(stored);
    });
  });
}

/** 웹뷰에 주입해 localStorage 의 deviceId 를 네이티브로 올려보내는 스크립트. */
export const DEVICE_ID_SYNC_SCRIPT = `
  (function() {
    try {
      var id = localStorage.getItem('${WEB_DEVICE_ID_KEY}');
      if (id && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({type: 'DEVICE_ID_SYNC', payload: {data: {deviceId: id}}})
        );
      }
    } catch (e) {}
  })();
  true;
`;
