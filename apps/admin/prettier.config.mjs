import config from '@jirum/prettier';

/** @type {import('prettier').Config} */
const adminConfig = {
  ...config,
  // Tailwind v4 는 설정이 CSS 에 있다 — 클래스 정렬이 커스텀 토큰을 알게
  tailwindStylesheet: './src/css/style.css',
};

export default adminConfig;
