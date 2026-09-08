import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';

export type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

/**
 * URL 경로를 기반으로 해당하는 탭 이름을 반환합니다.
 * 탭의 기본 경로에 해당하지 않는 하위 페이지는 해당 탭 내에서 push됩니다.
 */
export function getTabNameFromUrl(url: string): TabName {
  const path = extractPath(url);

  if (path === '/' || path === '') {
    return tabNavigations.HOME;
  }
  if (path.startsWith('/trending')) {
    return tabNavigations.DISCOVER;
  }
  if (path.startsWith('/community')) {
    return tabNavigations.COMMUNITY;
  }
  if (path.startsWith('/alarm')) {
    return tabNavigations.ALARM;
  }
  // `/themes` 는 내정보 소속이다 — 구독 테마 목록(`MySubscribedThemes`)·
  // `/mypage/keyword` 에서 들어온다. 분기가 없으면 아래 기본값(HOME)으로
  // 떨어져서 테마를 누르는 순간 내정보 탭 밖으로 튕긴다.
  if (
    path.startsWith('/mypage') ||
    path.startsWith('/like') ||
    path.startsWith('/themes')
  ) {
    return tabNavigations.MYPAGE;
  }
  // 상품 상세, 검색, 추천 등은 홈 탭에서 처리
  if (
    path.startsWith('/products') ||
    path.startsWith('/search') ||
    path.startsWith('/recommend') ||
    path.startsWith('/curation')
  ) {
    return tabNavigations.HOME;
  }

  // 기본적으로 홈 탭
  return tabNavigations.HOME;
}

/**
 * 해당 경로가 탭의 기본(루트) URL인지 확인합니다.
 * 기본 URL이면 탭 전환만 하고, 아니면 탭 내에서 push합니다.
 */
export function isTabRootUrl(url: string): boolean {
  const raw = extractPath(url);
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;

  const tabRootPaths = [
    '/',
    '/trending/ranking',
    '/trending/live',
    '/community',
    '/alarm',
    '/mypage',
  ];

  return tabRootPaths.includes(path);
}

/**
 * 탭 안에서 네이티브 스택으로 push 할 경로인지 판정한다.
 *
 * 같은 WebView 에서 URL 만 바꾸면 이전 화면이 즉시 지워져 흰 화면이 뜬다.
 * 상세처럼 "들어갔다 나오는" 화면은 스택에 올려 네이티브 전환을 태운다.
 * 반환값은 push 에 넘길 경로(쿼리·해시 포함), 아니면 null.
 */
export function getPushablePath(url: string): string | null {
  const path = extractPath(url);

  // 상품 상세만. /products/123/comment 같은 하위도 같은 스택에 쌓는다.
  if (/^\/products\/\d+(\/|$)/.test(path)) {
    return extractPathWithQuery(url);
  }

  return null;
}

/**
 * 루트가 네이티브 화면인 탭.
 *
 * ★이 탭들은 웹뷰 ref 가 없다. 그래서 예전 방식
 * (`getWebViewRef(tab)?.current?.injectJavaScript(...)`)은 **예외도 로그도 없이
 * 아무 일도 하지 않는다** — 옵셔널 체이닝이 전부 삼킨다. 푸시·딥링크가 이 탭의
 * 페이지를 가리키면 유저 입장에선 "알림을 눌렀는데 아무 일도 안 일어난다".
 */
const NATIVE_TAB_ROOTS: ReadonlySet<TabName> = new Set([
  tabNavigations.HOME,
  tabNavigations.DISCOVER,
  tabNavigations.ALARM,
  // 2026-09-08 — 마지막 두 탭도 네이티브가 됐다. 이제 **모든 탭**이 웹뷰 ref 가
  // 없으므로, 네이티브 화면이 없는 경로는 반드시 아래 웹뷰 라우트로 쌓아야 한다.
  tabNavigations.COMMUNITY,
  tabNavigations.MYPAGE,
]);

/**
 * 파라미터 없이 1:1 로 대응되는 경로 → 네이티브 목적지.
 *
 * ★if 사슬 대신 표로 둔다 — 라우트가 20개를 넘어가면서 "어느 경로가 어디로
 * 가는지"를 한눈에 봐야 누락을 잡을 수 있다(이 레포에서 같은 정책을 한 곳에만
 * 적용하는 실수가 반복됐다). `screen` 이 없으면 그 탭의 루트다.
 */
