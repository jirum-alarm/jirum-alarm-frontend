import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildHubModelGroups, BUNDLE_GROUP, HUB_MODEL_SINGLES_VISIBLE } =
  require('./hub-model-pages.ts') as typeof import('./hub-model-pages');

type Page = import('./hub-model-pages').HubModelPageLink;
type Verdict = import('./hub-model-pages').HubModelVerdict;
type Group = import('./hub-model-pages').HubModelGroup;

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
const show = (groups: Group[]) =>
  groups.map((g) => [g.name, g.chips.map((c) => c.label)] as [string, string[]]);

describe('buildHubModelGroups', () => {
  it('같은 상품 줄은 한 줄로 묶고 다른 부분만 칩으로, 허브 이름이 말한 브랜드는 뺀다', () => {
    const r = buildHubModelGroups(
      '오뚜기',
      [
        page('a', '오뚜기', '진라면 매운맛', 3),
        page('b', '오뚜기', '진라면 순한맛', 2),
        page('c', '오뚜기', '열라면'),
        page('d', '오뚜기', '더 핫 열라면'),
        page('e', '오뚜기', '참깨라면'),
      ],
      [],
    );
    assert.deepEqual(show(r.groups), [
      ['진라면', ['매운맛', '순한맛']],
      ['열라면', ['열라면', '더 핫']],
    ]);
    assert.deepEqual(
      r.visible.map((c) => c.label),
      ['참깨라면'],
    );
    // 링크 글은 「진라면 매운맛」으로 읽히게 줄 이름을 앞붙인다(화면엔 숨김).
    assert.equal(r.groups[0].chips[0].prefix, '진라면');
  });

  it('꾸밈말·맛 이름·거의 모든 상품에 붙는 말은 줄 이름이 못 된다', () => {
    const r = buildHubModelGroups(
      '오뚜기',
      [
        page('a', '오뚜기', '고소한 참기름'),
        page('b', '오뚜기', '고소한 골드 마요네스'),
        page('c', '오리온', '닥터유 다이제 초코'),
        page('d', '오리온', '통크 초코'),
      ],
      [],
    );
    // 줄 이름(고소한·초코)으로는 안 묶인다 — 브랜드가 섞여 남은 둘만 브랜드로 묶인다.
    assert.deepEqual(
      r.groups.map((g) => g.name),
      ['오리온'],
    );
  });

  it('숫자 꼬리는 떼고 묶되, 칩에 숫자만 남기지 않는다', () => {
    const r = buildHubModelGroups(
      '갤럭시',
      [
        page('a', '삼성전자', '갤럭시 버즈4 프로'),
        page('b', '삼성전자', '갤럭시 버즈3'),
        page('c', '삼성전자', '갤럭시탭S10 울트라'),
        page('d', '삼성전자', '갤럭시탭S9 플러스'),
      ],
      [],
    );
    assert.deepEqual(show(r.groups), [
      ['버즈', ['버즈4 프로', '버즈3']],
      ['갤럭시탭', ['S10 울트라', 'S9 플러스']],
    ]);
  });

  it('브랜드가 섞인 허브 — 줄은 같은 브랜드 안에서만, 남은 것은 브랜드로', () => {
    const r = buildHubModelGroups(
      '라면',
      [
        page('a', '농심', '신라면', 5),
        page('b', '농심', '신라면 블랙', 4),
        page('c', '오뚜기', '참깨라면', 3),
        page('d', '오뚜기', '김치라면', 2),
        page('e', '팔도', '비빔면'),
      ],
      [],
    );
    assert.deepEqual(show(r.groups), [
      ['신라면', ['신라면', '블랙']],
      ['오뚜기', ['참깨라면', '김치라면']],
    ]);
    assert.deepEqual(
      r.visible.map((c) => c.label),
      ['팔도 비빔면'],
    );
  });

  it('묶음 구성(+)은 맨 뒤 한 줄로', () => {
    const r = buildHubModelGroups(
      '농심',
      [
        page('a', '농심', '신라면10개 + 짜파게티5개', 9),
        page('b', '농심', '신라면5개 + 너구리5개', 9),
        page('c', '농심', '짜파게티 사천'),
        page('d', '농심', '짜파게티 범벅'),
      ],
      [],
    );
    assert.deepEqual(
      r.groups.map((g) => g.name),
      ['짜파게티', BUNDLE_GROUP],
    );
  });

  it('지금 싼 상품이 든 줄·칩을 앞으로 — 진행 중 딜이 없으면 판정이 좋아도 아니다', () => {
    const r = buildHubModelGroups(
      '오뚜기',
      [
        page('a', '오뚜기', '진라면 매운맛', 9),
        page('b', '오뚜기', '진라면 순한맛', 1),
        page('c', '오뚜기', '열라면', 1),
        page('d', '오뚜기', '열라면 컵', 1),
        page('e', '오뚜기', '참깨라면'),
      ],
      [
        verdict('c', 'cheap', 12),
        verdict('b', 'lowest'),
        { ...verdict('e', 'lowest'), activeDealCount: 0 },
      ],
    );
    assert.equal(r.goodCount, 2);
    assert.deepEqual(
      r.groups.map((g) => g.chips.map((c) => [c.label, c.good])),
      [
        [
          ['순한맛', '기록상 최저'],
          ['매운맛', null],
        ],
        [
          ['열라면', '평소보다 12%↓'],
          ['컵', null],
        ],
      ],
    );
    assert.equal(r.visible[0].good, null);
  });

  it('묶이지 않은 것은 몇 개만 펼치고 나머지는 접는다', () => {
    const pages = Array.from({ length: HUB_MODEL_SINGLES_VISIBLE + 5 }, (_, i) =>
      page(`p${i}`, 'x', `상품${'가나다라마바사아자차카타파하거너'[i]}`),
    );
    const r = buildHubModelGroups('x', pages, []);
    assert.equal(r.visible.length, HUB_MODEL_SINGLES_VISIBLE);
    assert.equal(r.folded.length, 5);
  });

  it('다른 브랜드에 같은 줄 이름이 있으면 브랜드를 붙여 가른다', () => {
    const r = buildHubModelGroups(
      '물티슈',
      [
        page('a', '베베숲', '시그니처 블루'),
        page('b', '베베숲', '시그니처 레드'),
        page('c', '슈퍼대디', '시그니처 민트'),
        page('d', '슈퍼대디', '시그니처 그린'),
        page('e', '리벤스', '소프트 내추럴'),
        page('f', '광진', '클리어 베이직'),
        page('g', '페넬로페', '에펠'),
        page('h', '베베앙', '클래스'),
      ],
      [],
    );
    assert.deepEqual(
      r.groups.map((g) => g.name),
      ['베베숲 시그니처', '슈퍼대디 시그니처'],
    );
  });
});
