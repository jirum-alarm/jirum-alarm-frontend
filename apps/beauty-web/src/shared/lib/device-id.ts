/**
 * 기기 ID — web 과 **같은 저장소 키**를 쓴다(같은 도메인이라 localStorage·쿠키를 공유한다).
 * 그래서 /beauty 에서 본 카드 노출과 /products 상세 진입·구매 클릭이 같은 기기로 이어진다.
 * web app/(app)/providers/deviceId.tsx·shared/lib/http-client.ts 의 규칙 그대로: localStorage 가 진실, 쿠키는 사본.
 */
export const DEVICE_ID_KEY = 'jirum-alarm-device-id';
const DEVICE_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const readDeviceIdCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)jirum-alarm-device-id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const writeDeviceIdCookie = (deviceId: string) => {
  const parts = [
    `${DEVICE_ID_KEY}=${deviceId}`,
    'Path=/',
    `Max-Age=${DEVICE_ID_COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ];
  if (window.location.protocol === 'https:') parts.push('Secure');
  document.cookie = parts.join('; ');
};

/** web 은 uuid v7 을 쓴다. 형식만 맞으면 서버는 구분하지 않는다 — 의존성 없이 브라우저 내장 v4. */
const generateDeviceId = () => crypto.randomUUID();

/**
 * 기기 ID 를 맞춰 두고 돌려준다. isNew = localStorage·쿠키 어디에도 없던 첫 방문(→ web 처럼 addUserDevice 등록).
 * 저장소가 막힌 브라우저(시크릿·웹뷰)면 이번 페이지 동안만 쓰는 값을 돌려준다.
 */
export function syncDeviceId(): { deviceId: string; isNew: boolean } {
  let local: string | null = null;
  try {
    local = localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    // 저장소 막힘
  }
  const cookie = readDeviceIdCookie();
  const isNew = !local && !cookie;
  const deviceId = local ?? cookie ?? generateDeviceId();
  try {
    if (deviceId !== local) localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {
    // 저장소 막힘 — 쿠키만이라도
  }
  if (deviceId !== cookie) writeDeviceIdCookie(deviceId);
  return { deviceId, isNew };
}

export function readDeviceId(): string | null {
  try {
    return localStorage.getItem(DEVICE_ID_KEY) ?? readDeviceIdCookie();
  } catch {
    return readDeviceIdCookie();
  }
}
