const designSystem = require('@jirum/design-system/eslint');

module.exports = {
  root: true,
  ignorePatterns: [
    'android/app/build/**',
    'ios/build/**',
    '.expo/**',
    'src/shared/api/gql/**',
  ],
  extends: '@react-native',
  overrides: [
    // 디자인 토큰 우회(hex·기본 팔레트·임의 글자 크기·모서리·그림자) 금지 — packages/design-system/README.md
    {
      files: ['App.tsx', 'src/**/*.{ts,tsx}'],
      rules: designSystem.rules,
    },
    {
      files: ['src/shared/lib/webview/bridge.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
