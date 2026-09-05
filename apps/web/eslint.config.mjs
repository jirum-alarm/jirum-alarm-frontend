import jirum from '@jirum/eslint-config-jirum';

const config = [
  ...jirum,
  {
    // Next 16 에서 `next lint` 가 사라져 eslint CLI 를 직접 부른다. next lint 는
    // 앱 소스만 훑었기 때문에, 그때 검사 대상이 아니던 설정 파일·스토리북을
    // 여기서 명시적으로 뺀다. 안 빼면 require() 금지·경로 미해결로 에러가 난다.
    ignores: [
      'node_modules/',
      'dist/',
      '.next/',
      'public/',
      '.storybook/',
      '*.config.cjs',
      '*.config.js',
      '*.config.mjs',
    ],
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
              group: ['@features/*', '@/features/*'],
              message: '피처 내부에서는 다른 피처를 직접 import 하지 마세요.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
