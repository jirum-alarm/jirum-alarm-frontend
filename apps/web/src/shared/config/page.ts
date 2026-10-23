export enum PAGE {
  HOME = '/',
  TRENDING = '/trending',
  TRENDING_LIVE = '/trending/live',
  TRENDING_RANKING = '/trending/ranking',
  RECOMMEND = '/recommend',

  DETAIL = '/products',
  PRODUCT_NEW = '/products/new',
  COMMENT = '/products/comment',

  LOGIN = '/login',
  LOGIN_BY_EMAIL = '/login/email',
  SIGNUP = '/signup',
  SIGNUP_COMPLETE = '/signup/complete',
  LOGOUT = '/logout',

  DEALS = '/deals',

  KEYWORDS = '/keywords',

  HELP = '/help',

  COMMUNITY = '/community',
  COMMUNITY_WRITE = '/community/write',

  ALARM = '/alarm',

  SEARCH = '/search',

  MYPAGE = '/mypage',
  MYPAGE_CATEGORIES = '/mypage/categories',
  MYPAGE_KEYWORD = '/mypage/keyword',
  MYPAGE_ACCOUNT = '/mypage/account',
  MYPAGE_ACCOUNT_NICKNAME = '/mypage/account/nickname',
  MYPAGE_ACCOUNT_PERSONAL = '/mypage/account/personal',
  MYPAGE_ACCOUNT_PASSWORD = '/mypage/account/password',
  MYPAGE_TERMS_POLICIES = '/mypage/terms-policies',
  /** PC 마이페이지 틀 안에서 여는 /help — 왼쪽 메뉴를 잃지 않게. 모바일·앱은 /help. */
  MYPAGE_HELP = '/mypage/help',

  POLICIES_PRIVACY = '/policies/privacy',
  POLICIES_TERMS = '/policies/terms',

  LIKE = '/like',
}
