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

export {};
