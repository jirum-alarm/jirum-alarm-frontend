/** @type {import('tailwindcss').Config} */
// 디자인 토큰 SSOT: @jirum/design-tokens. mobile과 hex가 이미 동일한 그룹만 연결한다(무손실).
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
        // 토큰과 hex가 이미 동일한 그룹 — SSOT 연결(무손실, 시각 변화 0). 소문자로 정규화됨.
        white: tokens.colors.white,
        black: tokens.colors.black,
        link: tokens.colors.link,
        error: tokens.colors.error,
        gray: tokens.colors.gray,
        // ⚠️ 미연결 — 토큰(Figma)과 값이 틀어져 있어 연결하면 시각 변화 발생. 디자이너 확인 후 별도 PR.
        //   primary 600~900: 토큰은 #4ad11b/#039100/#025900/#013200, 여기는 옛 값에 멈춤.
        //   secondary 50/400/500: 토큰과 미세 차이.
        primary: {
          50: '#F5FDEA',
          100: '#ECFCD5',
          200: '#D8FAAB',
          300: '#C5F782',
          400: '#B2F458',
          500: '#9EF22E',
          600: '#7FC125',
          700: '#5F911C',
          800: '#3F6112',
          900: '#203009',
        },
        secondary: {
          50: '#EFF4FF',
          100: '#DAE5FE',
          200: '#B5CBFD',
          300: '#91B1FB',
          400: '#6C97FA',
          500: '#477DF9',
          600: '#3964C7',
          700: '#2B4B95',
          800: '#1C3264',
          900: '#0E1932',
        },
      },
    },
  },
  plugins: [],
};
