const RECENT_LOGIN_METHOD_KEY = 'jirum:recent-login-method';

export type LoginMethod = 'kakao' | 'naver' | 'email';

export const setRecentLoginMethod = (method: LoginMethod) => {
  localStorage.setItem(RECENT_LOGIN_METHOD_KEY, method);
};

export const getRecentLoginMethod = (): LoginMethod | null => {
  const value = localStorage.getItem(RECENT_LOGIN_METHOD_KEY);
  return value === 'kakao' || value === 'naver' || value === 'email' ? value : null;
};
