import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildHubModelChips, HUB_MODEL_VISIBLE } =
  require('./hub-model-pages.ts') as typeof import('./hub-model-pages');

type Page = import('./hub-model-pages').HubModelPageLink;
type Verdict = import('./hub-model-pages').HubModelVerdict;

const page = (slug: string, brand: string | null, modelName: string, dealCount = 1): Page => ({
  slug,
  brand,
  modelName,
  dealCount,
});
const verdict = (slug: string, priceTone: string, savePct = 0): Verdict => ({
  slug,
  priceTone,
  savePct,
  activeDealCount: 1,
  activePrice: 1000,
});

describe('buildHubModelChips', () => {
  it('허브 이름이 말한 브랜드는 칩에서 뺀다', () => {
    const { visible } = buildHubModelChips(
      '오뚜기',
      [page('a', '오뚜기', '진라면 매운맛'), page('b', '농심', '신라면')],
      [],
    );
    assert.deepEqual(
      visible.map((c) => c.label),
      ['진라면 매운맛', '농심 신라면'],
    );
  });

  it('모두 같은 브랜드면 허브 이름과 달라도 뺀다', () => {
    const { visible } = buildHubModelChips(
      '진라면',
      [page('a', '오뚜기', '진라면 매운맛'), page('b', '오뚜기', '진라면 순한맛')],
      [],
    );
    assert.deepEqual(
      visible.map((c) => c.label),
      ['진라면 매운맛', '진라면 순한맛'],
    );
  });

  it('지금 싼 상품을 앞으로 — 기록상 최저 먼저, 그다음 할인 큰 순, 나머지는 딜 많은 순', () => {
    const { visible, goodCount } = buildHubModelChips(
      '라면',
      [
        page('a', '농심', '신라면', 9),
        page('b', '오뚜기', '진라면', 3),
        page('c', '팔도', '비빔면', 5),
        page('d', '삼양', '불닭', 1),
      ],
      [verdict('b', 'cheap', 10), verdict('d', 'lowest', 5), verdict('a', 'fair')],
    );
    assert.equal(goodCount, 2);
    assert.deepEqual(
      visible.map((c) => [c.slug, c.good]),
      [
        ['d', '기록상 최저'],
        ['b', '평소보다 10%↓'],
        ['a', null],
        ['c', null],
      ],
    );
  });

  it('진행 중 딜이 없으면 판정이 좋아도 지금 싼 상품이 아니다', () => {
    const { goodCount } = buildHubModelChips(
      '라면',
      [page('a', '농심', '신라면')],
      [{ ...verdict('a', 'lowest'), activeDealCount: 0 }],
    );
    assert.equal(goodCount, 0);
  });

  it('펼치는 수를 넘으면 나머지는 접는다', () => {
    const pages = Array.from({ length: HUB_MODEL_VISIBLE + 5 }, (_, i) =>
      page(`p${i}`, 'x', `m${i}`),
    );
    const { visible, folded } = buildHubModelChips('x', pages, []);
    assert.equal(visible.length, HUB_MODEL_VISIBLE);
    assert.equal(folded.length, 5);
  });
});
