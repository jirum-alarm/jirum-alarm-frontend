import {Linking} from 'react-native';

/**
 * 구매 웹뷰가 페이지의 이동 요청을 어떻게 처리할지.
 *
 * 쇼핑몰 제휴 링크는 열리자마자 스스로 앱을 부른다(2026-10-13 실측, 헤드리스 크로미움):
 * - 쿠팡 파트너스 `link.coupang.com/a/…` → 0.1초에 `coupang://mlp?…`, 0.3초 뒤 웹 폴백
 * - 토스쇼핑 → `toss.onelink.me` → `supertoss://tosspay?…partner_ref_id=…` → 미설치면 1~2초 뒤 스토어
 * - 오늘의집(애드픽·airbridge) → iOS `ohouseapp://…` / 안드 `intent://…` → 웹 폴백
 * 시스템 인앱 브라우저(SFSafariViewController·커스텀 탭)는 이 스크립트 이동을 확인창으로 막거나 버려서
 * 앱이 깔려 있어도 웹 상품 페이지가 떴다. 우리 웹뷰가 받아 앱이 직접 열면 확인창 없이 넘어간다.
 * 제휴 귀속 값은 쇼핑몰이 만든 앱 링크에 이미 실려 있다 — 우리는 그 URL 을 그대로 넘길 뿐 손대지 않는다.
 */
export type PurchaseNavDecision =
  /** 웹뷰가 그대로 로드한다. */
  | {kind: 'load'}
  /** 아무 데도 안 간다. */
  | {kind: 'block'}
  /** 다른 앱으로 넘긴다(쇼핑몰 앱·결제 앱). */
  | {kind: 'app'; url: string}
  /** iOS — Universal Link 로만 앱을 열어 본다. 앱이 없으면 같은 주소를 웹으로 이어 띄운다. */
  | {kind: 'universal'; url: string}
  /** 앱 스토어로 보낸다(앱 미설치 폴백). */
  | {kind: 'store'; url: string};

const WEB_SCHEMES = [
  'http:',
  'https:',
  'about:',
  'data:',
  'blob:',
  'javascript:',
];
const STORE_SCHEMES = ['itms-apps:', 'itms-appss:', 'itms:', 'market:'];

const schemeOf = (url: string) => {
  const match = url.match(/^([a-z][a-z0-9+.-]*):/i);
  return match ? `${match[1].toLowerCase()}:` : '';
};

/**
 * 쇼핑몰 앱이 iOS 에서 앱 스킴 대신 Universal Link 로만 받는 주소.
 * 지마켓·옥션(링크프라이스 → `appgate.gmarket.com/universal?app=gmkt|iac`, AASA 에 두 앱이 등록 — 2026-10-14 실측).
 * 안드로이드는 같은 페이지가 `intent://openLink?url=…` 을 내보내 이미 앱으로 넘어간다.
 * WKWebView 안의 이동은 Universal Link 를 열지 않아 iOS 만 웹으로 끝났다.
 */
