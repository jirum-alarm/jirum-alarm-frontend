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

/** web src 아래 .tsx 전부(공용 부품 파일은 뺀다). */
const webTsxFiles = (exclude: string[]): string[] =>
  (
    fs.readdirSync(path.join(__dirname, '../../web/src'), {
      recursive: true,
    }) as string[]
  ).filter(f => f.endsWith('.tsx') && !exclude.some(e => f.endsWith(e)));

describe('시트 겉 — web 은 공용 BottomSheetContent 하나, 앱 시트 둘도 같은 레시피(sheet)', () => {
  it('web BottomSheetContent·앱 BottomSheet·앱 공유 시트가 sheet 레시피를 읽는다', () => {
    expect(
      importsRecipe(
        web('shared/ui/common/BottomSheet/BottomSheet.tsx'),
        'sheet',
      ),
    ).toBe(true);
    expect(
      importsRecipe(native('shared/components/BottomSheet.tsx'), 'sheet'),
    ).toBe(true);
    expect(
      importsRecipe(native('screens/detail/ui/ShareSheet.tsx'), 'sheet'),
    ).toBe(true);
  });

  it('스캔이 실제로 web 파일을 읽는다(빈 목록으로 통과하지 않게)', () => {
    expect(webTsxFiles([]).length).toBeGreaterThan(300);
    expect(
      webTsxFiles([]).some(f => web(f).includes('<BottomSheetContent')),
    ).toBe(true);
  });

  it('web 에서 가림막·판을 손으로 다시 그리지 않는다(예전엔 11벌 복사)', () => {
    const offenders = webTsxFiles(['BottomSheet/BottomSheet.tsx']).filter(f =>
      web(f).includes('Drawer.Overlay'),
    );
    expect(offenders).toEqual([]);
  });

  it('앱 시트 위 모서리는 rounded-t-sheet 토큰(예전 16 은 web 20 보다 각졌다)', () => {
    expect(native('shared/components/BottomSheet.tsx')).toMatch(
      /radius\.sheet/,
    );
    expect(native('screens/detail/ui/ShareSheet.tsx')).toContain(
      'SHEET_RADIUS',
    );
    expect(native('screens/detail/ui/ShareSheet.tsx')).not.toMatch(
      /borderTopLeftRadius: 16/,
    );
  });

  it('다크 판 위 테두리 — web 레시피(dark:border-t)와 앱 시트 둘(useSheetPanelStyle)이 같이 간다', () => {
    const {sheet} = require('@jirum/design-system/recipes');
    expect(sheet.panel).toContain('dark:border-t dark:border-gray-100');
    expect(native('shared/components/BottomSheet.tsx')).toMatch(
      /borderTopWidth: 1, borderColor: c\.gray\[100\]/,
    );
    // 판 색을 손으로 다시 쓰면 다크 테두리가 빠진다 — 두 시트 모두 훅으로.
    for (const f of [
      'shared/components/BottomSheet.tsx',
      'screens/detail/ui/ShareSheet.tsx',
    ]) {
      expect(native(f)).toContain('useSheetPanelStyle()');
      expect(native(f)).not.toContain('{backgroundColor: c.white},');
    }
  });
});

describe('스켈레톤 — web Skeleton·앱 SkeletonBox 가 같은 gray-200', () => {
  const {skeleton} = require('@jirum/design-system/recipes');

  it('레시피 색은 gray-200 이고 앱 SkeletonBox 도 같은 색', () => {
    expect(skeleton).toBe('bg-gray-200');
    expect(native('shared/components/Skeletons.tsx')).toContain('c.gray[200]');
    expect(
      importsRecipe(web('shared/ui/common/Skeleton/Skeleton.tsx'), 'skeleton'),
    ).toBe(true);
  });

  it('web 에서 animate-pulse 판을 손으로 다시 만들지 않는다(예전엔 12개 파일 54곳, 색이 gray-100·50 으로 갈렸다)', () => {
    const offenders = webTsxFiles(['Skeleton/Skeleton.tsx']).filter(f =>
      /\banimate-pulse\b/.test(web(f)),
    );
    expect(offenders).toEqual([]);
  });
});

