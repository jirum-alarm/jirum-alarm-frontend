import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  {
    ignores: ['node_modules/', 'dist/', '.next/', 'public/'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
            'unknown',
          ],
          pathGroups: [
            { pattern: '@/shared/**', group: 'internal', position: 'after' },
            { pattern: '@/entities/**', group: 'internal', position: 'after' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
            { pattern: '@/widgets/**', group: 'internal', position: 'after' },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          named: true,
        },
      ],
      'import-x/no-unresolved': 'off',
    },
  },
  // 피처 내부에서 다른 피처 배럴 참조 금지 (교차 의존 방지)
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@features/*'],
              message: '피처 내부에서는 다른 피처를 직접 import 하지 마세요.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
