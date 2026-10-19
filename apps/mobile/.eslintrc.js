const path = require('node:path');
const designSystem = require('@jirum/design-system/eslint');
const {fsdBoundaries} = require('../../packages/eslint/fsd-boundaries.cjs');

/**
 * FSD 경계 예외(옮기기엔 얽힌 것) — 파일(src 기준) → 허용할 import 접두. 늘리지 말고 줄여 갈 목록이다.
 */
const FSD_ALLOWLIST = {
  // 전역 네비게이션 ref(navigation-ref 가 screens 를 import 해서 shared 로 못 내린다)를 아래 레이어가 직접 쓴다
  'shared/hooks/PendingLoginRestore.tsx': ['@/navigations/navigation-ref'],
  'shared/hooks/useDeepLink.ts': ['@/navigations/open-when-ready'],
  'shared/hooks/useOtaUpdateOnResume.ts': ['@/navigations/navigation-ref'],
  'features/keyword-prompt/model/myKeywords.ts': [
    '@/navigations/navigation-ref',
  ],
  'features/community/ui/CommunityHotDeals.tsx': [
    '@/navigations/navigation-ref',
    '@/navigations/tab',
  ],
  // 로그인 상태 훅·상품 카드가 엔티티 쿼리를 읽는다 — 소비처 21곳이 여러 레이어라 옮기면 import 가 위로 샌다
  'shared/hooks/useAuth.ts': ['@/entities/auth'],
  'shared/hooks/useRequireLogin.ts': [
    '@/entities/auth',
    '@/entities/user',
    '@/navigations/navigation-ref',
  ],
  'shared/components/product/ProductCard.tsx': ['@/entities/product'],
  // 홈 서버 응답 타입이 map-home-page 에 있다(다른 작업이 그 파일을 옮기는 중)
  'shared/api/home/home.service.ts': ['@/entities/home'],
  // 키워드 등록·검증을 마이페이지와 서로 공유
  'features/keyword-prompt/model/useKeywordAlert.ts': ['@/features/mypage'],
  'features/mypage/model/useKeywordViewModel.ts': ['@/features/keyword-prompt'],
  // 홈 카드·카드 타입(entities/home)을 트렌딩·검색·커뮤니티가 재사용, 홈이 상품 prefetch·테마 쿼리를 쓴다
  'entities/community/community.queries.ts': ['@/entities/home'],
  'entities/search/api/search.queries.ts': ['@/entities/home'],
  'entities/trending/api/trending.queries.ts': ['@/entities/home'],
  'entities/trending/ui/LiveList.tsx': ['@/entities/home'],
  'entities/trending/ui/RankingList.tsx': ['@/entities/home'],
  'entities/trending/ui/CategoryPager.tsx': ['@/entities/category'],
  'entities/trending/ui/CategoryTabBar.tsx': ['@/entities/category'],
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
