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
    {
      files: ['src/shared/lib/webview/bridge.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
