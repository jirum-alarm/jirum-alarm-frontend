import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  withTopicParticle,
  buildDealsAnswer,
  buildDealsLeadSentence,
  pickModelAlertKeyword,
  recentDealRows,
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

describe('recentDealRows', () => {
  const now = Date.parse('2026-10-20T00:00:00Z');
  const d = (over = {}) => ({
    productId: 1,
    title: '<img src="x"> 삼다수 2L 12개',
    price: 9900,
    priceCurrency: 'KRW',
    mallName: '쿠팡',
    postedAt: '2026-10-19T12:00:00Z',
    thumbnail: null,
    isEnd: false,
    isVerified: true,
    ...over,
  });

  it('서버 판정(검수·검수 전)을 그대로 — 제목 정리·통화 표기만 한다', () => {
    const [a, b] = recentDealRows(
      [d(), d({ productId: 2, isVerified: false, price: 219.76, priceCurrency: 'USD' })],
      now,
    );
    assert.equal(a.title, '삼다수 2L 12개');
    assert.equal(a.priceText, '9,900원');
    assert.equal(a.source, 'verified');
    assert.equal(b.priceText, '$219.76');
    assert.equal(b.source, 'pending');
  });

  it('3일 지난 딜은 종료 표시가 없어도 지난 딜', () => {
    assert.equal(recentDealRows([d({ postedAt: '2026-10-15T00:00:00Z' })], now)[0].isEnd, true);
    assert.equal(recentDealRows([d()], now)[0].isEnd, false);
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

  it('지난 가격이 없어도 서버가 진행 딜 없음이라 했으면 그 말을 한다', () => {
    const t = timingFromVerdict({
      histBasis: 'total',
      verdict: verdict({ tone: null, pendingReason: 'NO_ACTIVE', comparePrice: null }),
    });
    assert.equal(t.label, '진행 중인 핫딜 없음');
  });

  it('다나와와 같은 값이면 「더 쌉니다」가 아니라 「같습니다」', () => {
    const t = timingFromVerdict({
      ...base,
      verdict: verdict({
        tone: 'mall_cheaper',
        activePrice: 3050,
        mallPrice: 3050,
        bestPackLabel: '120g 5개',
      }),
    });
    const lead = buildDealsLeadSentence({
      modelName: '오뚜기 진라면 매운맛',
      timing: t,
      dealCount: 60,
      formatPrice: fmt,
    });
    assert.match(
      lead ?? '',
      /^오뚜기 진라면 매운맛은 지금 핫딜\(120g 5개 3,050원\)이 다나와 최저가와 같습니다\./,
    );
  });

  it('진행 딜이 없으면 리드 문장에 마지막 핫딜을 한국 날짜로 — 인용돼도 낡지 않게', () => {
    const none = timingFromVerdict({
      ...base,
      verdict: verdict({
        tone: null,
        pendingReason: 'NO_ACTIVE',
        comparePrice: null,
        activeDealCount: 0,
      }),
    });
    const lead = buildDealsLeadSentence({
      modelName: '오뚜기 진라면 매운맛 컵',
      timing: none,
      dealCount: 10,
      formatPrice: fmt,
      // UTC 9/28 18시 = 한국 9/29 새벽
      lastDeal: { postedAt: '2026-09-28T18:33:45.000Z', price: 9000 },
    });
    assert.match(lead ?? '', /마지막 핫딜 2026년 9월 29일\(9,000원\)\.$/);
  });
});

describe('buildDealsAnswer', () => {
  type Verdict = NonNullable<Parameters<typeof timingFromVerdict>[0]['verdict']>;
  const NOW = Date.parse('2026-10-24T12:00:00+09:00');
  const DAY = 24 * 60 * 60 * 1000;
  const verdict = (over: Partial<Verdict> = {}): Verdict => ({
    tone: 'lowest',
    pendingReason: null,
    activeDealCount: 2,
    activeProductIds: [1, 2],
    bundleProductIds: [],
    bestProductId: 1,
    comparePrice: 463,
    activePrice: 25910,
    bestPackLabel: '140g 40개',
    mallPrice: null,
    avgPrice: 611,
    savePct: 24,
    buyLine: 541,
    historyPoints: 19,
    ...over,
  });
  const g = (n: number) => `100g당 ${Math.round(n).toLocaleString('ko-KR')}원`;
  const answer = (v: Verdict, lastDeal?: { postedAt: string; price?: number | null }) =>
    buildDealsAnswer({
      timing: timingFromVerdict({ verdict: v, histBasis: 'unit', histUnitLabel: '100g당' }),
      formatPrice: g,
      lastDeal,
      now: NOW,
    });

  it('진행 딜이 싸면 — 지금 값(총액)을 큰 글씨로, 단위가·평소 대비는 문장으로(기준선은 배지가 이미 답이라 뺀다)', () => {
    assert.deepEqual(answer(verdict()), {
      badge: { label: '기록상 최저 · 사기 좋은 구간', tone: 'success' },
      headline: '지금 가장 싼 핫딜 25,910원',
      detail: '140g 40개 · 100g당 463원',
      compare: '평소 핫딜가(100g당 611원)보다 24% 싸요',
      guide: null,
    });
  });

  it('평소보다 비싸면 비싸다고 + 기다릴 가격, 진행 딜이 하나면 「지금 핫딜」', () => {
    const a = answer(verdict({ tone: 'high', savePct: -61, activeDealCount: 1 }));
    assert.equal(a.badge?.tone, 'warning');
    assert.equal(a.headline, '지금 핫딜 25,910원');
    assert.equal(a.compare, '평소 핫딜가(100g당 611원)보다 61% 비싸요');
    assert.equal(a.guide, '100g당 541원 이하면 사기 좋은 가격이에요');
  });

  it('다나와가 답이면 다나와 값으로 비교하고 «이하면 사도 됨»은 말하지 않는다', () => {
    const cheaper = answer(verdict({ tone: 'mall_cheaper', mallPrice: 24000 }));
    assert.equal(cheaper.compare, '다나와 같은 구성 최저가 24,000원 — 핫딜보다 1,910원 싸요');
    assert.equal(cheaper.guide, null);
    const same = answer(verdict({ tone: 'mall_cheaper', mallPrice: 25910 }));
    assert.equal(same.compare, '다나와 같은 구성 최저가도 25,910원으로 같아요');
  });

  it('기록이 짧으면 비교 대신 이유를(서버는 그땐 기준선도 안 준다)', () => {
    const a = answer(
      verdict({
        tone: null,
        pendingReason: 'THIN_HISTORY',
        savePct: null,
        buyLine: null,
        historyPoints: 3,
      }),
    );
    assert.equal(a.badge?.label, '추이 대비 판단 불가');
    assert.equal(a.compare, '모인 핫딜 기록이 짧아 싼지 비싼지는 아직 말하지 않아요');
    assert.equal(a.guide, null);
  });

  it('진행 딜이 없으면 그게 큰 글씨 — 마지막 딜·평소 값·올라오면 살 기준', () => {
    const a = answer(
      verdict({
        tone: null,
        pendingReason: 'NO_ACTIVE',
        activeDealCount: 0,
        activeProductIds: [],
        bestProductId: null,
        comparePrice: null,
        activePrice: null,
        savePct: null,
      }),
      { postedAt: new Date(NOW - 25 * DAY).toISOString(), price: 9000 },
    );
    assert.deepEqual(a, {
      badge: null,
      headline: '지금은 진행 중인 핫딜이 없어요',
      detail: '마지막 핫딜 25일 전 · 9,000원',
      compare: '평소 핫딜가 100g당 611원',
      guide: '100g당 541원 이하로 올라오면 사기 좋은 가격이에요',
    });
  });

  it('증정 딜만 진행 중이면 건수와 이유(배지)만', () => {
    const a = answer(
      verdict({
        tone: null,
        pendingReason: 'BUNDLE_ONLY',
        comparePrice: null,
        savePct: null,
        activeDealCount: 1,
      }),
    );
    assert.equal(a.badge?.label, '증정·혜택 딜만 진행 중');
    assert.equal(a.headline, '진행 중인 핫딜 1건');
  });
});

describe('pickModelAlertKeyword', () => {
  it('모델명이 지난 딜 제목 절반 이상에 걸리면 그대로 — 가장 좁게 부르는 이름', () => {
    assert.equal(
      pickModelAlertKeyword({
        modelName: '진라면 매운맛 컵',
        brand: '오뚜기',
        hubName: '오뚜기',
        titles: [
          '오뚜기 진라면 매운맛 컵 65gx18개',
          '오뚜기 진라면 매운맛 컵라면',
          '오뚜기 진라면 컵 매운맛 65g, 12개',
          '진라면 컵 매운맛 65g 12개',
        ],
      }),
      '진라면 매운맛 컵',
    );
  });

  it('모델명이 제목에 거의 안 걸리면 제목에서 뽑은 후보 중 가장 많이 걸리는 것', () => {
    assert.equal(
      pickModelAlertKeyword({
        modelName: '울트라기어 27GS85Q',
        brand: 'LG전자',
        titles: [
          'LG 27GS85Q 게이밍 모니터 (299,000원/무료)',
          '[쿠팡] LG 27GS85Q 울트라기어',
          'LG전자 27인치 QHD 180Hz',
          '울트라기어 27GS85Q 역대가',
        ],
      }),
      'LG 27GS85Q',
    );
  });

  it('브랜드·상위 키워드 이름 그대로는 고르지 않는다 — 그 브랜드 전 상품에 걸린다', () => {
    assert.equal(
      pickModelAlertKeyword({
        modelName: '데코 앤 소프트 와이드 33m (24롤)',
        brand: '크리넥스',
        hubName: '휴지',
        titles: [
          '크리넥스 3겹 데코앤소프트 30m 24롤',
          '크리넥스 3겹 화장지 27m',
          '크리넥스 휴지 특가',
        ],
      }),
      '크리넥스 3겹',
    );
  });

  it('제목이 없으면 모델명', () => {
    assert.equal(pickModelAlertKeyword({ modelName: ' WX242 ', titles: [] }), 'WX242');
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