const EXACT_ROUTES: ReadonlyMap<
  string,
  {tab: TabName; screen?: string; params?: Record<string, unknown>}
> = new Map([
  ['/', {tab: tabNavigations.HOME}],
  ['/alarm', {tab: tabNavigations.ALARM}],

  ['/community', {tab: tabNavigations.COMMUNITY}],
  [
    '/community/write',
    {
      tab: tabNavigations.COMMUNITY,
      screen: tabStackNavigations.COMMUNITY_WRITE,
      params: {},
    },
  ],

  ['/mypage', {tab: tabNavigations.MYPAGE}],
  [
    '/mypage/account',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_ACCOUNT},
  ],
  [
    '/mypage/account/nickname',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_NICKNAME},
  ],
  [
    '/mypage/account/password',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_PASSWORD},
  ],
  [
    '/mypage/account/personal',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_PERSONAL},
  ],
  [
    '/mypage/categories',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_CATEGORIES},
  ],
  [
    '/mypage/keyword',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_KEYWORD},
  ],
  [
    '/mypage/terms-policies',
    {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.MYPAGE_TERMS},
  ],
  ['/like', {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.LIKE}],
  ['/themes', {tab: tabNavigations.MYPAGE, screen: tabStackNavigations.THEMES}],
  [
    '/policies/privacy',
    {
      tab: tabNavigations.MYPAGE,
      screen: tabStackNavigations.POLICY,
      params: {kind: 'privacy'},
    },
  ],
  [
    '/policies/terms',
    {
      tab: tabNavigations.MYPAGE,
      screen: tabStackNavigations.POLICY,
      params: {kind: 'terms'},
    },
  ],
]);

/** 네이티브 목적지. `screen` 이 없으면 그 탭의 루트다. */
export type NativeRoute = {
  tab: TabName;
  screen?: string;
  params?: Record<string, unknown>;
  /** 발견 탭 전용 — 실시간·랭킹 중 어느 화면으로 열지. */
  trendingView?: 'live' | 'ranking';
};

/**
 * 서비스 URL 하나를 네이티브 목적지로 바꾼다 — **푸시·딥링크·웹뷰 링크의 단일 판정처.**
 *
 * ★왜 한 곳인가: 같은 판정이 FCMHandler·useDeepLink·TabWebView 에 흩어져 있었고,
 * 그때마다 상세와 발견 탭만 다뤄서 나머지 경로(`/`·`/alarm`·`/curation/*`·`/toss`)는
 * 웹뷰 주입으로 떨어졌다. 그 폴백이 네이티브 탭에서 no-op 이라 조용히 죽었다.
 *
 * @param allowWebViewRoute 네이티브 화면이 없는 경로를 그 탭 스택의 웹뷰 화면으로
 *   쌓을지. 푸시·딥링크는 켠다(현재 보고 있는 화면이 없으므로 어디로든 보내야 한다).
 *   웹뷰 안 링크 클릭은 끈다 — 켜면 링크를 눌렀을 뿐인데 탭이 바뀐다.
 * @returns 네이티브가 그릴 수 없으면 null (호출부가 기존 웹뷰 주입으로 넘긴다).
 */
