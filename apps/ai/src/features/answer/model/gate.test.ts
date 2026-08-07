import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  computePosition,
  gateAnswer,
  historyPrices,
  isAudienceMismatch,
  isBundle,
  isPolluted,
  krwPrice,
  majorityCategory,
  positionFromHistory,
} from './gate.ts';

import type { Deal, PricePoint } from './types.ts';

const point = (dealId: number, price: number, isSeed = false): PricePoint => ({
  date: '2026-08-01',
  price,
  dealId,
  isSeed,
});

const deal = (
  title: string,
  parsedPrice: number | null = 10_000,
  priceCurrency: string | null = 'KRW',
): Deal => ({
  id: Math.floor(Math.random() * 1e6),
  title,
  url: 'https://example.com/deal',
  parsedPrice,
  priceCurrency,
  mallName: '쿠팡',
  categoryName: '식품',
  postedAt: '2026-08-01',
  commentSummary: null,
});

test('isPolluted: 실제 프로덕션에서 관측된 오염 제목을 잡는다', () => {
  // 실측 2026-08-07: 콜라 50건 중 콜라겐 22 · 콜라보 9
  assert.equal(isPolluted('저분자 콜라겐 펩타이드 300g', '콜라'), true);
  assert.equal(isPolluted('앱코 ABKO x SOAI 콜라보 기계식 키보드', '콜라'), true);
  assert.equal(isPolluted('맥심 커피믹스 100T', '커피'), true);
  assert.equal(isPolluted('라면포트 냄비', '라면'), true);
});

test('isPolluted: 진짜 그 상품은 통과시킨다', () => {
  assert.equal(isPolluted('코카콜라 제로 레몬라임, 24개, 350ml', '콜라'), false);
  assert.equal(isPolluted('코카콜라, 500ml, 24개', '콜라'), false);
  // 오염 출현과 정상 출현이 함께 있으면 정상으로 본다
  assert.equal(isPolluted('콜라겐 말고 그냥 콜라 24캔', '콜라'), false);
});

test('isBundle: 다품목 나열을 잡는다 (실측 38%)', () => {
  assert.equal(isBundle('더미식 교자만두/장인라면/비빔면 등 임박할인 60%'), true);
  assert.equal(isBundle('백년수산,영양바,청수냉면,라리,폰타나,고춧가루 등'), true);
  assert.equal(isBundle('생수 외 12종 모음'), true);
  assert.equal(isBundle('코카콜라 제로 레몬라임, 24개, 350ml'), false);
});

test('gateAnswer: 오염이 과반이면 ANSWERED 로 가지 않는다', () => {
  const deals = [
    deal('저분자 콜라겐 펩타이드'),
    deal('콜라겐 이너뷰티'),
    deal('콜라보 기계식 키보드'),
    deal('코카콜라 24캔'),
  ];
  const state = gateAnswer(deals, '콜라');
  assert.equal(state.kind, 'PARTIAL');
  if (state.kind === 'PARTIAL') {
    assert.equal(state.reason.code, 'KEYWORD_POLLUTION');
    // 오염 제거 후 남은 것만 노출
    assert.equal(state.deals.length, 1);
  }
});

test('gateAnswer: 묶음딜이 과반이면 단일 시세를 주장하지 않는다', () => {
  const deals = [
    deal('과자,음료,라면 등 모음전'),
    deal('식품 외 20종 다양'),
    deal('생수,커피,차 등 (다양/무료)'),
    deal('삼다수 2L 6입'),
  ];
  const state = gateAnswer(deals, '생수');
  assert.equal(state.kind, 'PARTIAL');
  if (state.kind === 'PARTIAL') assert.equal(state.reason.code, 'MIXED_BUNDLE');
});

test('gateAnswer: 표본이 20건 미만이면 사분위를 약속하지 않는다', () => {
  const deals = Array.from({ length: 5 }, (_, i) => deal(`코카콜라 ${i}호`, 15_000 + i));
  const state = gateAnswer(deals, '콜라');
  assert.equal(state.kind, 'PARTIAL');
  if (state.kind === 'PARTIAL') {
    assert.equal(state.reason.code, 'SMALL_SAMPLE');
    assert.equal(state.reason.sampleSize, 5);
  }
});

test('gateAnswer: 깨끗하고 표본이 충분하면 ANSWERED', () => {
  const deals = Array.from({ length: 22 }, (_, i) => deal(`코카콜라 ${i}호`, 15_000 + i));
  assert.equal(gateAnswer(deals, '콜라').kind, 'ANSWERED');
});

test('gateAnswer: 결과 없음은 REFUSED', () => {
  const state = gateAnswer([], '콜라');
  assert.equal(state.kind, 'REFUSED');
  if (state.kind === 'REFUSED') assert.equal(state.reason.code, 'NO_RESULTS');
});

