import assert from 'node:assert/strict';
import { createRequire, registerHooks } from 'node:module';
import { test } from 'node:test';

import type { PriceHistoryDeal, PriceHistoryPoint } from '@/shared/api/product/product.service';

// price-history.ts 가 './price-chart' 를 확장자 없이 부른다(번들러 해석). node 실행에선 .ts 를 붙여 찾는다.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.')) return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const require = createRequire(import.meta.url);
const {
  buildChartGeometry,
  computePeriodStates,
  formatRangeLabel,
  isPreviewLinkable,
  pickDefaultDays,
  resolveCurrentProductMarker,
  resolveSubtitle,
  won,
} = require('./price-history.ts') as typeof import('./price-history');

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 9, 19).getTime();

function ymd(ms: number): string {
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function deal(id: number, price: number, isSeed = false): PriceHistoryDeal {
  return {
    id,
    title: `딜 ${id}`,
    displayTitle: null,
    parsedPrice: price,
    price: null,
    priceCurrency: null,
    postedAt: '2026-10-01T00:00:00Z',
    thumbnail: null,
    providerId: 1,
    providerName: null,
    url: null,
    categoryId: null,
    isSeed,
  };
}

function point(daysAgo: number, price: number, id = daysAgo + 100): PriceHistoryPoint {
  const d = deal(id, price);
  return { date: ymd(NOW - daysAgo * DAY), price, deal: d, deals: [d] };
}

test('won — 원화는 «원», 달러는 «$»', () => {
  assert.equal(won(12345.6), '12,346원');
  assert.equal(won(12.4, 'USD'), '$12');
});

test('formatRangeLabel — 해를 넘기면 연도를 붙인다', () => {
  assert.equal(formatRangeLabel('2026-07-21', '2026-10-19'), '07.21 ~ 10.19');
  assert.equal(formatRangeLabel('2025-10-19', '2026-10-19'), '25.10.19 ~ 26.10.19');
});

test('resolveSubtitle — basis·confidence 별 문구', () => {
  assert.match(resolveSubtitle({ basis: 'SIMILAR', confidence: 'HIGH' }), /비슷한 상품/);
  assert.match(resolveSubtitle({ basis: 'SELF', confidence: 'LOW' }), /날짜별 가격/);
  assert.match(resolveSubtitle({ basis: 'MAPPING', confidence: 'HIGH' }), /같은 모델/);
  assert.match(resolveSubtitle({ basis: 'MAPPING', confidence: 'LOW' }), /같은 상품/);
});

test('resolveCurrentProductMarker — 점의 deals 안에 seed 가 있으면 그 실제가로 찍는다', () => {
  const cheaper = deal(1, 900);
  const seed = deal(42, 1000);
  const points: PriceHistoryPoint[] = [
    { date: '2026-10-10', price: 900, deal: cheaper, deals: [cheaper, seed] },
  ];
  const m = resolveCurrentProductMarker(points, 42, null);
  assert.equal(m?.date, '2026-10-10');
  assert.equal(m?.price, 1000);
  assert.equal(m?.deal.isSeed, true);
});

test('resolveCurrentProductMarker — 점에 없으면 게시일(KST)·현재가로 합성, 게시일 없으면 null', () => {
  const m = resolveCurrentProductMarker([], 42, 5000, '2026-10-01T16:00:00Z');
  assert.equal(m?.date, '2026-10-02');
  assert.equal(m?.price, 5000);
  assert.equal(resolveCurrentProductMarker([], 42, 5000, null), null);
  assert.equal(resolveCurrentProductMarker([], 42, null, '2026-10-01T00:00:00Z'), null);
});

test('computePeriodStates — 점 2개 미만·짧은 기간과 점이 같으면 비활성', () => {
  const states = computePeriodStates([point(10, 100), point(20, 110), point(200, 90)], NOW);
  const enabled = states.filter((s) => s.enabled).map((s) => s.days);
  // 1개월(2점) 활성, 3·6개월은 같은 점이라 비활성, 12개월에 200일 전 점이 더해져 활성.
  assert.deepEqual(enabled, [30, 365]);
});

test('pickDefaultDays — seed 나이를 덮는 가장 짧은 탭, 점이 적으면 더 긴 탭', () => {
  const points = [
    point(5, 100),
    point(10, 100),
    point(40, 100),
    point(50, 100),
    point(60, 100),
    point(70, 100),
  ];
  const states = computePeriodStates(points, NOW);
  // seed 가 오늘이면 1개월이 덮지만 점 2개라 5점 이상인 3개월로 확장.
  assert.equal(pickDefaultDays(states, NOW, NOW), 90);
  // 활성 탭이 없으면 기본 3개월.
  assert.equal(pickDefaultDays(computePeriodStates([], NOW), null, NOW), 90);
});

test('buildChartGeometry — 작은 변동은 축을 15% 이상 벌리고, 하한은 0 밑으로 안 내려간다', () => {
  const pad = { top: 40, right: 24, bottom: 28, left: 44 };
  const flat = buildChartGeometry(
    [point(10, 9600), point(5, 9800)],
    400,
    200,
    pad,
    NOW - 30 * DAY,
    NOW,
    NOW - 30 * DAY,
    NOW,
  );
  assert.ok(flat.ticks.length > 0);
  assert.equal(flat.xLabels[flat.xLabels.length - 1].label, '오늘');
  // 2% 변동인데 두 점의 높이 차는 그리는 높이의 절반을 넘지 않는다.
  assert.ok(Math.abs(flat.coords[0].y - flat.coords[1].y) < (200 - 40 - 28) / 2);
  // 시간순 정렬
  assert.ok(flat.coords[0].x < flat.coords[1].x);

  const wide = buildChartGeometry(
    [point(10, 3000), point(5, 32960)],
    400,
    200,
    pad,
    NOW - 30 * DAY,
    NOW,
    NOW - 30 * DAY,
    NOW,
  );
  assert.ok(wide.ticks.every((t) => t.price >= 0));
});

test('미리보기 카드 — 「이 상품」·지금 보는 딜은 링크가 아니다(눌러도 같은 페이지), 다른 딜만 링크', () => {
  assert.equal(isPreviewLinkable(true, deal(7, 1000), 7), false);
  assert.equal(
    isPreviewLinkable(false, deal(7, 1000), 7),
    false,
    '점을 골랐어도 그 딜이 지금 상품이면',
  );
  assert.equal(isPreviewLinkable(false, deal(8, 1000, true), 7), false, 'seed 표시가 붙은 딜');
  assert.equal(isPreviewLinkable(false, deal(8, 1000), 7), true);
});