describe('정보 상자 — web 3곳·앱 1곳이 같은 infoBox', () => {
  it.each([
    ['web', 'features/product-detail/ui/DealEvidenceBlock.tsx'],
    ['web', 'app/(desktop-ready)/deals/[slug]/page.tsx'],
    ['web', 'shared/ui/ShareSheet.tsx'],
    ['앱', 'screens/detail/ui/DealEvidenceBlock.tsx'],
  ])('%s %s', (side, file) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, 'infoBox')).toBe(true);
    expect(src).not.toContain('rounded-xl border border-gray-200 bg-gray-50');
  });
});

describe('토스트 — web·앱이 같은 짙은 판(toast 레시피)', () => {
  it('web toastVariant·앱 AppToast 가 toast 레시피를 읽고 색을 직접 적지 않는다', () => {
    const webToast = web('shared/ui/common/Toast/variant/toast.ts');
    const appToast = native('shared/components/AppToast.tsx');
    expect(importsRecipe(webToast, 'toast')).toBe(true);
    expect(importsRecipe(appToast, 'toast')).toBe(true);
    // 예전 web 은 bg-fixed-600 가운데 정렬, 앱은 bg-fixed-800 — 한쪽이 다시 손으로 적으면 갈린다.
    expect(webToast).not.toMatch(/bg-fixed-\d00/);
    expect(appToast).not.toMatch(/bg-fixed-\d00/);
  });

  it('web 토스트는 스크린리더가 읽는다(앱 accessibilityLiveRegion 과 같게)', () => {
    expect(web('shared/ui/common/Toast/Toast.tsx')).toMatch(
      /aria-live="polite"/,
    );
  });
});

describe('빈 목록 한 줄 안내 — web·앱이 같은 emptyText(gray-400 은 AA 미달)', () => {
  it.each([
    ['web', 'widgets/product-detail/ui/CommunityReaction.tsx'],
    ['web', 'widgets/search/ui/RecentKeywords.tsx'],
    ['web', 'app/(desktop-ready)/keywords/[keyword]/page.tsx'],
    ['web', 'features/community/ui/CommunityList.tsx'],
    ['web', 'app/(desktop-ready)/deals/[slug]/DealsListSection.tsx'],
    ['web', 'app/(desktop-ready)/toss/TossDailyContainer.tsx'],
    [
      'web',
      'app/(desktop-ready)/products/[id]/related/RelatedProductsView.tsx',
    ],
    ['web', 'app/(desktop-ready)/curation/components/CurationProductList.tsx'],
    ['web', 'widgets/search/ui/SearchResult.tsx'],
    ['web', 'features/community/ui/ProductTagModal.tsx'],
    ['앱', 'screens/community/CommunityScreen.tsx'],
    ['앱', 'features/community-reaction/ui/CommunityReaction.tsx'],
    ['앱', 'screens/mypage/ThemesScreen.tsx'],
    ['앱', 'screens/mypage/ThemeDetailScreen.tsx'],
    ['앱', 'entities/home/ui/CurationGrid.tsx'],
    ['앱', 'screens/search/ui/SearchResults.tsx'],
  ])('%s %s', (side, file) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, 'emptyText')).toBe(true);
  });
});

describe('버튼 — web·앱이 같은 레시피(button)와 같은 모양 고르기(buttonTone)', () => {
  it('두 Button 이 button·buttonTone 을 읽고 색을 직접 적지 않는다(예전엔 cva 두 벌)', () => {
    const webButton = web('shared/ui/common/Button/Button.tsx');
    const appButton = native('shared/components/ui/Button/index.tsx');
    for (const src of [webButton, appButton]) {
      expect(importsRecipe(src, 'button')).toBe(true);
      expect(importsRecipe(src, 'buttonTone')).toBe(true);
      expect(src).not.toMatch(
        /\b(?:bg|text|border)-(?:gray|primary|secondary|error|fixed)-\d{2,3}\b/,
      );
    }
  });
});

