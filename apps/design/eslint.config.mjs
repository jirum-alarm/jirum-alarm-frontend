import designSystem from '@jirum/design-system/eslint';
import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  {
    ignores: ['node_modules/', 'storybook-static/', '*.config.mjs'],
  },
  // 놀이터 화면도 토큰만 쓴다 — 예외(토큰 표를 그리려고 hex 를 글자로 보여 주는 곳)는 style 값이라 걸리지 않는다.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: designSystem.rules,
  },
];

export default config;