test('computePosition: 자기 시세 안에서의 위치를 낸다', () => {
  // 에어팟 169,000 이 12건 중 하위 → cheap
  const cheap = computePosition(
    169_000,
    [
      169_000, 189_000, 199_000, 209_000, 219_000, 229_000, 179_000, 239_000, 249_000, 259_000,
      269_000, 279_000,
    ],
  );
  assert.ok(cheap);
  assert.equal(cheap.verdict, 'cheap');
  assert.equal(cheap.min, 169_000);

  // 버즈 98,000 이 7건 중 상위 → pricey
  const pricey = computePosition(98_000, [69_000, 72_000, 78_000, 85_000, 89_000, 92_000, 98_000]);
  assert.ok(pricey);
  assert.equal(pricey.verdict, 'pricey');
});

test('computePosition: 이력 1건 이하면 위치를 만들지 않는다', () => {
  assert.equal(computePosition(10_000, [10_000]), null);
  assert.equal(computePosition(10_000, []), null);
});

test('isAudienceMismatch: 반려동물용을 사람용 검색에서 걷어낸다 (로컬 렌더에서 발견)', () => {
  // 실측: "기저귀" 45건 중 절반이 강아지 기저귀였다
  assert.equal(
    isAudienceMismatch('아몬스 중형 강아지 기저귀 매너 벨트, 신생아, 1개', '기저귀'),
    true,
  );
  assert.equal(isAudienceMismatch('비비독 케어 애견기저귀 여아용, 소형, 50매', '기저귀'), true);
  assert.equal(isAudienceMismatch('반려세상 고급형 반려동물 기저귀, 소형, 50매', '기저귀'), true);
  // 사람용은 통과
  assert.equal(
    isAudienceMismatch('한예지 PLAY 360 프리미엄 팬티 기저귀 점보형(2XL)', '기저귀'),
    false,
  );
  // 검색어에 그 토큰이 있으면 가드 — 강아지 기저귀를 찾는 사람은 배제되면 안 됨
  assert.equal(isAudienceMismatch('아몬스 강아지 기저귀 매너벨트', '강아지 기저귀'), false);
});

test('krwPrice: 달러딜을 원화 집계에서 배제한다 (로컬 렌더에서 발견)', () => {
  // 실측: "무선이어폰" 50건 중 13건이 $2.98·$10.60 같은 직구딜.
  // 섞으면 "최저 2.98원"이 렌더된다 — 실제로 그렇게 나왔다.
  assert.equal(krwPrice(deal('Toocki TWS 무선 이어폰($2.98/무료)', 2.98, 'USD')), null);
  assert.equal(krwPrice(deal('UGREEN 오픈형 클립 무선 이어폰', 10.6, 'USD')), null);
  // 원화는 통과 — 금액이 작아도 통화로만 판정한다
  assert.equal(krwPrice(deal('네이버페이 적립 10원', 10, 'KRW')), 10);
  assert.equal(krwPrice(deal('통화 미기재 딜', 15_990, null)), 15_990);
  // 가격 없음/0은 제외
  assert.equal(krwPrice(deal('가격 미확인', null)), null);
  assert.equal(krwPrice(deal('0원', 0)), null);
});

test('historyPrices: 같은 딜의 날짜별 캐리오버를 하나로 접는다 (운영 실측)', () => {
  // 실측 2026-08-07, product 27293619: 9점 중 6점이 같은 딜(16,909원)이
  // 2025-08-08~13 연속으로 실려 왔다. 중복을 넣으면 그 가격이 분포를 장악한다.
  const points = [
    point(13500961, 16_909),
    point(13513128, 16_909),
    point(13531343, 16_909),
    point(13544130, 16_909),
    point(15250442, 17_760),
    point(15267544, 17_760),
    point(27293619, 14_500, true), // seed = 지금 보고 있는 딜
  ];
  const prices = historyPrices(points);
  // 서로 다른 딜 6개(seed 제외). 같은 가격이어도 딜이 다르면 별개 표본이다.
  assert.equal(prices.length, 6);
  // seed 는 자기 위치를 재는 기준이라 분포에서 빠진다
  assert.equal(prices.includes(14_500), false);
});

test('historyPrices: 같은 dealId 가 여러 날 실려도 1회만 센다', () => {
  const prices = historyPrices([
    point(1, 5_000),
    point(1, 5_000),
    point(1, 5_000),
    point(2, 7_000),
  ]);
  assert.deepEqual(
    prices.sort((a, b) => a - b),
    [5_000, 7_000],
  );
});

