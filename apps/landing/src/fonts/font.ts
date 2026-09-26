import localFont from 'next/font/local';

// 원본(2 MB)이 아니라 web 과 같은 서브셋(KS X 1001 2,350자 + α, 491 KB) 복사본이다.
// 소개 페이지 한글은 전부 이 범위 안(2026-09-26 확인). 범위·재생성은 apps/web/src/shared/fonts/README.md.
export const PretendardVariable = localFont({
  variable: '--font-pretendard',
  src: './PretendardVariable.woff2',
});
