import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  {
    ignores: ['node_modules/', 'dist/', '.next/'],
  },
];

export default config;
