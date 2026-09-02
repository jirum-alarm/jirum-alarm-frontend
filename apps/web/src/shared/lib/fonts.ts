import localFont from 'next/font/local';

/**
 * Pretendard Variable — **서브셋 파일**(원본 2,010KB → 491KB).
 * 원본은 preload 라 모든 페이지 첫 요청에 2MB 를 실어보냈다(모바일 전송량의 40%).
 * 담은 범위·검증 수치·재생성 방법은 `../fonts/README.md`.
 *
 * fallback 스택은 그대로 둔다 — 서브셋 밖 희귀 음절이 여기로 떨어진다(실측 이탈률 0.008%).
 */
export const pretendard = localFont({
  display: 'swap',
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
  src: '../fonts/PretendardVariable.woff2',
});
