import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';

/** web 이 localStorage 에 쓰는 키와 같아야 한다(웹뷰에서 읽어올 때 대조용). */
export const WEB_DEVICE_ID_KEY = 'jirum-alarm-device-id';

let cached: string | null = null;

/**
 * 조회 수집(collectProduct)의 사용자 식별자.
 *
 * ⚠️ 새로 만들지 않는 게 핵심이다. 앱의 웹뷰는 이미 web 이 발급한 deviceId 를
 * localStorage 에 갖고 있는데, 네이티브가 별도 id 를 발급하면 같은 사람이 둘로
 * 쪼개져 집계가 어긋난다. web 이 예전에 요청마다 새 id 를 굽다가 운영 91.9%
 * 디바이스가 1상품/1이벤트로 쪼개진 전례가 있다.
 *
 * 그래서 순서는 (1) AsyncStorage 캐시 → (2) 웹뷰 localStorage 에서 동기화.
 * 둘 다 없으면 id 없이 보낸다 — 헤더가 없으면 서버가 알아서 처리하므로,
 * 틀린 id 를 만들어 보내는 것보다 낫다.
 */
export async function getDeviceId(): Promise<string | null> {
  if (cached) return cached;
  const stored = await getAsyncStorage(StorageKey.DEVICE_ID);
  if (stored) {
    cached = stored;
    return stored;
  }
  return null;
}

/** 웹뷰에서 읽어온 deviceId 를 네이티브 쪽에 저장한다. */
export async function syncDeviceIdFromWeb(deviceId: string | null | undefined) {
  if (!deviceId || cached === deviceId) return;
  cached = deviceId;
  await setAsyncStorage(StorageKey.DEVICE_ID, deviceId);
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
