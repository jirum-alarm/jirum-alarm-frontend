/**
 * 웹 → 앱 넘기기 링크. 「보던 화면 그대로 앱에서」 + 「앱이 없으면 스토어로, 어디서 왔는지 실어서」.
 *
 * 예전엔 모든 앱 버튼이 스토어로 직행했다. 앱이 이미 깔린 사람도 스토어 → 「열기」 → 앱 첫 화면이라
 * 보던 상품을 다시 찾아야 했고, 스토어 링크엔 출처가 없어 어느 버튼이 설치를 만들었는지 몰랐다.
 *
 * - Android: `intent:///<경로>#Intent;scheme=jirumalarm;package=…` — 커스텀 스킴(모든 앱 버전에 등록돼 있다)을
 *   우리 앱으로 지정해 연다. 앱이 있으면 그 화면, 없으면 browser_fallback_url(Play + referrer). https 가 아니라
 *   커스텀 스킴인 이유: 매니페스트의 https 필터를 App Links 용으로 경로를 좁히면(APP_LINKS.md) 홈·알림 같은
 *   경로는 https intent 가 앱에 안 맞아 Play 로 새기 때문 — 스킴은 경로와 무관하다.
 *   referrer 의 utm 은 앱 first_open 의 캠페인으로 잡히고, jirum_path 는 설치 후 첫 실행에 앱이 그 화면을 연다
 *   (apps/mobile src/shared/lib/navigation/deferred-link.ts — Play Install Referrer).
 * - iOS: 유니버설 링크는 **지금 페이지와 다른 도메인**을 눌러야 앱으로 간다(같은 도메인이면 사파리가 연다).
 *   사이트는 apex 라 www 주소를 걸면 다른 도메인이 된다 — entitlements·AASA 둘 다 www 를 등록하고 있다.
 *   앱이 없으면 www → apex 301 로 같은 페이지가 다시 열리고, 끝의 #handoff 를 보고 App Store 로 보낸다
 *   (AppHandoffLanding). AASA 범위 밖 경로(홈 등)는 유니버설 링크가 안 되니 스토어로 바로 보낸다.
 *
 * 표시는 `handoff=<source>` — 안드로이드는 쿼리(#은 intent 문법이 쓴다), iOS 는 해시(서버·웹 통계에 안 남게).
 * 웹 게스트면 `gd=<게스트를 만든 기기 id>` 를 같은 자리에 붙인다 — 앱이 같은 게스트로 이어받아 웹에서 건 키워드가
 * 앱으로 온다(apps/mobile useAdoptWebGuest, 2026-10-12). Play referrer 에도 jirum_gd 로 실어 둔다(설치 직후 첫 실행
 * 이어받기는 Install Referrer 를 앱에 붙일 때).
 * 앱은 둘 다 경로를 볼 때 떼고 보므로(ProductDetailScreen parseProductId·tab-routing extractPath) 옛 앱도 무사하고,
 * 앱의 deeplink_opened{url} 에 그대로 남아 「웹에서 넘어온 열기」를 셀 수 있다.
 *
 * import 없이 둔다 — node --test 로 바로 돈다(browserHandoff.ts 와 같은 이유).
 */
export const ANDROID_PACKAGE = 'com.solcode.jirmalam';
export const HANDOFF_PARAM = 'handoff';

const PLAY_STORE_BASE = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
/**
 * App Store 캠페인 링크(App Store Connect 앱 분석 → 획득 → 캠페인). pt = 프로바이더 토큰(2026-10-12 캠페인 링크
 * 생성기에서 확인), ct = 버튼 자리(최대 30자) — 설치·재다운로드가 캠페인별로 잡힌다(첫 다운로드 5건 이상부터 표시).
 * 스토어프런트 없는 주소라 사용자 나라 스토어로 열린다(예전 상수는 /sg/ 를 박고 있었다).
 */
const IOS_STORE_BASE = 'https://apps.apple.com/app/apple-store/id6474611420';
const IOS_PROVIDER_TOKEN = '126805495';
const WWW_ORIGIN = 'https://www.jirum-alarm.com';

/**
 * apps/web/public/.well-known/apple-app-site-association 의 components 와 맞춘다.
 * `/deals` 는 앱이 열지 않는 페이지라(tab-routing) AASA 에서 뺐다 — 여기 남기면 앱이 있는 사람도 웹에 떨어져
 * #handoff 를 보고 App Store 로 간다.
 */
const UNIVERSAL_LINK_PATH = /^\/(products|community|trending|curation|toss|search)(\/|$)/;

/**
 * 앱 화면이 읽는 쿼리만 싣는다 — 검색어(`/search?keyword=`)·탭(`/toss?tab=`·`/trending/*?tab=`).
 * 예전엔 쿼리를 통째로 떼서 검색 결과·토스 탭에서 「앱으로 보기」를 누르면 앱이 빈 검색·첫 탭으로 열렸다.
 * 나머지(utm·from 등)는 버린다 — 앱 통계에 웹 캠페인이 섞이지 않게.
 */
const HANDOFF_QUERY_KEYS = ['keyword', 'tab'] as const;

/** 버튼이 놓인 자리. GA4 app_download_click 의 source, Play referrer 의 utm_medium 으로 간다. */
export type HandoffSource =
  | 'detail_header'
  | 'first_visit_detail'
  | 'banner'
  | 'alarm_tab'
  | 'push_channel'
  | 'app_page'
  | 'kakao_bridge' // 카톡 인앱에서 키워드를 건 뒤 「앱에서 받기」(shared/lib/kakao-bridge.ts)
  | 'kakao_invite'; // 카톡 인앱 「카톡 링크를 앱으로 바로 열기」 안내 띠(shared/lib/kakao-app-open.ts)

