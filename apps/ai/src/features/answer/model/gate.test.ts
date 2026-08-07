import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  computePosition,
  gateAnswer,
  isAudienceMismatch,
  isBundle,
  isPolluted,
  krwPrice,
} from './gate.ts';

import type { Deal } from './types.ts';

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
