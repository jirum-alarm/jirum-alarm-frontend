/** @type {import('tailwindcss').Config} */
// 디자인 토큰 SSOT: @jirum/design-tokens. mobile 팔레트 전체를 토큰에서 받는다.
const tokens = require('@jirum/design-tokens/tailwind');

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard-Regular'],
        'pretendard-bold': ['Pretendard-Bold'],
        'pretendard-semibold': ['Pretendard-SemiBold'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-light': ['Pretendard-Light'],
        'pretendard-thin': ['Pretendard-Thin'],
      },
      colors: {
        // mobile 팔레트 전체를 토큰(Figma=web 값)에서 받는다 — SSOT 단일화.
        // primary 600~900·secondary 50/400/500은 토큰이 옛 하드코딩과 다르지만,
        // 그 shade를 쓰는 클래스 사용처가 0(실측)이라 렌더 변화 없음. 실제 사용 shade
        // (primary-300/500)는 토큰과 값 동일. 죽은 선언을 제거하며 신 값으로 통일.
        white: tokens.colors.white,
        black: tokens.colors.black,
        link: tokens.colors.link,
        error: tokens.colors.error,
        gray: tokens.colors.gray,
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
      },
    },
  },
  plugins: [],
};
