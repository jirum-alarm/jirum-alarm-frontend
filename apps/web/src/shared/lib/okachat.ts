/**
 * 핫딜 Only 오픈카톡방. 상세 soft 배너·구매 후 권유·첫 방문 시트·홈 배너가 같은 방을 가리킨다.
 * 홈 배너(features/banner)도 입장 기록을 써서 shared 에 둔다. import 없이 자족 — okachat.test.ts 가 맨 node 로 돈다.
 */
export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

/**
 * 오카방 구분. hotdeal = 위 핫딜 Only 방(기존 권유 전부), beauty = 뷰티 핫딜 방(/beauty 랜딩, 링크는 env).
 * GA4 이벤트에 room 파라미터로 실어 방별 입장 클릭을 가른다.
 */
export type OkachatRoom = 'hotdeal' | 'beauty';

/** 입장 클릭 후 soft/구매후 권유를 다시 안 띄우기 위한 플래그. */
export const OKACHAT_JOINED_KEY = 'jirum:okachat-joined';

/** 방마다 입장 기록을 따로 둔다 — 핫딜방에 들어간 사람에게도 뷰티방 권유는 보여야 한다. 핫딜방은 옛 키 그대로. */
const joinedKey = (room: OkachatRoom) =>
  room === 'hotdeal' ? OKACHAT_JOINED_KEY : `${OKACHAT_JOINED_KEY}:${room}`;

/** markOkachatJoined 가 window 에 쏘는 이벤트 — 떠 있는 권유가 듣고 숨는다. */
export const OKACHAT_JOINED_EVENT = 'jirum:okachat-joined';

/** 방별 입장 이벤트 이름. 핫딜방은 옛 이름 그대로 — 다른 방 입장은 핫딜방 권유를 숨기지 않는다. */
export const okachatJoinedEvent = (room: OkachatRoom) =>
  room === 'hotdeal' ? OKACHAT_JOINED_EVENT : `${OKACHAT_JOINED_EVENT}:${room}`;

export function hasJoinedOkachat(room: OkachatRoom = 'hotdeal'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(joinedKey(room)) === '1';
  } catch {
    return false;
  }
}

export function markOkachatJoined(room: OkachatRoom = 'hotdeal'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(joinedKey(room), '1');
  } catch {
    // private mode 등 — 권유만 반복될 수 있음, 클릭 자체는 동작
  }
  // 같은 화면에 떠 있는 같은 방 권유(상세 soft 카드 등)도 바로 숨도록 알린다 —
  // 예전엔 첫 방문 시트에서 들어가도 아래 카드가 그대로 남아 같은 방을 또 권했다.
  // 이벤트 이름이 방마다 달라 다른 방 입장으로 핫딜방 권유가 숨지 않는다.
  window.dispatchEvent(new Event(okachatJoinedEvent(room)));
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

/**
 * 다른 방(open.kakao.com/o/<코드>) 링크로 같은 모양의 intent 를 만든다. 코드를 못 읽으면 null —
 * 호출자는 그냥 링크로 보낸다. 핫딜방 링크를 넣으면 OKACHAT_ANDROID_INTENT 와 같아야 한다(테스트).
 */
export function okachatAndroidIntent(link: string): string | null {
  const code = /^https:\/\/open\.kakao\.com\/o\/([A-Za-z0-9]+)\/?$/.exec(link.trim())?.[1];
  if (!code) return null;
  return `intent://join?l=${code}&r=EW#Intent;scheme=kakaoopen;package=com.kakao.talk;S.browser_fallback_url=${encodeURIComponent(link.trim())};end`;
}

/**
 * iOS 용 — 중간 페이지 「참여하기」가 쓰는 data-join-scheme 그대로. open.kakao.com 은 유니버설 링크가
 * 아니어서(/.well-known/apple-app-site-association 이 kakaocorp.com 으로 302, 2026-10-16 확인)
 * iOS 도 링크를 누르면 중간 페이지를 거친다. 코드를 못 읽으면 null.
 */
export function okachatJoinScheme(link: string): string | null {
  const code = /^https:\/\/open\.kakao\.com\/o\/([A-Za-z0-9]+)\/?$/.exec(link.trim())?.[1];
  return code ? `kakaoopen://join?l=${code}&r=EW` : null;
}

/**
 * iOS 직행을 켜는 시각. 안드로이드 직행 실험(obs_web_kakao_room_direct)의 주 지표가 방 인원 순증이라
 * 판정일(10/26)까지 iOS 를 같이 바꾸면 효과를 가를 수 없다 — 판정 다음 날 0시(KST)부터 켠다.
 */
