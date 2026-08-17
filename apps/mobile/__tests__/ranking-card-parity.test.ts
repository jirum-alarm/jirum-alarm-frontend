const fs = require('fs');
const path = require('path');
declare const __dirname: string;
const web = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');
const native = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const w = web('entities/product-list/ui/ranking/ProductRankingImageCard.tsx');
const n = native('src/entities/home/ui/JirumRankingSlider.tsx');

describe('랭킹 카드 — web 대조', () => {
  it('카드 352 / 썸네일 240 — web·앱 동일', () => {
    // 240(썸네일)+12(p-3)+40(제목2줄)+20(메타)+36(가격) = 348.
    // p-3 하단 대칭분 4px 만 남기고 352 로 줄였다(원래 364 는 16px 이 떴다).
    expect(w).toContain('h-[352px]');
    expect(w).toContain('h-[240px]');
    expect(n).toContain('CARD_HEIGHT = 352');
    expect(n).toContain('THUMB_HEIGHT = 240');
  });

  it('★카드 높이를 쓰는 web 3곳이 전부 같다', () => {
    // 카드·AD변형·스켈레톤이 갈리면 캐러셀에서 높이가 어긋나고
    // 스켈레톤→로드 전환에 슬라이더가 튄다.
    for (const f of [
      'entities/product-list/ui/ranking/ProductRankingImageCard.tsx',
      'entities/product-list/ui/ranking/ADProductRankingImageCard.tsx',
      'widgets/home/ui/mobile/RankingSkeleton.tsx',
    ]) {
      expect(web(f)).toContain('h-[352px]');
      expect(web(f)).not.toContain('h-[364px]');
    }
  });

  it('앱 스켈레톤도 카드와 같은 높이', () => {
    expect(native('src/screens/home/ui/HomeSkeletons.tsx')).toContain(
      'height: 352',
    );
  });

  it('순위칩 26px + text-sm font-medium', () => {
    expect(w).toContain('h-6.5 w-6.5');
    expect(w).toContain('text-sm font-medium');
    expect(n).toContain('h-[26px] w-[26px]');
    expect(n).toContain('text-sm font-medium');
  });

  it('제목 text-sm gray-700 2줄', () => {
    expect(w).toContain('line-clamp-2 text-sm text-gray-700');
    expect(n).toContain('text-sm text-gray-700');
    expect(n).toContain('numberOfLines={2}');
  });

  it('가격 pt-2', () => {
    expect(w).toMatch(/pt-2 text-lg font-bold/);
    expect(n).toContain('className="pt-2"');
  });

  it('★가격 실렌더는 semibold — 래퍼 font-bold 는 span 이 이긴다', () => {
    // web 래퍼가 font-bold 지만 DisplayListPrice 의 span 이 font-semibold 라
    // 더 안쪽 규칙이 적용된다. 네이티브도 semibold(DisplayListPrice 기본).
    expect(web('entities/product-list/ui/card/DisplayListPrice.tsx')).toContain(
      'text-lg font-semibold text-gray-900',
    );
    expect(n).not.toContain('className="font-bold"');
  });

  it('★텍스트 블록은 web `p-3 pb-0` — 하단 패딩·justify-between 없음', () => {
    // 364-240=124 중 콘텐츠가 ~88px 이라 아래가 36px 남는데, web 도 같다.
    // justify-between 으로 벌리면 제목·메타·가격 사이가 떠서 어색하다.
    expect(w).toContain('p-3 pb-0');
    expect(n).toContain('className="px-3 pt-3"');
    expect(n).not.toContain('justify-between px-3');
  });

  it('그림자 — 모바일 카드엔 border 가 없다', () => {
    expect(w).toContain('shadow-[0_2px_12px_rgba(0,0,0,0.08)]');
    expect(w).toContain('pc:border'); // border 는 데스크톱 전용
    expect(n).toContain('shadowRadius: 12');
  });

  it('비활성 카드 scale-90', () => {
    expect(w).toContain('scale-90');
    expect(n).toContain('[1, 0.9]');
  });
});
export {};
