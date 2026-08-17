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
  /** 큐레이션 등 네이티브 화면이 아직 없는 웹 페이지를 탭 스택에 쌓는다. */
  WEBVIEW: 'TabWebViewPage',
  COMMENTS: 'ProductComments',
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
