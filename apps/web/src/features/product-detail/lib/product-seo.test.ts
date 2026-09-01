import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  MISSING_PRODUCT_METADATA,
  META_DESCRIPTION_MAX,
  parseNumericPrice,
  summarizePriceHistoryForSeo,
  formatPriceHistorySeoText,
  clipMetaDescription,
  buildProductSeoTitle,
  generateDescription,
  buildRssItemDescription,
} = require('./product-seo.ts') as typeof import('./product-seo');

describe('parseNumericPrice', () => {
  it('쉼표·원 문자를 떼고 숫자만 남긴다', () => {
    assert.equal(parseNumericPrice('89,000원'), 89000);
  });

  it('빈 값·숫자 없음은 null', () => {
    assert.equal(parseNumericPrice(null), null);
    assert.equal(parseNumericPrice('무료'), null);
  });
});

describe('summarizePriceHistoryForSeo / formatPriceHistorySeoText', () => {
  it('점 2개 미만이면 요약을 안 만든다', () => {
    assert.equal(
      summarizePriceHistoryForSeo({
        points: [{ price: 1000 }],
        rangeDays: 90,
        confidence: 'HIGH',
      }),
      null,
    );
  });

  it('HIGH 신뢰도는 최저·최고를 문장으로 쓴다', () => {
    const summary = summarizePriceHistoryForSeo({
      points: [{ price: 89000 }, { price: 129000 }, { price: 99000 }],
      rangeDays: 90,
      confidence: 'HIGH',
    });
    assert.ok(summary);
    assert.equal(summary.minPrice, 89000);
    assert.equal(summary.maxPrice, 129000);
    assert.match(
      formatPriceHistorySeoText(summary),
      /최근 3개월 핫딜 최저가 89,000원 · 최고가 129,000원/,
    );
  });

  it('LOW 신뢰도는 유사 핫딜가로 완곡 표기한다', () => {
    const summary = summarizePriceHistoryForSeo({
      points: [{ price: 10000 }, { price: 20000 }],
      rangeDays: 30,
      confidence: 'LOW',
    });
    assert.ok(summary);
    assert.match(formatPriceHistorySeoText(summary), /유사 핫딜가/);
  });
});

describe('buildProductSeoTitle', () => {
  it('기본은 상품명 | 지름알림', () => {
    assert.equal(buildProductSeoTitle('에어팟 프로'), '에어팟 프로 | 지름알림');
  });

  it('종료 상품은 판매종료를 붙인다', () => {
    assert.equal(buildProductSeoTitle('에어팟 프로', true), '에어팟 프로 (판매종료) | 지름알림');
  });

  it('제목에 이미 판매종료가 있으면 중복하지 않는다', () => {
    assert.equal(
      buildProductSeoTitle('에어팟 프로 판매종료', true),
      '에어팟 프로 판매종료 | 지름알림',
    );
  });

  it('가격이 있고 제목이 그냥 상품명이면 최저가 핫딜을 붙인다', () => {
    assert.equal(
      buildProductSeoTitle('기가바이트 B650M K 메인보드', false, 89000),
      '기가바이트 B650M K 메인보드 최저가 89,000원 핫딜 | 지름알림',
    );
  });

  it('제목에 이미 가격이 있으면 붙이지 않는다', () => {
    assert.equal(
      buildProductSeoTitle('메가커피 더블따아세트 (2,550원/무료)', false, 2550),
      '메가커피 더블따아세트 (2,550원/무료) | 지름알림',
    );
  });

  it('제목에 이미 의도어가 있으면 붙이지 않는다', () => {
    assert.equal(
      buildProductSeoTitle('경주월드 연간회원권 초핫딜', false, 65400),
      '경주월드 연간회원권 초핫딜 | 지름알림',
    );
  });

  it('종료 상품에는 붙이지 않는다', () => {
    assert.equal(
      buildProductSeoTitle('기가바이트 B650M K 메인보드', true, 89000),
      '기가바이트 B650M K 메인보드 (판매종료) | 지름알림',
    );
  });

  it('가격이 없으면(토스 유입 등) 기존과 동일하다', () => {
    assert.equal(buildProductSeoTitle('에어팟 프로', false, null), '에어팟 프로 | 지름알림');
    assert.equal(buildProductSeoTitle('에어팟 프로', false, 0), '에어팟 프로 | 지름알림');
  });
});

describe('generateDescription', () => {
  const product = {
    title: '에어팟 프로 2',
    price: '89000',
    mallName: '쿠팡',
    categoryName: '디지털',
  };

  it('댓글 요약을 맨 앞에 둔다', () => {
    const desc = generateDescription(null, product, '디지털', null, '카드 할인이 핵심이다');
    assert.match(desc, /^카드 할인이 핵심이다 \|/);
    assert.match(desc, /현재가 89,000원/);
    assert.match(desc, /구매처: 쿠팡/);
  });

  it('가이드가 있으면 키-값으로 붙이고 추이 문장을 뒤에 둔다', () => {
    const history = summarizePriceHistoryForSeo({
      points: [{ price: 80000 }, { price: 120000 }],
      rangeDays: 90,
      confidence: 'HIGH',
    });
    const desc = generateDescription(
      { productGuides: [{ title: '배송', content: '무료배송' }] },
      product,
      '디지털',
      history,
      null,
    );
    assert.match(desc, /쇼핑몰: 쿠팡/);
    assert.match(desc, /배송: 무료배송/);
    assert.match(desc, /최근 3개월 핫딜 최저가/);
  });
});

describe('clipMetaDescription', () => {
  it('제한 길이를 넘으면 말줄임한다', () => {
    const long = '가'.repeat(META_DESCRIPTION_MAX + 40);
    const clipped = clipMetaDescription(long);
    assert.equal(clipped.length, META_DESCRIPTION_MAX);
    assert.equal(clipped.endsWith('…'), true);
  });
});

describe('MISSING_PRODUCT_METADATA', () => {
  it('홈 타이틀을 쓰지 않고 noindex 한다', () => {
    assert.equal(MISSING_PRODUCT_METADATA.title, '상품을 찾을 수 없습니다 | 지름알림');
    assert.notEqual(MISSING_PRODUCT_METADATA.title.includes('실시간 초특가'), true);
    assert.equal(MISSING_PRODUCT_METADATA.robots.index, false);
  });
});

describe('buildRssItemDescription', () => {
  it('RSS description 에 가격·구매처를 넣는다', () => {
    const desc = buildRssItemDescription({
      title: '에어팟 프로',
      price: '89,000원',
      category: '디지털',
      mallName: '쿠팡',
    });
    assert.match(desc, /디지털 핫딜/);
    assert.match(desc, /현재가 89,000원/);
    assert.match(desc, /구매처 쿠팡/);
    assert.match(desc, /지름알림/);
  });
});
