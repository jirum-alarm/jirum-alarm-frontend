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

export {
  authNavigations,
  mainNavigations,
  tabNavigations,
  tabWebViewNavigations,
};
