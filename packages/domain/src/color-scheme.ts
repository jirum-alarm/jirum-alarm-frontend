/**
 * web 다크모드 쿠키 계약 — 앱이 웹뷰 쿠키에 지금 모드를 적고(webview-color-scheme-cookie), web 서버가 그 값으로
 * 첫 HTML 부터 `<html class="dark">` 를 그린다. 이름·값이 한쪽만 바뀌면 다크 사용자에게 웹뷰만 흰 화면이 된다
 * (2026-10-20 정본화 — 전엔 앱 테스트가 web 파일을 읽어 대조했다).
 */

export const COLOR_SCHEME_COOKIE = 'COLOR_SCHEME';

/** 쿠키에 적는 값. web 은 'dark' 만 다크로 읽는다. */
export const colorSchemeCookieValue = (dark: boolean) => (dark ? 'dark' : 'light');

export const isDarkCookie = (value: string | undefined) => value === 'dark';