export function isShoppingAppUniversalLink(url: string): boolean {
  const match = url.match(
    /^https:\/\/appgate\.gmarket\.com\/universal\b[^#]*[?&]app=([a-z]+)/i,
  );
  return match != null && ['gmkt', 'iac'].includes(match[1].toLowerCase());
}

export function decidePurchaseNavigation(
  request: {url: string; isTopFrame?: boolean},
  state: {
    handedOff: boolean;
    /**
     * Universal Link 로 앱을 열어 볼지 — 그게 되는 바이너리(iOS 1.5.2~)이고, 이 화면에서 아직 실패한 적 없을 때.
     * 한 번 실패(앱 미설치)하면 같은 주소를 웹으로 이어 띄우므로 다시 가로채면 안 된다(주소 비교 대신 끄기 —
     * 웹뷰가 주소를 정규화해 넘기면 비교가 빗나가 무한 반복이 된다).
     */
    universalLinks?: boolean;
  },
): PurchaseNavDecision {
  const scheme = schemeOf(request.url);
  if (!scheme || WEB_SCHEMES.includes(scheme)) {
    if (
      state.universalLinks &&
      request.isTopFrame !== false &&
      !state.handedOff &&
      isShoppingAppUniversalLink(request.url)
    ) {
      return {kind: 'universal', url: request.url};
    }
    return {kind: 'load'};
  }

  // 광고·추적 iframe 이 앱을 띄우지 못하게 — 앱 이동은 페이지 본체만.
  if (request.isTopFrame === false) return {kind: 'block'};

  if (STORE_SCHEMES.includes(scheme)) {
    // 앱을 이미 열었는데 페이지 타이머가 뒤늦게 스토어 폴백을 쏘는 경우(토스: 앱 이동 1초 뒤 스토어).
    // 앱에서 돌아왔을 때 스토어가 떠 있으면 안 된다.
    return state.handedOff
      ? {kind: 'block'}
      : {kind: 'store', url: request.url};
  }
  return {kind: 'app', url: request.url};
}

/** 안드로이드 `intent://host/path#Intent;scheme=x;package=y;S.browser_fallback_url=z;end` 해석. */
export function parseIntentUrl(url: string): {
  appUrl: string | null;
  packageName: string | null;
  fallbackUrl: string | null;
} {
  const [head, fragment = ''] = url.split('#Intent;');
  const params = new Map<string, string>();
  for (const part of fragment.replace(/;?end;?$/, '').split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) params.set(part.slice(0, eq), part.slice(eq + 1));
  }
  const scheme = params.get('scheme');
  const rest = head.replace(/^intent:(\/\/)?/i, '');
  const fallback = params.get('S.browser_fallback_url');
  return {
    appUrl: scheme ? `${scheme}://${rest}` : null,
    packageName: params.get('package') ?? null,
    fallbackUrl: fallback ? safeDecode(fallback) : null,
  };
}

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * 다른 앱을 연다. 열렸으면 opened=true. 못 열었으면(앱 미설치) 웹뷰가 이어서 띄울 웹 주소를 돌려줄 수 있다.
 *
 * canOpenURL 은 쓰지 않는다 — iOS 는 Info.plist(LSApplicationQueriesSchemes)에 없는 스킴에 늘 false 를 준다.
 * openURL 은 등록 없이 동작하고, 설치 안 된 앱이면 reject 한다.
 */
export async function openExternalApp(
  url: string,
): Promise<{opened: boolean; fallbackUrl: string | null}> {
  if (/^intent:/i.test(url)) {
    const intent = parseIntentUrl(url);
    if (intent.appUrl && (await tryOpen(intent.appUrl))) {
      return {opened: true, fallbackUrl: null};
    }
    if (intent.fallbackUrl)
      return {opened: false, fallbackUrl: intent.fallbackUrl};
    // 폴백 주소가 없는 intent 는 크롬처럼 스토어로 — 이 앱 말고는 갈 데가 없다.
    if (intent.packageName) {
      await tryOpen(`market://details?id=${intent.packageName}`);
    }
    return {opened: false, fallbackUrl: null};
  }
  return {opened: await tryOpen(url), fallbackUrl: null};
}

async function tryOpen(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/** GA4 파라미터용 — 어느 앱으로 넘겼는지(스킴 이름만, 제휴 파라미터는 싣지 않는다). */
export function appSchemeName(url: string): string {
  if (isShoppingAppUniversalLink(url)) {
    return /[?&]app=iac\b/i.test(url) ? 'auction-ul' : 'gmarket-ul';
  }
  if (/^intent:/i.test(url)) {
    return parseIntentUrl(url).appUrl?.split(':')[0] ?? 'intent';
  }
  return schemeOf(url).replace(':', '');
}

/**
 * 앱으로 넘긴 뒤 돌아오면 구매 화면을 닫을지. 열자마자(제휴 링크의 자동 이동) 넘어간 경우만 닫는다 —
 * 웹에서 결제하다 카드·은행 앱으로 갔다 오는 경우는 결제 화면이 남아 있어야 한다.
 */
export const LANDING_HANDOFF_WINDOW_MS = 8000;

/**
 * 여는 동안 웹뷰를 가리는 시간. 제휴 링크는 중간 페이지(쿠팡 「Deeplink Redirect」의 바로가기 버튼 화면,
 * 토스 onelink 등)를 0.3~2초 거쳐 앱으로 넘어간다 — 그 중간 화면이 그대로 보이면 「웹이 떴다가 모달이
 * 뜨고 넘어간다」로 읽힌다(사용자, 2026-10-13). 그 사이엔 우리 로딩 화면을 보이고,
 * - 앱으로 넘어가면 가린 채로 둔다(돌아오면 화면이 닫힌다),
 * - 웹 페이지가 다 뜬 뒤 SETTLE 동안 다음 이동이 없으면(= 앱 없이 웹으로 끝남) 걷는다,
 * - 그래도 MAX 를 넘기면 걷는다(느린 중간 페이지에서 사람을 붙잡지 않게).
 */
export const LANDING_COVER_SETTLE_MS = 900;
export const LANDING_COVER_MAX_MS = 4000;
