const authNavigations = {
  AUTH_HOME: 'AuthHome',
  AUTH_EMAIL_LOGIN: 'AuthEmailLogin',
} as const;

const mainNavigations = {
  JIRUM_ALARM_WEBVIEW: 'JirumAlarmWebView',
} as const;

const tabNavigations = {
  HOME: 'HomeTab',
  DISCOVER: 'DiscoverTab',
  COMMUNITY: 'CommunityTab',
  ALARM: 'AlarmTab',
  MYPAGE: 'MyPageTab',
} as const;

/** 네이티브 탭 네비게이터 id. 중첩 화면에서 getParent 로 탭 옵션을 바꿀 때 쓴다. */
const MAIN_TABS_ID = 'MainTabs';

const tabWebViewNavigations = {
  TAB_WEBVIEW: 'TabWebView',
} as const;

/** 탭 안쪽 스택 화면. 탭 루트 위에 상세를 push 한다. */
const tabStackNavigations = {
  ROOT: 'TabRoot',
  DETAIL: 'ProductDetail',
  SEARCH: 'Search',
  /** 더보기(큐레이션) — 네이티브 목록. */
  CURATION: 'Curation',
  /** 토스 특가 더보기 — 네이티브 목록(카드가 달라 별 화면). */
  TOSS_CURATION: 'TossCuration',
  /** 네이티브 화면이 아직 없는 web 페이지(토스 등)를 탭 스택에 쌓는다. */
  WEBVIEW: 'TabWebViewPage',
  COMMENTS: 'ProductComments',

  // ── 내정보 탭 (web /mypage/** · /like · /themes · /policies) ──
  // ★8개 라우트를 한 번에 내야 한다 — 절반만 네이티브면 같은 설정 화면이
  // 두 벌로 보인다.
  MYPAGE_ACCOUNT: 'MyPageAccount',
  MYPAGE_NICKNAME: 'MyPageNickname',
  MYPAGE_PASSWORD: 'MyPagePassword',
  MYPAGE_PERSONAL: 'MyPagePersonal',
  MYPAGE_CATEGORIES: 'MyPageCategories',
  MYPAGE_KEYWORD: 'MyPageKeyword',
  MYPAGE_TERMS: 'MyPageTerms',
  /** 약관·개인정보 본문. web /policies/privacy · /policies/terms */
  POLICY: 'Policy',
  LIKE: 'Like',
  THEMES: 'Themes',
  THEME_DETAIL: 'ThemeDetail',

  // ── 커뮤니티 탭 (web /community/**) ──
  COMMUNITY_POST: 'CommunityPost',
  COMMUNITY_WRITE: 'CommunityWrite',
} as const;

/**
 * 검색 플로우 안쪽 스택. 탭 스택의 Search 화면이 이 네비게이터다.
 * 검색에서 연 상세는 여기 쌓이므로, 검색을 닫으면 그 상세도 같이 걷힌다.
 */
const searchStackNavigations = {
  HOME: 'SearchHome',
} as const;

export {
  authNavigations,
  mainNavigations,
  tabNavigations,
  MAIN_TABS_ID,
  tabWebViewNavigations,
  tabStackNavigations,
  searchStackNavigations,
};
