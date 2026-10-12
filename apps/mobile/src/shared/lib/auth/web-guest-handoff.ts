/**
 * 웹 게스트 → 앱 이어받기의 받는 쪽 입구.
 *
 * 웹에서 로그인 없이(게스트로) 키워드를 건 사람이 「앱 열기」를 누르면 링크에 그 게스트를 만든 기기 id(gd)가
 * 실려 온다(web features/app-download/model/appHandoff.ts). 앱은 처음 켜면 자기 기기 id 로 새 게스트를 만들어서
 * 웹에서 건 키워드가 앱에 없었다 — 웹 게스트 47명 중 받을 통로가 있는 사람은 4명(2026-10-12 실측).
 * 백엔드 guestLogin 은 같은 기기 id 에 같은 게스트를 준다(실제 계정 세션은 절대 주지 않는다).
 *
 * 여기는 링크에서 gd 를 꺼내 맡겨 두기만 한다. 실제 이어받기(세션 교체)는 screens/auth/useAdoptWebGuest —
 * 딥링크가 세션 판단(자동 게스트 등)보다 먼저 도착할 수 있어서다.
 */
export const WEB_GUEST_PARAM = 'gd';

// UUID v4 등 기기 id 모양만 받는다 — 주소에 실려 오는 값이라 아무 문자열이나 헤더에 싣지 않는다.
const DEVICE_ID_SHAPE = /^[0-9a-z-]{16,64}$/i;

/** 링크의 쿼리(안드로이드 intent) 또는 해시(iOS 유니버설 링크 #handoff=…&gd=…)에서 기기 id 를 꺼낸다. */
export function readWebGuestDeviceId(url: string): string | null {
  const match = url.match(/[?&#]gd=([^&#]+)/);
  if (!match) return null;
  let value: string;
  try {
    value = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  return DEVICE_ID_SHAPE.test(value) ? value : null;
}

let pending: string | null = null;
const listeners = new Set<(deviceId: string) => void>();

/** 딥링크가 들어올 때마다 부른다. gd 가 있으면 맡겨 두고 이어받기 쪽을 깨운다. */
export function offerWebGuestHandoff(url: string): void {
  const deviceId = readWebGuestDeviceId(url);
  if (deviceId) offerWebGuestDeviceId(deviceId);
}

/** 기기 id 를 바로 맡긴다 — 안드로이드 설치 직후 Play referrer(jirum_gd)로 온 경우. */
export function offerWebGuestDeviceId(deviceId: string): void {
  pending = deviceId;
  listeners.forEach(listener => listener(deviceId));
}

/** 맡겨 둔 기기 id 를 꺼낸다(한 번만). */
export function takePendingWebGuest(): string | null {
  const value = pending;
  pending = null;
  return value;
}

export function subscribeWebGuestHandoff(
  listener: (deviceId: string) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 테스트용. */
export function __resetWebGuestHandoffForTest() {
  pending = null;
  listeners.clear();
}
