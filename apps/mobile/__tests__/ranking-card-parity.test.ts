/**
 * 홈 랭킹 카드(앱). web 과 같아야 하는 크기·글자 모양은 디자인 시스템 정본에서 둘 다 읽는다
 * (layout.rankingCard · recipes.productCard.ranking — 둘이 같은지는 design-system consumers.test 가 본다).
 * 여기는 앱 쪽에서만 지킬 것.
 */
const fs = require('fs');
const path = require('path');
declare const __dirname: string;
const native = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const n = native('src/entities/home/ui/JirumRankingSlider.tsx');

describe('랭킹 카드 — 앱', () => {
  it('정본 크기·글자 모양을 읽는다', () => {
    const {layout} = require('@jirum/design-system/layout');
    expect(layout.rankingCard).toEqual({
      height: 352,
      thumbHeight: 240,
      inactiveScale: 0.9,
    });
    expect(n).toContain('layout.rankingCard.height');
    expect(n).toContain('productCard.ranking.title');
    expect(n).toContain('numberOfLines={2}');
  });

  it('★가격 실렌더는 semibold — 래퍼에 font-bold 를 덧대지 않는다', () => {
    const {productCard} = require('@jirum/design-system/recipes');
    expect(productCard.price.list).toBe('text-lg font-semibold text-gray-900');
    expect(n).not.toContain('className="font-bold"');
  });

  it('★텍스트 블록은 붙여 쌓는다 — 하단 패딩·justify-between 없음', () => {
    expect(n).not.toContain('justify-between px-3');
  });

  it('그림자 — 모바일 카드엔 border 가 없다', () => {
    expect(n).toContain('shadowRadius: 12');
  });
});
export {};