test('positionFromHistory: 점이 부족하면 판정하지 않는다', () => {
  // 백엔드는 SIMILAR 를 2점부터 노출하지만, 2점 percentile 은 0 아니면 1이다.
  const thin = {
    points: [point(1, 10_000), point(2, 12_000)],
    currency: 'KRW',
    confidence: 'LOW' as const,
  };
  assert.equal(positionFromHistory(11_000, thin), null);
  assert.equal(positionFromHistory(11_000, null), null);
});

test('positionFromHistory: 원화가 아니면 판정하지 않는다', () => {
  const usd = {
    points: [point(1, 2.98), point(2, 3.5), point(3, 4.1), point(4, 5)],
    currency: 'USD',
    confidence: 'HIGH' as const,
  };
  assert.equal(positionFromHistory(3, usd), null);
});

test('positionFromHistory: confidence 를 그대로 실어 보낸다 — 카피가 여기서 갈린다', () => {
  const points = [point(1, 10_000), point(2, 12_000), point(3, 14_000), point(4, 16_000)];
  const low = positionFromHistory(10_000, { points, currency: 'KRW', confidence: 'LOW' });
  const high = positionFromHistory(10_000, { points, currency: 'KRW', confidence: 'HIGH' });

  // 실측 HIGH 는 0.7% — LOW 를 버리면 기능이 사실상 없어지므로 판정은 내되 세기를 남긴다
  assert.equal(low?.confidence, 'LOW');
  assert.equal(high?.confidence, 'HIGH');
  assert.equal(low?.verdict, 'cheap');
  assert.equal(low?.sampleSize, 4);
});

test('positionFromHistory: 캐리오버 중복이 판정을 왜곡하지 않는다', () => {
  // 같은 딜 16,909 가 4번 + 다른 딜 1개. 중복을 그대로 세면 표본 5개로 보이지만 실제 2개다.
  const dup = [
    point(1, 16_909),
    point(1, 16_909),
    point(1, 16_909),
    point(1, 16_909),
    point(2, 17_760),
  ];
  // 접으면 서로 다른 딜이 2개뿐 → MIN_POINTS_FOR_POSITION 미달로 판정 없음.
  // 접지 않았다면 5개로 통과해 "표본 5개" 라고 거짓말했을 것이다.
  assert.equal(
    positionFromHistory(14_500, { points: dup, currency: 'KRW', confidence: 'LOW' }),
    null,
  );
});

test('majorityCategory: 다수 카테고리를 찾고, 과반이 아니면 포기한다', () => {
  const 육아 = (t: string) => ({ ...deal(t), categoryName: '육아' });
  const 가전 = (t: string) => ({ ...deal(t), categoryName: '가전·가구' });

  // 실측 2026-08-08: "기저귀" 결과는 대부분 육아, 쓰레기통만 가전·가구였다
  assert.equal(majorityCategory([육아('a'), 육아('b'), 육아('c'), 가전('쓰레기통')]), '육아');
  // 과반이 없으면 카테고리로 거르지 않는다
  assert.equal(majorityCategory([육아('a'), 가전('b')]), null);
  assert.equal(majorityCategory([]), null);
});

test('positionFromHistory: 과거 가격이 전부 같으면 판정하지 않는다 (운영 실측)', () => {
  // 실측 2026-08-08 "생수": 대표 딜의 과거 4건이 전부 7,200원 → min=max.
  // percentile 은 정의상 0 이라 "역대 최저"로 렌더됐지만 값이 변한 적이 없어 근거가 0이다.
  const flat = [point(1, 7_200), point(2, 7_200), point(3, 7_200), point(4, 7_200)];
  assert.equal(
    positionFromHistory(7_200, { points: flat, currency: 'KRW', confidence: 'LOW' }),
    null,
  );

  // 폭이 있으면 정상 판정
  const spread = [point(1, 7_200), point(2, 7_500), point(3, 8_000), point(4, 8_400)];
  assert.ok(positionFromHistory(7_200, { points: spread, currency: 'KRW', confidence: 'LOW' }));
});

test('computePosition: percentile 은 0~1 을 벗어나지 않는다 (운영 실측 pct=1.33)', () => {
  // 실측 2026-08-08: 과거 4건이 전부 현재가보다 싸면 below=4/분모3 = 1.33 이 나왔다.
  // 막대 점이 트랙 밖으로 나가고 "하위 133%" 가 만들어진다.
  const above = computePosition(9_540, [8_400, 8_600, 8_900, 9_200]);
  assert.ok(above);
  assert.ok(above.percentile <= 1, `percentile ${above.percentile} > 1`);
  assert.equal(above.verdict, 'pricey');

  // 역대 최저가도 0 아래로 안 간다
  const below = computePosition(1_000, [8_400, 8_600, 8_900, 9_200]);
  assert.ok(below);
  assert.equal(below.percentile, 0);
  assert.equal(below.verdict, 'cheap');
});
