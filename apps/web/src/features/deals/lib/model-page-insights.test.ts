import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  withTopicParticle,
  buildDealsLeadSentence,
  splitDealsForList,
  timingFromVerdict,
  cleanDealTitle,
} = require('./model-page-insights.ts') as typeof import('./model-page-insights');

type Timing = Parameters<typeof buildDealsLeadSentence>[0]['timing'];

const timing = (over: Partial<Timing> = {}): Timing => ({
  tone: 'good',
  label: '역대급 · 사기 좋은 구간',
  current: 22,
  avg: 151,
  buyLine: 73,
  savePct: 85,
  basis: 'unit',
  unitLabel: '100ml당',
  packLabel: null,
  totalPrice: 14830,
  activeDealCount: 16,
  isActivePrice: true,
  bestPackLabel: null,
  mallPrice: null,
  historyPoints: 9,
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

describe('cleanDealTitle', () => {
  it('크롤링 제목의 HTML 태그·엔티티를 걷어낸다', () => {
    assert.equal(
      cleanDealTitle('<img src="/images/menu/hot_icon2.jpg"> [네이버] 스팸 &amp; 햄'),
      '[네이버] 스팸 & 햄',
    );
    assert.equal(cleanDealTitle('사랑해요 <3 스팸'), '사랑해요 <3 스팸');
  });
});

describe('buildRecentDeals', () => {
  const { buildRecentDeals, modelNameTokens } =
    require('./model-page-insights.ts') as typeof import('./model-page-insights');
  const now = Date.parse('2026-10-13T00:00:00Z');
  const matched = (productId: number, postedAt: string, isEnd = false) => ({
    productId,
    title: 'CJ제일제당 맛밤 60g 20개',
    price: 19900,
    url: '',
    providerId: 1,
    mallName: '쿠팡',
    postedAt,
    thumbnail: null,
    isEnd,
  });

  it('모델 이름 낱말에서 용량·수량은 빼고 모델 번호는 남긴다', () => {
    assert.deepEqual(modelNameTokens('펩시콜라 제로슈거 라임향 210ml 30개 + 칠성사이다'), [
      '펩시콜라',
      '제로슈거',
      '라임향',
      '칠성사이다',
    ]);
    assert.deepEqual(modelNameTokens('RTX 4060'), ['rtx', '4060']);
  });

  it('매칭 딜과 이름 검색 딜을 날짜순으로 합치고, 낱말이 다 안 들어간 검색 결과·겹치는 딜은 뺀다', () => {
    const rows = buildRecentDeals({
      deals: [matched(1, '2026-10-12T00:00:00Z'), matched(2, '2026-08-01T00:00:00Z')],
      searched: [
        { id: 1, title: '맛밤 60g', postedAt: '2026-10-12T00:00:00Z' },
        { id: 10, title: 'CJ 맛밤 80g 12개', price: '23,800원', postedAt: '2026-10-12T12:00:00Z' },
        // 같은 딜이 다른 커뮤니티에도 — 한 줄만
        { id: 13, title: 'CJ 맛밤 80g 12개 23,800원', postedAt: '2026-10-12T11:00:00Z' },
        // 브랜드 없는 제목 — 이름이 짧은 상품은 다른 회사 상품이 섞여서 브랜드를 본다
        { id: 14, title: '윤서의달밤 맛밤 30봉', postedAt: '2026-10-12T15:00:00Z' },
        { id: 11, title: '해태 맛동산 밤라떼맛', postedAt: '2026-10-12T13:00:00Z' },
        { id: 12, title: '간편하게 즐기는 달달맛밤 10봉', postedAt: '2026-10-12T14:00:00Z' },
      ],
      modelName: '맛밤',
      brand: 'CJ제일제당',
      now,
    });
    assert.deepEqual(
      rows.map((r) => [r.productId, r.source]),
      [
        [10, 'search'],
        [1, 'matched'],
      ],
    );
    assert.equal(rows[0].priceText, '23,800원');
    assert.equal(rows[1].priceText, '19,900원');
  });

  it('모델 번호가 있으면 브랜드가 제목에 없어도 받는다', () => {
    const { isSameModelTitle } =
      require('./model-page-insights.ts') as typeof import('./model-page-insights');
    assert.equal(
      isSameModelTitle('에어프라이어 오븐 TOA-70KR 99000원', 'TOA-70KR', '쿠진아트'),
      true,
    );
    assert.equal(isSameModelTitle('로봇 짱구 잠옷세트', '짱구', '삼양식품'), false);
  });

  it('사흘 지난 딜은 종료 표시가 없어도 끝난 딜로 보여 준다', () => {
    const rows = buildRecentDeals({
      deals: [matched(1, '2026-10-12T00:00:00Z'), matched(2, '2026-10-05T00:00:00Z')],
      searched: [],
      modelName: '맛밤',
      now,
    });
    assert.deepEqual(
      rows.map((r) => r.isEnd),
      [false, true],
    );
  });
});

describe('timingFromVerdict', () => {
  type Verdict = NonNullable<Parameters<typeof timingFromVerdict>[0]['verdict']>;
  const verdict = (over: Partial<Verdict> = {}): Verdict => ({
    tone: 'lowest',
    pendingReason: null,
    activeDealCount: 1,
    activeProductIds: [1],
    bundleProductIds: [],
    bestProductId: 1,
    comparePrice: 140,
    activePrice: 11750,
    bestPackLabel: '350ml 24개',
    mallPrice: null,
    avgPrice: 152,
    savePct: 8,
    buyLine: 147,
    historyPoints: 5,
    ...over,
  });
  const heroPrice = { minPrice: 9900, label: '1.5L 12개', unitPrice: 55, unitLabel: '100ml당' };
  const base = { histBasis: 'unit' as const, histUnitLabel: '100ml당', heroPrice };

  it('서버 판정을 그대로 문구로 — 판정은 다시 계산하지 않는다', () => {
    const t = timingFromVerdict({ ...base, verdict: verdict() });
    assert.equal(t.tone, 'good');
    assert.equal(t.label, '기록상 최저 · 사기 좋은 구간');
    assert.equal(t.current, 140);
    assert.equal(t.totalPrice, 11750);
    assert.equal(t.isActivePrice, true);
    assert.equal(t.bestPackLabel, '350ml 24개');
  });

  it('다나와가 더 싸면 mall — 리드 문장도 다나와가 답이다', () => {
    const t = timingFromVerdict({
      ...base,
      verdict: verdict({ tone: 'mall_cheaper', mallPrice: 10740 }),
    });
    assert.equal(t.tone, 'mall');
    const lead = buildDealsLeadSentence({
      modelName: '동원F&B 보성녹차',
      timing: t,
      dealCount: 8,
      formatPrice: fmt,
    });
    assert.match(
      lead ?? '',
      /^동원F&B 보성녹차는 지금 핫딜\(350ml 24개 11,750원\)보다 다나와 최저가\(10,740원\)가 더 쌉니다/,
    );
  });

  it('판정 못 한 이유별 문구, 진행 딜이 없으면 히어로가를 "지난 핫딜"로', () => {
    const pending = (pendingReason: string, over: Partial<Verdict> = {}) =>
      timingFromVerdict({
        ...base,
        verdict: verdict({ tone: null, pendingReason, comparePrice: null, ...over }),
      });
    assert.equal(pending('NO_ACTIVE').label, '진행 중인 핫딜 없음');
    assert.equal(pending('BUNDLE_ONLY').label, '증정·혜택 딜만 진행 중');
    assert.equal(pending('NOT_COMPARABLE').label, '진행 중 · 단가 비교 불가');
    assert.equal(pending('THIN_HISTORY', { comparePrice: 140 }).label, '추이 대비 판단 불가');
    const none = pending('NO_ACTIVE');
    assert.equal(none.tone, 'unknown');
    assert.equal(none.isActivePrice, false);
    assert.equal(none.current, 55);
    assert.equal(none.totalPrice, 9900);
    assert.equal(none.packLabel, '1.5L 12개');
    assert.equal(none.bestPackLabel, null);
  });

  it('판정이 없으면(옛 응답) 가격 정보만으로 판정 없음', () => {
    assert.equal(timingFromVerdict({ ...base, verdict: null }).tone, 'unknown');
    assert.equal(timingFromVerdict({ histBasis: 'total', verdict: null }).label, '가격 정보 부족');
  });
});

describe('splitDealsForList', () => {
  const deal = (productId: number, price = 1000 + productId, title = `딜 ${productId}`) => ({
    productId,
    title,
    price,
    url: '',
    providerId: 1,
    mallName: null,
    postedAt: '2026-10-01T00:00:00Z',
    thumbnail: null,
  });

  it('진행 중은 서버가 센 딜만, 증정 딜은 뒤로', () => {
    const { active, history } = splitDealsForList(
      [deal(1, 500), deal(2), deal(3, 900), deal(4)],
      'total',
      null,
      { activeProductIds: [1, 3, 4], bundleProductIds: [1] },
    );
    assert.deepEqual(
      active.map((d) => d.productId),
      [3, 4, 1],
    );
    assert.equal(history.length, 4);
  });

  it('원화 페이지에서 외화(소수 가격) 딜은 진행 중·이력 모두 뒤로 — 첫 줄이 "지금 추천"이다', () => {
    const { active, history } = splitDealsForList([deal(9, 219.76), deal(500)], 'total', null, {
      activeProductIds: [9, 500],
      bundleProductIds: [],
    });
    assert.deepEqual(
      active.map((d) => d.productId),
      [500, 9],
    );
    assert.deepEqual(
      history.map((d) => d.productId),
      [500, 9],
    );
  });
});
