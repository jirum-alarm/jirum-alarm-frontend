import localFont from 'next/font/local';

/**
 * Pretendard Variable 서브셋(491KB) — apps/web src/shared/fonts/PretendardVariable.woff2 와 같은 파일·같은 설정
 * (web shared/lib/fonts.ts). 담은 범위·재생성 방법은 web src/shared/fonts/README.md.
 * display: optional — 느린 회선에선 첫 페이지를 폴백으로 두고 다음 페이지부터 쓴다(리레이아웃 없음).
 */
export const pretendard = localFont({
  variable: '--font-pretendard',
  display: 'optional',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'sans-serif',
  ],
  adjustFontFallback: 'Arial',
  src: './PretendardVariable.woff2',
});
