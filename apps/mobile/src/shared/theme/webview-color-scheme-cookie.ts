import CookieManager from '@react-native-cookies/cookies';
import {useEffect} from 'react';
import {useColorScheme} from 'react-native';

import {SERVICE_URL} from '@/constants/env.ts';

/** web 과 같은 이름·값 — web 은 서버가 이 쿠키가 'dark' 일 때만 `<html class="dark">` 로 그린다(web shared/config/color-scheme.ts). */
export const COLOR_SCHEME_COOKIE = 'COLOR_SCHEME';

/** 웹뷰 쿠키 저장소에 지금 모드를 적는다. 로그인 쿠키(useAuth)와 같은 저장소라 웹뷰 요청에 같이 실린다. */
export function syncWebViewColorScheme(dark: boolean) {
  return CookieManager.set(SERVICE_URL, {
    name: COLOR_SCHEME_COOKIE,
    value: dark ? 'dark' : 'light',
    path: '/',
  }).catch(() => false);
}

/**
 * 앱 웹뷰(글쓰기·약관·고객센터·공용 웹뷰)를 앱과 같은 모드로 띄운다 — 쿠키가 없으면 web 은 늘 라이트라
 * 다크 사용자에게 그 화면들만 흰 페이지였다. web 다크는 서버가 첫 HTML 부터 정하므로 흰 화면이 번쩍이지 않는다.
 * '시스템 설정'에서 OS 가 바뀌어도 useColorScheme 이 따라와 다시 적는다.
 * ponytail: 이미 열린 웹뷰는 다시 열어야 바뀐다 — 모드는 웹뷰 밖(내정보·홈 헤더)에서 바꾸니 드물다.
 */
export function useWebViewColorSchemeCookie() {
  const dark = useColorScheme() === 'dark';
  useEffect(() => {
    syncWebViewColorScheme(dark);
  }, [dark]);
}
