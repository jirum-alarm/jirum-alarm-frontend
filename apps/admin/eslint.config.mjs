import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  // {
  //   languageOptions: {
  //     parserOptions: {
  //       project: ['./tsconfig.json'],
  //     },
  //   },
  // },
  {
    ignores: ['node_modules/', 'dist/', '.next/'],
  },
];

export default config;
