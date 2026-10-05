import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { withTopicParticle, buildDealsLeadSentence, splitDealsForList, cleanDealTitle } =
  require('./model-page-insights.ts') as typeof import('./model-page-insights');

type Timing = Parameters<typeof buildDealsLeadSentence>[0]['timing'];

const timing = (over: Partial<Timing> = {}): Timing => ({
  tone: 'good',
  label: '역대급 · 사기 좋은 구간',
  current: 22,
  avg: 151,
  buyLine: 73,
  saveVsAvg: 129,
  savePct: 85,
  basis: 'unit',
  unitLabel: '100ml당',
  packLabel: null,
  totalPrice: 14830,
  activeDealCount: 16,
  isActivePrice: true,
  ...over,
});

const fmt = (n: number) => `100ml당 ${Math.round(n).toLocaleString('ko-KR')}원`;

describe('withTopicParticle', () => {
  it('종성이 있으면 은', () => {
    assert.equal(withTopicParticle('펩시콜라 제로슈거 라임향'), '펩시콜라 제로슈거 라임향은');
    assert.equal(withTopicParticle('신라면'), '신라면은');
  });

  it('종성이 없으면 는', () => {
    assert.equal(withTopicParticle('제주 삼다수'), '제주 삼다수는');
    assert.equal(withTopicParticle('포카리스웨트'), '포카리스웨트는');
  });

  it('숫자로 끝나면 읽는 소리로 고른다', () => {
    assert.equal(withTopicParticle('RTX 4060'), 'RTX 4060은'); // 영
    assert.equal(withTopicParticle('아이폰 15'), '아이폰 15는'); // 오
    assert.equal(withTopicParticle('갤럭시 S24'), '갤럭시 S24는'); // 사
    assert.equal(withTopicParticle('EOS 6'), 'EOS 6은'); // 육
  });

  it('영문·기호로 끝나면 는', () => {
    assert.equal(withTopicParticle('jonr-p20-pro'), 'jonr-p20-pro는');
  });
});

describe('buildDealsLeadSentence', () => {
  it('적정가를 먼저, 근거를 뒤에 붙인다', () => {
    const s = buildDealsLeadSentence({
      modelName: '펩시콜라 제로슈거 라임향',
      timing: timing(),
      dealCount: 759,
      formatPrice: fmt,
    });
    assert.equal(
      s,
      '펩시콜라 제로슈거 라임향은 100ml당 73원 이하면 사도 되는 가격입니다. ' +
        '최근 핫딜 759건 · 추이 평균 100ml당 151원 · 지금 진행 중 최저가 100ml당 22원 (평균보다 약 85% 저렴).',
    );
  });

  it('적정가가 없으면 근거 문장만 낸다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ buyLine: null, savePct: null, avg: null }),
      dealCount: 12,
      formatPrice: fmt,
    });
    assert.equal(s, '최근 핫딜 12건 · 지금 진행 중 최저가 100ml당 22원.');
  });

  it('평균보다 비쌀 때 "저렴"을 붙이지 않는다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ savePct: -12 }),
      dealCount: 3,
      formatPrice: fmt,
    });
    assert.ok(s);
    assert.ok(!s.includes('저렴'), s);
  });

  it('쓸 수 있는 수치가 하나도 없으면 null — 폴백 문구를 쓰게 한다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ buyLine: null, avg: null, current: 0, savePct: null }),
      dealCount: 0,
      formatPrice: fmt,
    });
    assert.equal(s, null);
  });

  it('모델명이 비면 null', () => {
    assert.equal(
      buildDealsLeadSentence({
        modelName: '   ',
        timing: timing(),
        dealCount: 759,
        formatPrice: fmt,
      }),
      null,
    );
  });

  it('건수는 천 단위 구분자를 넣는다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing(),
      dealCount: 1234,
      formatPrice: fmt,
    });
    assert.ok(s?.includes('최근 핫딜 1,234건'), s ?? '');
  });
});

describe('buildModelDisplayName', () => {
  const { buildModelDisplayName } =
    require('./model-page-insights.ts') as typeof import('./model-page-insights');

  it('브랜드가 이름에 없으면 앞에 붙인다', () => {
    assert.equal(buildModelDisplayName('에디파이어', 'M90'), '에디파이어 M90');
    assert.equal(buildModelDisplayName('삼성전자', '포터블 SSD T7'), '삼성전자 포터블 SSD T7');
  });

  it('이미 들어 있으면 그대로(대소문자 무시)', () => {
    assert.equal(buildModelDisplayName('농심', '농심 신라면'), '농심 신라면');
    assert.equal(buildModelDisplayName('JONR', 'jonr P20 Pro'), 'jonr P20 Pro');
  });

  it('브랜드가 모델 첫 토큰으로 시작하면 중복으로 본다', () => {
    assert.equal(buildModelDisplayName('코카콜라음료', '코카콜라 제로'), '코카콜라 제로');
  });

  it('연속 중복 토큰을 줄인다', () => {
    assert.equal(buildModelDisplayName(null, '코카콜라 제로 제로'), '코카콜라 제로');
  });

  it('브랜드가 없으면 이름만', () => {
    assert.equal(buildModelDisplayName(null, 'L10s Ultra GEN2'), 'L10s Ultra GEN2');
  });
});

