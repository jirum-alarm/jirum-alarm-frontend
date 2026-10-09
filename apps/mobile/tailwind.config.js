// 색·글자·모서리·그림자 토큰은 디자인 시스템 한 곳(packages/design-system/tokens.js) — web 과 같은 값이다.
const {
  light,
  dark,
  fixed,
  brand,
  fontSize,
  radius,
  shadow,
} = require('@jirum/design-system');

/** '#RRGGBB' → 'R G B' (rgb(var(--x) / <alpha-value>) 형태라 bg-white/20 같은 투명도가 계속 먹는다) */
const rgb = hex =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');

/** {white, gray: {50: '#..'}} → {'--color-white': 'R G B', '--color-gray-50': ...} */
const cssVars = theme =>
  Object.fromEntries(
    Object.entries(theme).flatMap(([name, value]) =>
      typeof value === 'string'
        ? [[`--color-${name}`, rgb(value)]]
        : Object.entries(value).map(([step, hex]) => [
            `--color-${name}-${step}`,
            rgb(hex),
          ]),
    ),
  );

/** 테마 따라 바뀌는 색 = 변수 참조. 키 구조는 palette.light 와 같다. */
const ref = name => `rgb(var(--color-${name}) / <alpha-value>)`;
const themed = Object.fromEntries(
  Object.entries(light).map(([name, value]) => [
    name,
    typeof value === 'string'
      ? ref(name)
      : Object.fromEntries(
          Object.keys(value).map(step => [step, ref(`${name}-${step}`)]),
        ),
  ]),
);

/** @type {import('tailwindcss').Config} */
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
      },
      colors: {
        ...themed,
        fixed,
        ...brand,
      },
      fontSize,
      borderRadius: radius,
      boxShadow: shadow,
    },
  },
  plugins: [
    // 라이트·다크 값을 :root 변수로 깐다. NativeWind 가 prefers-color-scheme 을 OS 다크모드에 묶는다.
    ({addBase}) =>
      addBase({
        ':root': cssVars(light),
        '@media (prefers-color-scheme: dark)': {':root': cssVars(dark)},
      }),
  ],
};