/** '/'로 시작하는 경로 + 앱이 읽는 쿼리(HANDOFF_QUERY_KEYS)만 남긴다 — 외부 주소를 실어 보내지 않는다. */
export const normalizeHandoffPath = (path: string): string => {
  const pathname = path.replace(/[?#].*$/, '');
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return '/';
  const query = path.match(/\?([^#]*)/)?.[1] ?? '';
  const kept = new URLSearchParams();
  const source = new URLSearchParams(query);
  for (const key of HANDOFF_QUERY_KEYS) {
    const value = source.get(key);
    if (value) kept.set(key, value);
  }
  const keptQuery = kept.toString();
  return keptQuery ? `${pathname}?${keptQuery}` : pathname;
};

/** 경로(쿼리가 있을 수도) 뒤에 쿼리 한 쌍을 잇는다. */
const joinQuery = (path: string): string => (path.includes('?') ? '&' : '?');

/** Play 스토어 주소. referrer 는 한 번 인코딩된 쿼리 문자열이어야 Play 가 앱에 그대로 넘긴다. */
export const playStoreUrl = (
  source: HandoffSource,
  path = '/',
  guestDeviceId?: string | null,
): string => {
  const params = new URLSearchParams({
    utm_source: 'jirum_web',
    utm_medium: source,
    utm_campaign: 'app_handoff',
    jirum_path: normalizeHandoffPath(path),
  });
  if (guestDeviceId) params.set('jirum_gd', guestDeviceId);
  const referrer = params.toString();
  return `${PLAY_STORE_BASE}&referrer=${encodeURIComponent(referrer)}`;
};

export const appStoreUrl = (source?: string | null): string =>
  source
    ? `${IOS_STORE_BASE}?pt=${IOS_PROVIDER_TOKEN}&ct=${encodeURIComponent(source.slice(0, 30))}&mt=8`
    : IOS_STORE_BASE;

/** 안드로이드: 앱이 있으면 그 화면, 없으면 Play. 사용자 탭으로만 열린다(크롬은 자동 이동 intent 를 막는다). */
export const androidOpenAppUrl = (
  path: string,
  source: HandoffSource,
  guestDeviceId?: string | null,
): string => {
  const pathname = normalizeHandoffPath(path);
  const fallback = encodeURIComponent(playStoreUrl(source, pathname, guestDeviceId));
  // `intent://` + `/경로` → 앱이 받는 주소는 `jirumalarm:///경로?handoff=…`(슬래시 3개 — 앱 normalizeDeepLink 가 받는 모양).
  return (
    `intent://${pathname}${joinQuery(pathname)}${HANDOFF_PARAM}=${source}${guestSuffix('&', guestDeviceId)}` +
    `#Intent;scheme=jirumalarm;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${fallback};end`
  );
};

/**
 * iOS: 유니버설 링크가 되는 경로면 www 주소(+#handoff), 아니면 null(호출부가 App Store 로).
 */
export const iosOpenAppUrl = (
  path: string,
  source: HandoffSource,
  guestDeviceId?: string | null,
): string | null => {
  const pathname = normalizeHandoffPath(path);
  if (!UNIVERSAL_LINK_PATH.test(pathname.split('?')[0])) return null;
  return `${WWW_ORIGIN}${pathname}#${HANDOFF_PARAM}=${source}${guestSuffix('&', guestDeviceId)}`;
};

/** 웹 게스트 기기 id 표시. 기기 id 모양(UUID 등)만 싣는다. */
export const GUEST_DEVICE_PARAM = 'gd';
const guestSuffix = (joiner: string, guestDeviceId?: string | null): string =>
  guestDeviceId && /^[0-9a-z-]{16,64}$/i.test(guestDeviceId)
    ? `${joiner}${GUEST_DEVICE_PARAM}=${guestDeviceId}`
    : '';

export type HandoffPlatform = 'android' | 'apple';

/**
 * 버튼 href 한 곳.
 *
 * iOS 는 `iosUniversalLink` 일 때만 유니버설 링크를 건다. 앱이 없으면 같은 페이지를 한 번 더 열었다가 App Store 로
 * 가는 우회가 생기는데, 「App Store」라고 적힌 버튼을 누른 사람(대부분 앱이 없다)에게 그 우회는 손해다 — 앱이 있는
 * 사파리 사용자는 이미 Smart App Banner 의 「열기」(app-argument=이 상품)가 있다. 그래서 「앱으로 보기」처럼
 * 앱을 연다고 말하는 버튼만 켠다. 안드로이드 intent 는 앱이 없으면 곧장 Play 라 우회가 없어 늘 쓴다.
 */
export const appHandoffHref = (
  platform: HandoffPlatform,
  path: string,
  source: HandoffSource,
  {
    iosUniversalLink = false,
    guestDeviceId,
  }: { iosUniversalLink?: boolean; guestDeviceId?: string | null } = {},
): string => {
  if (platform === 'android') return androidOpenAppUrl(path, source, guestDeviceId);
  return (iosUniversalLink && iosOpenAppUrl(path, source, guestDeviceId)) || appStoreUrl(source);
};

/** 도착한 주소의 해시에서 넘기기 표시를 읽는다(iOS 유니버설 링크가 안 열려 웹에 떨어진 경우). */
export const readHandoffHash = (hash: string): string | null => {
  const matched = hash.match(
    new RegExp(`^#${HANDOFF_PARAM}=([a-z_]+)(&${GUEST_DEVICE_PARAM}=[^&]*)?$`),
  );
  return matched ? matched[1] : null;
};
