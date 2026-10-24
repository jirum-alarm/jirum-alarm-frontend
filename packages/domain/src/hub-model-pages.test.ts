import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildHubModelGroups, findHubModelLine, BUNDLE_GROUP, HUB_MODEL_SINGLES_VISIBLE } =
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

describe('buildHubModelGroups — 운영 허브에서 나온 어긋남(2026-10-24)', () => {
  it('흔한 말을 빼다 이름이 겹치면 그 칩만 다 쓴다 — 「칠성사이다 제로」와 「칠성사이다」', () => {
    const r = buildHubModelGroups(
      '사이다',
      [
        page('a', '롯데칠성음료', '칠성사이다 제로', 9),
        page('b', '롯데칠성음료', '칠성사이다', 5),
        page('c', '롯데칠성음료', '칠성사이다 제로 유자', 3),
        page('d', '동아오츠카', '나랑드 사이다 제로'),
        page('e', '일화', '천연사이다 제로'),
        page('f', '해태htb', '갈배사이다 제로'),
      ],
      [],
    );
    assert.deepEqual(show(r.groups), [['칠성사이다', ['제로', '칠성사이다', '유자']]]);
  });

  it('이름까지 같은 칩(카탈로그 중복 페이지)은 딜 많은 하나만 — 공백만 다른 것도', () => {
    const r = buildHubModelGroups(
      '콜라',
      [
        page('a', '코카콜라음료', '코카콜라 제로', 20),
        page('b', '코카콜라음료', '코카콜라 제로', 3),
        page('c', '코카콜라음료', '코카콜라 제로 제로', 4),
        page('d', '코카콜라음료', '코카콜라 제로제로', 2),
        page('e', '코카콜라음료', '코카콜라', 9),
      ],
      [],
    );
    // 묶인 줄이든 그 밖의 상품이든 — 여기선 「코카콜라」가 거의 모든 상품에 붙어 줄이 못 되고 전부 그 밖의 상품.
    const chips = [...r.groups.flatMap((g) => g.chips), ...r.visible, ...r.folded];
    assert.deepEqual(
      chips.map((c) => c.slug),
      ['a', 'e', 'c'],
    );
    assert.equal(r.total, 3);
  });

  it('줄 이름은 그 브랜드의 말 — 여러 브랜드에 붙는 맛·성분(검은콩)보다 「베지밀」', () => {
    const r = buildHubModelGroups(
      '두유',
      [
        page('a', '정식품', '베지밀 뼈에좋은 칼슘두유 검은콩'),
        page('b', '정식품', '베지밀 검은콩 두유 고칼슘'),
        page('c', '서울우유', '고칼슘 검은콩 블랙9곡 두유'),
        page('d', '매일유업', '매일두유 검은콩 고단백'),
        page('e', '이롬', '황성주 국산콩 두유 검은콩 고칼슘'),
        page('f', '매일유업', '매일두유 렌틸콩'),
      ],
      [],
    );
    assert.ok(r.groups.some((g) => g.name === '베지밀'));
    assert.ok(!r.groups.some((g) => g.name === '검은콩'));
  });

  it('괄호로 시작하는 낱말(업소용)·맛 정도(마일드)는 줄 이름이 못 된다', () => {
    const pepsi = buildHubModelGroups(
      '펩시',
      [
        page('a', '롯데칠성음료', '펩시콜라 제로슈거 라임향 245ml (업소용)'),
        page('b', '롯데칠성음료', '펩시콜라 제로슈거 라임향 355ml (업소용)'),
        page('c', '롯데칠성음료', '펩시콜라 엑스트라 피즈'),
        page('d', '롯데칠성음료', '펩시콜라'),
      ],
      [],
    );
    assert.ok(!pepsi.groups.some((g) => g.name.startsWith('(')));
    const maxim = buildHubModelGroups(
      '맥심',
      [
        page('a', '동서식품', '맥심 모카골드 마일드 커피믹스 400T'),
        page('b', '동서식품', '맥심 화이트골드 커피믹스 400T'),
        page('c', '동서식품', '맥심 카누 마일드 로스트 아메리카노 미니 130T'),
        page('d', '동서식품', '맥심 티오피 마스터 라떼'),
      ],
      [],
    );
    assert.deepEqual(show(maxim.groups), [['커피믹스', ['모카골드 마일드 400T', '화이트골드 400T']]]);
  });
});

describe('findHubModelLine', () => {
  const pages = [
    page('a', '오뚜기', '진라면 매운맛', 3),
    page('b', '오뚜기', '진라면 순한맛', 2),
    page('c', '오뚜기', '진라면 매운맛 컵'),
    page('d', '오뚜기', '참깨라면'),
    page('e', '농심', '신라면5개 + 짜파게티5개'),
    page('f', '농심', '너구리5개 + 안성탕면5개'),
  ];
  const { groups } = buildHubModelGroups('라면', pages, []);

  it('모델 페이지가 허브에서 묶인 줄을 허브와 같은 순서로 돌려준다', () => {
    const line = findHubModelLine(groups, 'c');
    assert.equal(line?.name, '진라면');
    assert.deepEqual(
      line?.chips.map((c) => [c.slug, c.label]),
      [
        ['a', '매운맛'],
        ['b', '순한맛'],
        ['c', '매운맛 컵'],
      ],
    );
  });

  it('줄에 안 묶인 상품·서로 다른 구성의 「여러 개 묶음」은 null', () => {
    assert.equal(findHubModelLine(groups, 'd'), null);
    assert.equal(findHubModelLine(groups, 'e'), null);
    assert.ok(groups.some((g) => g.name === BUNDLE_GROUP));
    assert.equal(findHubModelLine(groups, 'zzz'), null);
  });
});
