import designSystem from '@jirum/design-system/eslint';
import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  {
    ignores: ['node_modules/', 'dist/', '.next/', 'out/'],
  },
  // 디자인 토큰 우회(hex·기본 팔레트·임의 글자 크기·모서리·그림자) 금지 — packages/design-system/README.md
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts'],
    rules: designSystem.rules,
  },
];

export default config;
