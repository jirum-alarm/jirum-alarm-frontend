/**
 * 카톡 링크를 앱으로 바로 열기(2026-10-15, vault domain/kakao-to-app-bridge.md 의 C2).
 *
 * 카톡방 링크는 카톡 인앱 브라우저로 열린다. 앱이 깔린 사람도 매번 카톡 안의 웹으로 보고, 거기선 로그인·알림이
 * 따로라 손님이다. 그런데 웹은 이 폰에 앱이 있는지 알 길이 없다 — 카톡 인앱은 앱과도 크롬·사파리와도 저장소가
 * 따로다. 그래서 **배운다**: 카톡 안에서 「앱에서 열기」를 눌러 앱이 열리고 돌아온 사람에게 「다음부터 바로 열까요?」를
 * 한 번 묻고, 네면 이 카톡 브라우저에 기록한다. 다음 카톡 링크부터는 페이지가 뜨자마자 앱으로 넘긴다.
 *
 * 묻지 않고 자동으로 켜지 않는 이유: 안드로이드는 앱이 열려도 Play 로 가도 똑같이 페이지가 가려진다 — 「가려졌으니
 * 앱이 있다」로 판정하면 앱 없는 사람을 링크마다 Play 로 튕기게 된다. 본인이 「네」라고 한 사람만.
 *
 * 자동 이동이 막히면(카톡 iOS 는 사용자 탭 없는 스킴 이동을 막는다 — 10/15 실기기) 「앱에서 열기」 띠 한 번 탭으로 연다.
 * 앱을 지운 뒤: iOS 는 띠를 눌러도 페이지가 그대로 보이면 실패로 센다(2번 연속이면 끈다). 안드로이드는 intent 의
 * fallback 을 이 페이지(+kakao_app=missing)로 둬 도착하면 끈다. 언제든 돌아온 화면의 「자동 열기 끄기」로 끈다.
 *
 * 스킴(jirumalarm://)을 쓰는 이유: 카톡 인앱은 스크립트 이동에도 커스텀 스킴·intent 를 다른 앱으로 넘긴다(국내 결제가
 * 카드사 앱을 이렇게 연다). 유니버설 링크는 사용자가 다른 도메인 링크를 직접 눌러야 하고 인앱에선 보장이 없다.
 * ⚠️ 실기기(카톡 iOS·안드) 확인은 사람이 해야 한다 — 시뮬레이터엔 카톡이 없다.
 *
 * 끄기: 런타임 env NEXT_PUBLIC_KAKAO_APP_OPEN=off. 계측 GA4 kakao_app_open{action}.
 * import 없이 둔다 — kakao-app-open.test.ts 가 맨 node 로 돈다.
 */

export const KAKAO_APP_OPEN_PREF_KEY = 'jirum:kakao-app-open';
/** iOS 자동 열기 연속 실패 수. */
const FAIL_COUNT_KEY = 'jirum:kakao-app-open-fails';
/** 「앱에서 열기」 안내 띠를 이미 보여 줬는지(기기당 한 번). */
const INVITE_SEEN_KEY = 'jirum:kakao-app-open-invited';
/** 안드로이드 intent 가 앱을 못 찾고 돌아왔다는 표시(쿼리). */
export const APP_MISSING_PARAM = 'kakao_app';
export const APP_MISSING_VALUE = 'missing';

export const IOS_FAIL_LIMIT = 2;

/** 카톡 안에서 「앱에서 열기」를 눌렀다(OpenInAppLink → KakaoAppOpen). 돌아오면 「다음부터 바로 열까요?」. */
export const KAKAO_APP_ATTEMPT_EVENT = 'jirum:kakao-app-attempt';

const ANDROID_PACKAGE = 'com.solcode.jirmalam';

/** 앱이 그리는 화면 — apps/web/public/.well-known/apple-app-site-association 의 components 와 같다. */
const APP_PATH = /^\/(products|community|trending|curation|toss|search)(\/|$)/;

export type KakaoAppOpenPref = 'on' | 'off' | null;
export type KakaoPlatform = 'ios' | 'android';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;

const read = (storage: Store, key: string): string | null => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const write = (storage: Store, key: string, value: string | null): void => {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    // 저장소를 못 쓰면 배우지 못한다 — 그냥 웹으로 본다.
  }
};

export const readPref = (storage: Store): KakaoAppOpenPref => {
  const v = read(storage, KAKAO_APP_OPEN_PREF_KEY);
  return v === 'on' || v === 'off' ? v : null;
};

export const writePref = (storage: Store, pref: 'on' | 'off'): void => {
  write(storage, KAKAO_APP_OPEN_PREF_KEY, pref);
  write(storage, FAIL_COUNT_KEY, null);
};

export const isAppPath = (path: string): boolean => APP_PATH.test(path);

export const kakaoPlatform = (ua: string): KakaoPlatform | null =>
  /iPhone|iPad|iPod/i.test(ua) ? 'ios' : /Android/i.test(ua) ? 'android' : null;

/** 이 페이지가 뜨자마자 앱으로 넘길까. */
export const shouldAutoOpen = ({
  on,
  kakaoInApp,
  jirumApp,
  platform,
  path,
  pref,
  search,
}: {
  on: boolean;
  kakaoInApp: boolean;
  jirumApp: boolean;
  platform: KakaoPlatform | null;
  path: string;
  pref: KakaoAppOpenPref;
  search: string;
}): boolean =>
  on &&
  kakaoInApp &&
  !jirumApp &&
  platform !== null &&
  pref === 'on' &&
  isAppPath(path) &&
  !new URLSearchParams(search).has(APP_MISSING_PARAM);