export const OKACHAT_IOS_DIRECT_FROM = Date.parse('2026-10-27T00:00:00+09:00');

/**
 * 카톡으로 넘어갔는지 판정하는 대기 시간. 넘어가면 이 안에 화면이 가려진다.
 * iOS 사파리는 「카카오톡에서 열겠습니까?」를 한 번 더 묻기 때문에 누를 시간을 더 준다.
 */
const OKACHAT_HANDOFF_WAIT_MS = { android: 2500, ios: 4000 } as const;

export type OkachatDirectPlatform = keyof typeof OKACHAT_HANDOFF_WAIT_MS;

/**
 * 카톡을 바로 열 플랫폼. 안드로이드 브라우저(네이버 앱 인앱 포함)는 intent, iPhone 은 OKACHAT_IOS_DIRECT_FROM
 * 부터 kakaoopen 스킴. PC 는 null — 카카오 PC 페이지가 이미 PC 카톡 참여·QR 을 준다. 지름알림 앱 웹뷰는
 * 스킴을 처리하지 않을 수 있어 뺀다(앱은 apps/mobile openOkachat 이 직접 연다).
 * user-agent.ts 의 isAndroidUA·isJirumAlarmAppUA 와 같은 판정(이 파일은 import 없이 맨 node 테스트로 돈다).
 */
export function okachatDirectPlatform(ua: string, now = Date.now()): OkachatDirectPlatform | null {
  if (/(IOS|Android) (ReactNative|Flutter) Webview Jirum Alarm/i.test(ua)) return null;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPod/i.test(ua) && now >= OKACHAT_IOS_DIRECT_FROM) return 'ios';
  return null;
}

/**
 * 안드로이드·iPhone 이면 카톡을 바로 연다. true 를 돌려주면 직접 처리한 것이니 호출자는 기본 이동을 막는다.
 *
 * 결과를 okachat_handoff(result=app|fallback) 로 남긴다 — 이전엔 클릭 뒤를 알 수 없었다.
 * - 카톡이 열리면 화면만 가려지고 페이지는 남는다 → 대기 후 app.
 * - 카톡이 없어 브라우저가 폴백 페이지로 이동하면 pagehide 가 온다 → fallback.
 * - 아무 일도 없으면(인앱 웹뷰가 intent 를 삼킴) 대기 후 중간 페이지로 직접 보낸다 → fallback.
 */
export function openOkachatDirect(
  placement: OkachatPlacement,
  {
    room = 'hotdeal',
    link = OKACHAT_LINK,
    exp,
  }: { room?: OkachatRoom; link?: string; exp?: string } = {},
): boolean {
  if (typeof window === 'undefined') return false;
  const platform = okachatDirectPlatform(window.navigator.userAgent);
  if (!platform) return false;
  const target =
    platform === 'ios'
      ? okachatJoinScheme(link)
      : room === 'hotdeal'
        ? OKACHAT_ANDROID_INTENT
        : okachatAndroidIntent(link);
  if (!target) return false;

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
    pushOkachatHandoff(placement, result, room, exp);
  };
  const onPageHide = () => settle('fallback');

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.location.href = target;

  window.setTimeout(() => {
    if (settled) return;
    if (hidden) {
      settle('app');
      return;
    }
    settle('fallback');
    window.location.href = link;
  }, OKACHAT_HANDOFF_WAIT_MS[platform]);

  return true;
}

function pushOkachatHandoff(
  placement: OkachatPlacement,
  result: 'app' | 'fallback',
  room: OkachatRoom,
  exp?: string,
) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'okachat_handoff',
    placement,
    result,
    room,
    // GTM 데이터 영역은 페이지 동안 값을 기억한다 — 실험 없는 이벤트도 exp 를 비워야 앞 이벤트 값이 안 샌다.
    exp: exp ?? undefined,
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

/**
 * exp = 실험 군 표식 `<실험id>:<군>`(예: `beauty_detail_room_v1:b`). 실험 대상 화면에서만 싣는다 —
 * GA4 에서 같은 이벤트를 군별로 가른다.
 */
export function pushOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: OkachatPlacement,
  room: OkachatRoom = 'hotdeal',
  exp?: string,
) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement,
    room,
    // GTM 데이터 영역은 페이지 동안 값을 기억한다 — 실험 없는 이벤트도 exp 를 비워야 앞 이벤트 값이 안 샌다.
    exp: exp ?? undefined,
  });
}
