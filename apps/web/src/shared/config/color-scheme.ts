/** 웹 다크모드 — 기본은 라이트, 사용자가 켰을 때만 이 쿠키가 'dark'. 서버가 읽어 <html class="dark"> 를 심는다. */
export const COLOR_SCHEME_COOKIE = 'COLOR_SCHEME';

export const THEME_COLOR = { light: '#FFFFFF', dark: '#0C111D' } as const;

export const isDarkCookie = (value: string | undefined) => value === 'dark';

/** 브라우저에서 즉시 적용 + 1년 쿠키. 새로고침 없이 토큰 값이 바뀐다. */
export const setColorScheme = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
  document.cookie = dark
    ? `${COLOR_SCHEME_COOKIE}=dark; path=/; max-age=31536000; samesite=lax`
    : `${COLOR_SCHEME_COOKIE}=; path=/; max-age=0`;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? THEME_COLOR.dark : THEME_COLOR.light);
};
