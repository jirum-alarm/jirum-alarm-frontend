import localFont from 'next/font/local';

/**
 * Pretendard Variable — **서브셋 파일**(원본 2,010KB → 491KB).
 * 원본은 preload 라 모든 페이지 첫 요청에 2MB 를 실어보냈다(모바일 전송량의 40%).
 * 담은 범위·검증 수치·재생성 방법은 `../fonts/README.md`.
 *
 * fallback 스택은 그대로 둔다 — 서브셋 밖 희귀 음절이 여기로 떨어진다(실측 이탈률 0.008%).
 *
 * display: optional — 491KB 가 Slow 4G 에서 10.6s 에 도착해 9초간 폴백을 보여준 뒤 갈아끼웠다.
 * optional 은 그 페이지에선 폴백을 그대로 두고(리레이아웃 없음) 캐시에 넣어 다음 페이지부터 쓴다.
 * 빠른 회선·재방문은 첫 페인트부터 Pretendard.
 */
export const pretendard = localFont({
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
  src: '../fonts/PretendardVariable.woff2',
});