describe('토스트 종류·표시 시간 — web 도 앱처럼 성공·실패를 아이콘으로 가른다', () => {
  it('web 에 success·error·info 와 동작 버튼이 있다', () => {
    const store = web('shared/ui/common/Toast/useToast.tsx');
    expect(store).toMatch(/success:/);
    expect(store).toMatch(/error:/);
    expect(store).toMatch(/action\?: ToastAction/);
    const toaster = web('shared/ui/common/Toast/Toaster.tsx');
    expect(toaster).toContain('SuccessIcon');
    expect(toaster).toContain('ErrorIcon');
  });

  it('표시 시간이 같다(앱 2.5초·동작 버튼 있으면 4초)', () => {
    const webMs = web('shared/ui/common/Toast/useToast.tsx');
    const appMs = native('shared/lib/feedback/toast.ts');
    expect(webMs).toMatch(/VISIBLE_MS = 2500/);
    expect(webMs).toMatch(/VISIBLE_WITH_ACTION_MS = 4000/);
    expect(appMs).toMatch(/VISIBILITY_MS = 2500/);
    expect(appMs).toMatch(/VISIBILITY_WITH_ACTION_MS = 4000/);
  });

  it('실패 문구에 성공 아이콘이 붙지 않는다(web 호출부)', () => {
    const offenders = webTsxFiles([])
      .concat(
        (
          fs.readdirSync(path.join(__dirname, '../../web/src'), {
            recursive: true,
          }) as string[]
        ).filter(f => f.endsWith('.ts')),
      )
      .flatMap(f =>
        web(f)
          .split('\n')
          .filter(
            (l: string) =>
              /toast\.success\(/.test(l) && /실패|에러|오류/.test(l),
          )
          .map((l: string) => `${f}: ${l.trim()}`),
      );
    expect(offenders).toEqual([]);
  });
});

describe('딜 줄 — web 두 목록이 같은 dealRow', () => {
  it.each([
    'features/product-list/ui/ClusteredPriceSection.tsx',
    'app/(desktop-ready)/deals/[slug]/DealsListSection.tsx',
  ])('%s', file => {
    const src = web(file);
    expect(importsRecipe(src, 'dealRow')).toBe(true);
    expect(src).not.toContain('rounded-lg border border-gray-100 p-3');
  });
});

describe('링크 칩 — web 네 곳이 같은 linkChip', () => {
  it('web 어디에도 칩·태그 모양을 손으로 다시 적지 않는다(3차 때 검색이 여러 줄 JSX 를 놓쳐 링크 칩이 남은 줄 몰랐다)', () => {
    const offenders = webTsxFiles([]).filter(f =>
      /rounded-full border border-gray-200 (?:bg-white )?px-|rounded-full bg-gray-100 px-2\.5/.test(
        web(f),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it.each([
    'app/(desktop-ready)/keywords/[keyword]/page.tsx',
    'app/(desktop-ready)/keywords/page.tsx',
    'app/(desktop-ready)/guide/hotdeal-alarm/page.tsx',
    'app/(desktop-ready)/deals/[slug]/page.tsx',
  ])('%s', file => {
    const src = web(file);
    expect(importsRecipe(src, 'linkChip')).toBe(true);
    expect(src).not.toMatch(/rounded-full border border-gray-200 px-\d/);
  });
});

describe('최근 검색어 칩·단어 태그 — web·앱이 같은 레시피(keywordChip·wordTag)', () => {
  it.each([
    ['web', 'widgets/search/ui/RecentKeywords.tsx', 'keywordChip'],
    ['앱', 'screens/search/ui/RecentKeywords.tsx', 'keywordChip'],
    ['web', 'features/mypage/ui/theme/ThemeDetail.tsx', 'wordTag'],
    ['앱', 'screens/mypage/ThemeDetailScreen.tsx', 'wordTag'],
    ['web', 'features/mypage/ui/keyword/KeywordList.tsx', 'addChip'],
    ['앱', 'screens/mypage/KeywordScreen.tsx', 'addChip'],
  ])('%s %s', (side, file, recipe) => {
    const src = side === 'web' ? web(file) : native(file);
    expect(importsRecipe(src, recipe)).toBe(true);
  });

  it('앱 관심사 태그가 다시 6px 사각(rounded-md)으로 갈리지 않는다', () => {
    expect(native('screens/mypage/ThemeDetailScreen.tsx')).not.toMatch(
      /rounded-md (?:bg-gray-50|border border-gray-200) px-2\.5/,
    );
  });
});

export {};
