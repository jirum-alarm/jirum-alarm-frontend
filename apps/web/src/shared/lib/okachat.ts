/**
 * 핫딜 Only 오픈카톡방. 상세 soft 배너·구매 후 권유·첫 방문 시트·홈 배너가 같은 방을 가리킨다.
 * 홈 배너(features/banner)도 입장 기록을 써서 shared 에 둔다. import 없이 자족 — okachat.test.ts 가 맨 node 로 돈다.
 */
export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

/** 입장 클릭 후 soft/구매후 권유를 다시 안 띄우기 위한 플래그. */
export const OKACHAT_JOINED_KEY = 'jirum:okachat-joined';

/** markOkachatJoined 가 window 에 쏘는 이벤트 — 떠 있는 권유가 듣고 숨는다. */
export const OKACHAT_JOINED_EVENT = 'jirum:okachat-joined';

export function hasJoinedOkachat(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(OKACHAT_JOINED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOkachatJoined(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OKACHAT_JOINED_KEY, '1');
  } catch {
    // private mode 등 — 권유만 반복될 수 있음, 클릭 자체는 동작
  }
  // 같은 화면에 떠 있는 다른 오카방 권유(상세 soft 카드 등)도 바로 숨도록 알린다 —
  // 예전엔 첫 방문 시트에서 들어가도 아래 카드가 그대로 남아 같은 방을 또 권했다.
  window.dispatchEvent(new Event(OKACHAT_JOINED_EVENT));
}

export type OkachatPlacement = 'soft' | 'after_purchase' | 'first_visit' | 'home_banner';

/**
 * 안드로이드에서 카카오 중간 페이지(open.kakao.com)를 건너뛰고 카톡을 바로 여는 intent.
 * 값은 그 중간 페이지의 「참여하기」 버튼이 쓰는 data-intent-uri 그대로다. 카톡이 없으면
 * 브라우저가 browser_fallback_url(= 지금의 중간 페이지)로 보낸다.
 *
 * 웹은 링크를 누르면 중간 페이지가 뜨고 「참여하기」를 한 번 더 눌러야 했다 — 4주 클릭 ~550명에
 * 방 순증 ~40명(2026-10-12). 앱(apps/mobile openOkachat)은 이미 카톡으로 바로 넘긴다.
 */
export const OKACHAT_ANDROID_INTENT = `intent://join?l=gJZTWAAg&r=EW#Intent;scheme=kakaoopen;package=com.kakao.talk;S.browser_fallback_url=${encodeURIComponent(OKACHAT_LINK)};end`;

/** 카톡으로 넘어갔는지 판정하는 대기 시간. 넘어가면 이 안에 화면이 가려진다. */
const OKACHAT_HANDOFF_WAIT_MS = 2500;

/**
 * 카톡을 바로 열 대상인가. 안드로이드 브라우저(네이버 앱 인앱 포함)만 — iOS 는 open.kakao.com 이
 * 유니버설 링크라 그대로 두고, 지름알림 앱 웹뷰는 intent 를 처리하지 않을 수 있어 뺀다.
 * user-agent.ts 의 isAndroidUA·isJirumAlarmAppUA 와 같은 판정(이 파일은 import 없이 맨 node 테스트로 돈다).
 */
export function shouldOpenOkachatDirect(ua: string): boolean {
  return (
    /Android/i.test(ua) && !/(IOS|Android) (ReactNative|Flutter) Webview Jirum Alarm/i.test(ua)
  );
}

/**
 * 안드로이드면 카톡을 바로 연다. true 를 돌려주면 직접 처리한 것이니 호출자는 기본 이동을 막는다.
 *
 * 결과를 okachat_handoff(result=app|fallback) 로 남긴다 — 이전엔 클릭 뒤를 알 수 없었다.
 * - 카톡이 열리면 화면만 가려지고 페이지는 남는다 → 대기 후 app.
 * - 카톡이 없어 브라우저가 폴백 페이지로 이동하면 pagehide 가 온다 → fallback.
 * - 아무 일도 없으면(인앱 웹뷰가 intent 를 삼킴) 대기 후 중간 페이지로 직접 보낸다 → fallback.
 */
export function openOkachatDirect(placement: OkachatPlacement): boolean {
  if (typeof window === 'undefined' || !shouldOpenOkachatDirect(window.navigator.userAgent)) {
    return false;
  }

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
    pushOkachatHandoff(placement, result);
  };
  const onPageHide = () => settle('fallback');

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.location.href = OKACHAT_ANDROID_INTENT;

  window.setTimeout(() => {
    if (settled) return;
    if (hidden) {
      settle('app');
      return;
    }
    settle('fallback');
    window.location.href = OKACHAT_LINK;
  }, OKACHAT_HANDOFF_WAIT_MS);

  return true;
}

function pushOkachatHandoff(placement: OkachatPlacement, result: 'app' | 'fallback') {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'okachat_handoff',
    placement,
    result,
  });
}

export type PostPurchasePromptKind = 'kakao' | 'keyword';

/**
 * 오카방 봇이 심는 UTM (`utm_source=kakao` + campaign hotdeal_only|all_hotdeal|daily_*).
 * 이미 방에서 들어온 사람에게 "입장"을 또 권하면 노이즈다.
 */
export function isFromKakaoOpenChat(
  search = typeof window !== 'undefined' ? window.location.search : '',
): boolean {
  const params = new URLSearchParams(search);
  if (params.get('utm_source') === 'kakao') return true;
  const campaign = params.get('utm_campaign') ?? '';
  return campaign === 'hotdeal_only' || campaign === 'all_hotdeal' || campaign.startsWith('daily_');
}

export function shouldShowOkachatSoftPrompt(
  opts: { fromKakao?: boolean; joined?: boolean } = {},
): boolean {
  const fromKakao = opts.fromKakao ?? isFromKakaoOpenChat();
  const joined = opts.joined ?? hasJoinedOkachat();
  return !fromKakao && !joined;
}

/**
 * 구매 클릭 직후 보여줄 프롬프트 큐.
 * - 이미 오카방 유입/입장함 → 키워드만
 * - 비로그인 → 오카방 먼저(로그인 게이트 없음) → 키워드
 * - 로그인 → 키워드 먼저 → 오카방
 */
export function buildPostPurchasePromptQueue(
  isLoggedIn: boolean,
  opts: { fromKakao?: boolean; joined?: boolean } = {},
): PostPurchasePromptKind[] {
  const fromKakao = opts.fromKakao ?? isFromKakaoOpenChat();
  const joined = opts.joined ?? hasJoinedOkachat();
  if (fromKakao || joined) {
    return ['keyword'];
  }
  if (!isLoggedIn) {
    return ['kakao', 'keyword'];
  }
  return ['keyword', 'kakao'];
}

export function pushOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: OkachatPlacement,
) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement,
  });
}
