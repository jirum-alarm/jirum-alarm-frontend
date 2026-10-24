const path = require('node:path');
const designSystem = require('@jirum/design-system/eslint');
const {fsdBoundaries} = require('../../packages/eslint/fsd-boundaries.cjs');

/**
 * FSD 경계 예외(옮기기엔 얽힌 것) — 파일(src 기준) → 허용할 import 접두. 늘리지 말고 줄여 갈 목록이다.
 */
const FSD_ALLOWLIST = {
  // 로그인 요구 훅이 로그인 상태(entities/auth)·내 정보(entities/user) 둘 다 읽고 소비처가 features 여러 슬라이스 — 엔티티 한 곳으로 못 올린다
  'shared/hooks/useRequireLogin.ts': ['@/entities/auth', '@/entities/user'],
  // 발견 탭 목록이 홈 카드 UI(GridCard·CurationGrid·CarouselList)를 그대로 그린다 — 카드 UI 를 entities/product 로 옮기는 설계 변경 필요
  'entities/trending/ui/RankingList.tsx': ['@/entities/home'],
  // 홈 카드가 상품 상세 prefetch(상품 쿼리)·테마 쿼리를 쓴다 — 쿼리라 shared 로 못 내린다
  'entities/home/ui/JirumRankingSlider.tsx': ['@/entities/product'],
  'entities/home/ui/cards/HomeProductCards.tsx': ['@/entities/product'],
  'entities/home/ui/ThemeHomeSection.tsx': ['@/entities/theme'],
};

// FSD 경계(screens·navigations·provider·components > features > entities > shared, features·entities 슬라이스끼리 금지).
// 공용 생성기는 flat config 의 ignores 를 쓰므로 .eslintrc 의 excludedFiles 로 바꿔 끼운다.
const fsdOverrides = fsdBoundaries({
  srcDir: path.join(__dirname, 'src'),
  layers: [
    ['shared', 'constants'],
    ['entities'],
    ['features'],
    ['screens', 'navigations', 'provider', 'components'],
  ],
  isolatedLayers: ['features', 'entities'],
  allowlist: FSD_ALLOWLIST,
}).map(({ignores, ...rest}) =>
  ignores ? {...rest, excludedFiles: ignores} : rest,
);

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
    ...fsdOverrides,
  ],
};