export function resolveNativeRoute(
  url: string,
  {allowWebViewRoute = false}: {allowWebViewRoute?: boolean} = {},
): NativeRoute | null {
  const path = extractPath(url);

  // 상품 상세. 어느 탭에 쌓을지는 URL 이 정한다(웹뷰 시절 규칙 그대로 —
  // 뒤로가기 동선이 유지된다). 하위 경로(`/comment`)는 상세 화면이 웹뷰로 넘긴다.
  const detailPath = getPushablePath(url);
  if (detailPath) {
    return {
      tab: getTabNameFromUrl(url),
      screen: tabStackNavigations.DETAIL,
      params: {path: detailPath},
    };
  }

  // 표에 있는 경로는 그대로. 끝의 슬래시만 정리한다(`/mypage/` 도 같은 화면).
  const exact = EXACT_ROUTES.get(
    path.length > 1 ? path.replace(/\/+$/, '') : path || '/',
  );
  if (exact) {
    return exact;
  }

  if (path.startsWith('/trending')) {
    // web 은 `/trending` → `/trending/live` 로 리다이렉트한다. 같은 기본값을 쓴다.
    return {
      tab: tabNavigations.DISCOVER,
      trendingView: path.startsWith('/trending/ranking') ? 'ranking' : 'live',
    };
  }

  // 커뮤니티 글 상세. id 는 숫자다(`/community/write` 는 위 표가 먼저 잡는다).
  const postId = path.match(/^\/community\/(\d+)$/)?.[1];
  if (postId) {
    return {
      tab: tabNavigations.COMMUNITY,
      screen: tabStackNavigations.COMMUNITY_POST,
      params: {postId: Number(postId)},
    };
  }

  // 구독 테마 상세. id 가 문자열이라 숫자로 좁히지 않는다.
  const themeId = path.match(/^\/themes\/([^/]+)$/)?.[1];
  if (themeId) {
    return {
      tab: tabNavigations.MYPAGE,
      screen: tabStackNavigations.THEME_DETAIL,
      params: {themeId},
    };
  }

  const curationId = path.match(/^\/curation\/(.+)$/)?.[1];
  if (curationId) {
    // 제목은 넘기지 않는다 — CurationScreen 이 섹션을 조회해 자기 헤더를 그린다.
    // ⚠️없는 sectionId 로 들어오면 그 화면은 스피너에서 멈춘다("아직 안 옴"과
    // "없는 id"를 구분하지 않는다). 홈 더보기 경로는 서버가 준 id 만 쓰므로
    // 안 걸리지만, 딥링크는 낡은 id 를 들고 올 수 있다. 뒤로가기는 살아 있다.
    return {
      tab: tabNavigations.HOME,
      screen: tabStackNavigations.CURATION,
      params: {sectionId: curationId},
    };
  }

  if (path === '/toss') {
    const tossTab = url.match(/[?&]tab=([^&#]+)/)?.[1];
    return {
      tab: tabNavigations.HOME,
      screen: tabStackNavigations.TOSS_CURATION,
      params: tossTab ? {sectionId: decodeURIComponent(tossTab)} : {},
    };
  }

  // 네이티브 화면이 아직 없는 경로(`/deals/*`·`/recommend`·`/policies/*` 등).
  const tab = getTabNameFromUrl(url);
  if (allowWebViewRoute && NATIVE_TAB_ROOTS.has(tab)) {
    // ★경로만 넘긴다 — JirumAlarmWebViewScreen 이 `${SERVICE_URL}${uri}` 로
    // 조립하므로 여기서 또 붙이면 URL 이 두 번 겹친다.
    return {
      tab,
      screen: tabStackNavigations.WEBVIEW,
      params: {uri: extractPathWithQuery(url)},
    };
  }

  // 커뮤니티·내정보 탭은 루트가 아직 웹뷰다. 그 탭 웹뷰에 주입하는 기존 경로가
  // 제대로 동작하므로 건드리지 않는다(멀쩡한 길을 바꾸면 회귀만 생긴다).
  return null;
}

/**
 * 각 탭의 기본 URL 경로를 반환합니다.
 */
export function getTabBaseUrl(tabName: TabName): string {
  switch (tabName) {
    case tabNavigations.HOME:
      return '/';
    case tabNavigations.DISCOVER:
      return '/trending/ranking';
    case tabNavigations.COMMUNITY:
      return '/community';
    case tabNavigations.ALARM:
      return '/alarm';
    case tabNavigations.MYPAGE:
      return '/mypage';
    default:
      return '/';
  }
}

/** extractPath 는 쿼리·해시를 버린다. push 경로는 그대로 살려야 한다. */
function extractPathWithQuery(url: string): string {
  if (url.startsWith('http')) {
    const match = url.match(/^https?:\/\/[^/]+(\/.*)?$/);
    return match?.[1] || '/';
  }
  return url.startsWith('/') ? url : `/${url}`;
}

function extractPath(url: string): string {
  try {
    if (url.startsWith('http')) {
      // React Native 환경에서는 URL 생성자가 제한적일 수 있으므로 직접 파싱
      const match = url.match(/^https?:\/\/[^/]+(\/[^?#]*)?/);
      return match?.[1] || '/';
    }
    return url.startsWith('/') ? url : `/${url}`;
  } catch {
    return url;
  }
}