describe('buildTimingInsight', () => {
  const { buildTimingInsight } =
    require('./model-page-insights.ts') as typeof import('./model-page-insights');
  const now = Date.parse('2026-10-01T00:00:00Z');
  const deal = (price: number, postedAt: string | null, extra = {}) => ({
    productId: price,
    title: '농심 신라면 120g 40개',
    price,
    url: '',
    providerId: 1,
    mallName: null,
    postedAt,
    thumbnail: null,
    ...extra,
  });
  const histPrices: number[] = [14000, 15000, 16000, 17000];

  it('가격 오독(추이 중앙값의 40% 미만)은 현재가로 쓰지 않는다', () => {
    const t = buildTimingInsight({
      deals: [deal(4454, '2026-09-28T00:00:00Z'), deal(14454, '2026-09-27T00:00:00Z')],
      histPrices,
      histBasis: 'total',
      now,
    });
    assert.equal(t.current, 14454);
  });

  it('30일 지난 딜·게시일 모르는 딜은 "진행 중"에서 뺀다', () => {
    const t = buildTimingInsight({
      deals: [
        deal(13000, '2024-05-01T00:00:00Z'),
        deal(13500, null),
        deal(15500, '2026-09-20T00:00:00Z'),
      ],
      histPrices,
      histBasis: 'total',
      now,
    });
    assert.equal(t.current, 15500);
    assert.equal(t.activeDealCount, 1);
  });

  it('진행 중 딜이 없으면 히어로가로 폴백한다', () => {
    const t = buildTimingInsight({
      deals: [deal(13000, '2024-05-01T00:00:00Z')],
      histPrices,
      histBasis: 'total',
      heroPrice: { minPrice: 15900, label: '40개', unitPrice: null, unitLabel: null },
      now,
    });
    assert.equal(t.current, 15900);
    assert.equal(t.activeDealCount, 0);
    // 지난 가격으로 "사기 좋은 구간"이라 하지 않는다 — /deals 목록은 이 상품을 "기다리는 상품"에 둔다.
    assert.equal(t.tone, 'unknown');
    assert.equal(t.isActivePrice, false);
  });

  it('추이가 평평하면 역대 최저여도 "역대급"이라 하지 않는다', () => {
    const t = buildTimingInsight({
      deals: [deal(10000, '2026-09-20T00:00:00Z')],
      histPrices: [10000, 10000, 10000, 10000, 10000],
      histBasis: 'total',
      now,
    });
    assert.equal(t.tone, 'fair');
  });

  it('추이 점이 5개 미만이면 판정하지 않는다', () => {
    const t = buildTimingInsight({
      deals: [deal(5000, '2026-09-20T00:00:00Z')],
      histPrices: [9000, 10000],
      histBasis: 'total',
      now,
    });
    assert.equal(t.tone, 'unknown');
  });
});

describe('splitDealsForList', () => {
  const now = Date.parse('2026-10-05T00:00:00Z');
  const deal = (productId: number, postedAt: string, isEnd = false) => ({
    productId,
    title: `딜 ${productId}`,
    price: 1000 + productId,
    isEnd,
    url: '',
    providerId: 1,
    mallName: null,
    postedAt,
    thumbnail: null,
  });

  it('진행 중 = 비종료 + 30일 이내 (isEnd 가 안 꺼진 옛 딜은 이력에만)', () => {
    const { active, history } = splitDealsForList(
      [
        deal(1, '2026-10-01T00:00:00Z'),
        deal(2, '2023-08-22T00:00:00Z'),
        deal(3, '2026-10-02T00:00:00Z', true),
      ],
      'total',
      null,
      now,
    );
    assert.deepEqual(
      active.map((d) => d.productId),
      [1],
    );
    assert.equal(history.length, 3);
  });
});

describe('cleanDealTitle', () => {
  it('크롤링 제목의 HTML 태그·엔티티를 걷어낸다', () => {
    assert.equal(
      cleanDealTitle('<img src="/images/menu/hot_icon2.jpg"> [네이버] 스팸 &amp; 햄'),
      '[네이버] 스팸 & 햄',
    );
    assert.equal(cleanDealTitle('사랑해요 <3 스팸'), '사랑해요 <3 스팸');
  });
});
