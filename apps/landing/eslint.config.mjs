import jirum from '@jirum/eslint-config-jirum';

export default [
  ...jirum,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.next/'],
  },
];
