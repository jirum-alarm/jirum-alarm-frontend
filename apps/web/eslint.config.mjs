import designSystem from '@jirum/design-system/eslint';
import jirum from '@jirum/eslint-config-jirum';
import fsd from '@jirum/eslint-config-jirum/fsd-boundaries.cjs';
import path from 'node:path';

const { fsdBoundaries } = fsd;

/**
 * FSD 경계 예외(옮기기엔 얽힌 것) — 파일(src 기준) → 허용할 import 접두. 늘리지 말고 줄여 갈 목록이다.
 */
const FSD_ALLOWLIST = {
  // shared 공용 UI/훅이 로그인·알림 쿼리를 읽는다 — 소비처가 여러 레이어라 옮기면 import 가 위로 샌다
  'shared/ui/TabScrollTopButton.tsx': ['@/entities/auth'],
  'shared/hooks/useHasNewAlarm.ts': ['@/entities/notification'],
  // 알림함·상세가 앱 열기 링크·키워드 등록·푸시 설정을 그대로 재사용
  'features/alarm/ui/AlarmContainer.tsx': ['@/features/app-download'],
  'features/alarm/ui/AlarmList.tsx': ['@/features/mypage'],
  'features/product-detail/ui/PostPurchaseKeywordPrompt.tsx': [
    '@/features/app-download',
    '@/features/mypage',
  ],
  // 프로모션 쿼리가 상품 쿼리 키를 공유
  'entities/promotion/lib/getPromotionQueryOptions.ts': ['@/entities/product'],
};

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
  // 디자인 토큰 우회(hex·기본 팔레트·임의 글자 크기·모서리·그림자) 금지 — packages/design-system/README.md
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts'],
    rules: designSystem.rules,
  },
  // FSD 경계(app > widgets > features > entities > shared, features·entities 슬라이스끼리 금지) — 위반은 에러.
  ...fsdBoundaries({
    srcDir: path.join(import.meta.dirname, 'src'),
    layers: [['shared'], ['entities'], ['features'], ['widgets'], ['app']],
    isolatedLayers: ['features', 'entities'],
    allowlist: FSD_ALLOWLIST,
  }),
];

export default config;
