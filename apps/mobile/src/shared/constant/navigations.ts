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

const tabWebViewNavigations = {
  TAB_WEBVIEW: 'TabWebView',
} as const;

/** 탭 안쪽 스택 화면. 탭 루트 위에 상세를 push 한다. */
const tabStackNavigations = {
  ROOT: 'TabRoot',
  DETAIL: 'ProductDetail',
  COMMENTS: 'ProductComments',
} as const;

export {
  authNavigations,
  mainNavigations,
  tabNavigations,
  tabWebViewNavigations,
  tabStackNavigations,
};
