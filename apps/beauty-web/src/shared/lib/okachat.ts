/**
 * 뷰티 카톡방 입장 — apps/web shared/lib/okachat.ts 에서 뷰티방에 필요한 조각만 옮겼다.
 * 저장소 키·이벤트 이름·파라미터가 web 과 같아야 한다: 같은 도메인이라 web /beauty 에서 들어간 사람에게 다시 권하지 않고,
 * GA4 에선 room=beauty 로 web 의 뷰티방 클릭과 합쳐 보고 placement 로 가른다. import 없이 자족(테스트가 맨 node 로 돈다).
 */

/** web OKACHAT_JOINED_KEY + ':beauty' (joinedKey('beauty')). */
const BEAUTY_JOINED_KEY = 'jirum:okachat-joined:beauty';
const ROOM = 'beauty';

export function hasJoinedBeautyRoom(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(BEAUTY_JOINED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markBeautyRoomJoined(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BEAUTY_JOINED_KEY, '1');
  } catch {
    // private mode 등 — 권유만 반복될 수 있음, 클릭 자체는 동작
  }
}

/** 오픈채팅 링크(open.kakao.com/o/<코드>)로 카톡을 바로 여는 안드로이드 intent. 코드를 못 읽으면 null. */
export function okachatAndroidIntent(link: string): string | null {
  const code = /^https:\/\/open\.kakao\.com\/o\/([A-Za-z0-9]+)\/?$/.exec(link.trim())?.[1];
  if (!code) return null;
  return `intent://join?l=${code}&r=EW#Intent;scheme=kakaoopen;package=com.kakao.talk;S.browser_fallback_url=${encodeURIComponent(link.trim())};end`;
}

/** 안드로이드 브라우저만(지름알림 앱 웹뷰 제외) — iOS 는 open.kakao.com 이 유니버설 링크라 그대로 둔다. */
export function shouldOpenOkachatDirect(ua: string): boolean {
  return (
    /Android/i.test(ua) && !/(IOS|Android) (ReactNative|Flutter) Webview Jirum Alarm/i.test(ua)
  );
}

const OKACHAT_HANDOFF_WAIT_MS = 2500;

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

const pushDataLayer = (payload: Record<string, unknown>) => {
  (window as DataLayerWindow).dataLayer?.push(payload);
};

export function pushOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: string,
) {
  if (typeof window === 'undefined') return;
  pushDataLayer({ event, placement, room: ROOM });
}

/**
 * 안드로이드면 카톡을 바로 연다. true 면 직접 처리했으니 호출자는 기본 이동을 막는다.
 * 결과를 okachat_handoff(result=app|fallback) 로 남긴다 — web openOkachatDirect 와 같은 판정.
 */
export function openOkachatDirect(placement: string, link: string): boolean {
  if (typeof window === 'undefined' || !shouldOpenOkachatDirect(window.navigator.userAgent)) {
    return false;
  }
  const intent = okachatAndroidIntent(link);
  if (!intent) return false;

  let hidden = false;
  let settled = false;
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') hidden = true;
  };
  const settle = (result: 'app' | 'fallback') => {
    if (settled) return;
    settled = true;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    pushDataLayer({ event: 'okachat_handoff', placement, result, room: ROOM });
  };
  const onPageHide = () => settle('fallback');

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.location.href = intent;

  window.setTimeout(() => {
    if (settled) return;
    if (hidden) {
      settle('app');
      return;
    }
    settle('fallback');
    window.location.href = link;
  }, OKACHAT_HANDOFF_WAIT_MS);

  return true;
}