/**
 * 「앱에서 열기」 안내 띠를 띄울까 — 카톡 안, 앱 화면, 아직 묻지 않은 기기에 한 번.
 * 첫 방문 시트(상세 FirstVisitAlertSheet)가 뜨는 방문은 피한다 — 시트가 띠를 덮고, 권유 둘이 겹친다.
 * 카톡 사람은 주에 여러 번 들어와서(1인 6세션) 두 번째 방문이면 충분하다.
 */
export const shouldInvite = ({
  on,
  kakaoInApp,
  jirumApp,
  platform,
  path,
  pref,
  storage,
  firstVisitDone,
}: {
  on: boolean;
  kakaoInApp: boolean;
  jirumApp: boolean;
  platform: KakaoPlatform | null;
  path: string;
  pref: KakaoAppOpenPref;
  storage: Store;
  firstVisitDone: boolean;
}): boolean =>
  firstVisitDone &&
  on &&
  kakaoInApp &&
  !jirumApp &&
  platform !== null &&
  pref === null &&
  isAppPath(path) &&
  read(storage, INVITE_SEEN_KEY) === null;

export const markInvited = (storage: Store): void => write(storage, INVITE_SEEN_KEY, '1');

/** 경로만 남긴다 — 외부 주소를 싣지 않는다. */
const onlyPath = (path: string): string => {
  const p = path.replace(/[?#].*$/, '');
  return p.startsWith('/') && !p.startsWith('//') ? p : '/';
};

/**
 * 앱 여는 주소. 앱은 `jirumalarm:///경로?…` 를 받고 쿼리는 떼고 본다(mobile normalizeDeepLink).
 * 안드로이드 fallback 은 같은 페이지 + kakao_app=missing — 앱이 없으면 여기로 돌아와 자동 열기를 끈다.
 * `source` 는 앱 deeplink_opened{url} 에 handoff= 로 남는다.
 */
export const appOpenUrl = (
  platform: KakaoPlatform,
  path: string,
  source: string,
  origin: string,
  guestDeviceId?: string | null,
): string => {
  const pathname = onlyPath(path);
  const gd =
    guestDeviceId && /^[0-9a-z-]{16,64}$/i.test(guestDeviceId) ? `&gd=${guestDeviceId}` : '';
  const query = `handoff=${encodeURIComponent(source)}${gd}`;
  if (platform === 'ios') return `jirumalarm://${pathname}?${query}`;
  const fallback = encodeURIComponent(
    `${origin}${pathname}?${APP_MISSING_PARAM}=${APP_MISSING_VALUE}`,
  );
  return (
    `intent://${pathname}?${query}` +
    `#Intent;scheme=jirumalarm;package=${ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`
  );
};

/**
 * iOS 자동 열기 주소 — 카톡의 「외부에서 열기」 스킴에 우리 유니버설 링크(www)를 실어 보낸다.
 * 카톡 iOS 는 사용자 탭 없는 jirumalarm:// 이동을 막지만(10/15 실기기), 자기 스킴(kakaotalk://)은 카톡이 직접 처리해
 * 페이지 로드 때도 돈다(인앱 탈출 스크립트들이 그렇게 쓴다). 카톡이 그 주소를 iOS 에 열어 달라고 넘기면, 유니버설
 * 링크라 앱이 깔린 폰은 사파리 대신 앱이 열린다. 앱이 없으면 사파리 → apex 301 → #handoff 로 App Store(AppHandoffLanding).
 * 이것도 막히면 페이지가 그대로라 호출부가 「앱에서 열기」 탭 띠를 띄운다.
 */
export const iosAutoOpenUrl = (
  path: string,
  source: string,
  guestDeviceId?: string | null,
): string => {
  const gd =
    guestDeviceId && /^[0-9a-z-]{16,64}$/i.test(guestDeviceId) ? `&gd=${guestDeviceId}` : '';
  const universal = `https://www.jirum-alarm.com${onlyPath(path)}#handoff=${encodeURIComponent(source)}${gd}`;
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(universal)}`;
};

/** iOS 자동 열기가 안 열렸다. 연속 실패가 한도에 닿으면 끄고 true(꺼졌다). */
export const recordIosFailure = (storage: Store): boolean => {
  const fails = Number(read(storage, FAIL_COUNT_KEY) ?? '0') + 1;
  if (fails >= IOS_FAIL_LIMIT) {
    writePref(storage, 'off');
    return true;
  }
  write(storage, FAIL_COUNT_KEY, String(fails));
  return false;
};

export const recordOpenSuccess = (storage: Store): void => write(storage, FAIL_COUNT_KEY, null);

/**
 * 카톡 인앱 브라우저를 닫는 스킴(비공식 — 카톡 버전에 따라 안 될 수 있다). 앱을 열고 돌아온 사람을 채팅방으로.
 * 출처: 개발자 공유 코드(2023-10 동작 확인) — iOS kakaoweb://closeBrowser, 안드 kakaotalk://inappbrowser/close.
 */
export const closeKakaoBrowserUrl = (platform: KakaoPlatform): string =>
  platform === 'ios' ? 'kakaoweb://closeBrowser' : 'kakaotalk://inappbrowser/close';
