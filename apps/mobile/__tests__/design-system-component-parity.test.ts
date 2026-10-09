/**
 * 배지·칩·카드 상태 라벨은 web·앱이 **같은 레시피**(packages/design-system/recipes.js)를 읽는다.
 * 예전엔 같은 배지를 두 번 따로 적어 굵기(400↔600)·색(secondary-500↔600)·글자 크기(16↔14)가 갈렸다.
 * 한쪽 컴포넌트가 레시피 대신 클래스를 직접 적기 시작하면 다시 갈리므로, 그 연결을 고정한다.
 */
const fs = require('fs');
const path = require('path');
declare const __dirname: string;

const web = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');
const native = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../src', p), 'utf8');

const PAIRS: [string, string, string, string][] = [
  // [이름, web 파일, 앱 파일, 레시피 이름]
  [
    'Badge',
    'shared/ui/common/Badge/Badge.tsx',
    'shared/components/ui/Badge/index.tsx',
    'badge',
  ],
  [
    'Chip',
    'shared/ui/common/Chip/Chip.tsx',
    'shared/components/ui/Chip/index.tsx',
    'chip',
  ],
  [
    'ProductCardStatus',
    'entities/product-list/ui/ProductCardStatus.tsx',
    'shared/components/product/ProductCardStatus.tsx',
    'cardLabel',
  ],
  [
    'Switch',
    'shared/ui/common/Switch/Switch.tsx',
    'shared/components/ui/Switch/index.tsx',
    'toggle',
  ],
];

describe.each(PAIRS)(
  '%s — web·앱이 같은 레시피를 읽는다',
  (_, webFile, nativeFile, recipe) => {
    const importRe = new RegExp(
      `import \\{\\s*${recipe}\\s*\\} from '@jirum/design-system/recipes'`,
    );

    it('둘 다 @jirum/design-system/recipes 에서 가져온다', () => {
      expect(web(webFile)).toMatch(importRe);
      expect(native(nativeFile)).toMatch(importRe);
    });

    it('색 클래스를 직접 적지 않는다(레시피 밖에서 색이 생기면 두 플랫폼이 갈린다)', () => {
      const colorClass =
        /\b(?:bg|text|border)-(?:gray|primary|secondary|error|success|warning)-\d{2,3}\b/;
      expect(web(webFile)).not.toMatch(colorClass);
      expect(native(nativeFile)).not.toMatch(colorClass);
    });
  },
);

describe('ProductCardStatus — 유통기한 띠가 있으면 핫딜 배지를 숨기는 규칙이 같다', () => {
  it('web·앱 모두 !earliestExpiryDate 일 때만 핫딜 배지', () => {
    expect(web(PAIRS[2][1])).toMatch(/hotDealType && !earliestExpiryDate/);
    expect(native(PAIRS[2][2])).toMatch(/hotDealType && !earliestExpiryDate/);
  });
});

/** import {a, b} from '@jirum/design-system/recipes' 에 name 이 있는지. */
const importsRecipe = (src: string, name: string) =>
  new RegExp(
    `import \\{[^}]*\\b${name}\\b[^}]*\\} from '@jirum/design-system/recipes'`,
  ).test(src);

describe('섹션 제목 — web SectionHeader·DetailSectionHeader 와 앱 SectionHeader·상세 섹션이 같은 레시피', () => {
  it.each([
    ['web', 'shared/ui/SectionHeader.tsx'],
    ['web', 'shared/ui/DetailSectionHeader.tsx'],
    ['앱', 'shared/components/ui/SectionHeader/index.tsx'],
    ['앱', 'features/price-history/ui/PriceHistorySection.tsx'],
    ['앱', 'features/comment/ui/CommentSection.tsx'],
    ['앱', 'features/community-reaction/ui/CommunityReaction.tsx'],
    ['앱', 'shared/components/product/ProductCarouselSection.tsx'],
  ])('%s %s', (side, file) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, 'sectionTitle')).toBe(true);
    expect(src).not.toMatch(/text-lg font-(?:bold|semibold) text-gray-900/);
  });
});

describe('채운 탭 — web 의 각 자리와 앱 TabPill 이 같은 레시피(tab)', () => {
  it.each([
    ['web', 'features/community/ui/TabBar.tsx'],
    ['web', 'app/(desktop-ready)/toss/TossCategoryTabs.tsx'],
    ['web', 'app/(desktop-ready)/curation/components/CurationContainer.tsx'],
    ['web', 'widgets/trending/ui/TabbarV2.tsx'],
    ['web', 'features/product-detail/ui/PriceHistorySection.tsx'],
    ['앱', 'shared/components/ui/TabPill/index.tsx'],
    ['앱', 'features/price-history/ui/PriceHistorySection.tsx'],
  ])('%s %s', (side, file) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, 'tab')).toBe(true);
    // 고른 탭의 어두운 면을 손으로 적으면 다시 갈린다.
    expect(src).not.toMatch(/\bbg-(?:gray-900|fixed-800)\b/);
  });

  it('앱 탭 줄은 손으로 그리지 않고 TabPill 을 쓴다', () => {
    for (const file of [
      'features/community/ui/CommunityTabBar.tsx',
      'entities/trending/ui/CategoryTabBar.tsx',
      'entities/home/ui/TossHomeSection.tsx',
    ]) {
      expect(native(file)).toContain('<TabPill');
    }
  });
});

describe('상품 카드 사진 틀 — web 5종·앱 3종이 같은 cardThumb', () => {
  it.each([
    ['web', 'entities/product-list/ui/grid/ProductGridCard.tsx'],
    ['web', 'entities/product-list/ui/list/ListProductCard.tsx'],
    ['web', 'entities/product-list/ui/card/DoubleRowProductCard.tsx'],
    ['web', 'entities/product-list/ui/carousel/CarouselProductCard.tsx'],
    ['web', 'app/(desktop-ready)/toss/TossDealCard.tsx'],
    ['앱', 'shared/components/product/ProductCard.tsx'],
    ['앱', 'entities/home/ui/cards/HomeCardPrimitives.tsx'],
    ['앱', 'entities/home/ui/cards/TossDealCard.tsx'],
  ])('%s %s', (side, file) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, 'cardThumb')).toBe(true);
    expect(src).not.toContain('border-gray-200 bg-gray-50');
  });
});

export {};
