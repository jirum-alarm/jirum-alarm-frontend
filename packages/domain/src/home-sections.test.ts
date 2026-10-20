import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildFallbackPromotionSections,
  findPromotionSectionById,
  mapHomePageSections,
} from './home-sections.ts';
import { stripPriceFromTitle, toTossDeal, tossSectionKeyword } from './toss.ts';

test('폴백 카탈로그: 탭 출처가 비면 키워드 탭, 있으면 서버 탭(커뮤니티는 스키마의 복수 providerIds)', () => {
  const empty = buildFallbackPromotionSections({ communityProviders: [], mallGroups: [] });
  const community = empty.find((s) => s.id === 'community');
  assert.ok(community && community.type === 'GRID_TABBED');
  assert.equal(community.dataSource.queryName, 'productsByKeyword');
  assert.deepEqual(
    community.tabs?.map((t) => t.id),
    ['ppomppu', 'eomisae', 'mamibebe'],
  );

  const full = buildFallbackPromotionSections({
    communityProviders: [{ id: '2', name: 'ppomppu', nameKr: '뽐뿌' }],
    mallGroups: [
      { id: 9, title: '나중', isActive: true, sort: 2 },
      { id: 8, title: '숨김', isActive: false, sort: 0 },
      { id: 7, title: '먼저', isActive: true, sort: 1 },
    ],
  });
  const c = full.find((s) => s.id === 'community');
  assert.ok(c && c.type === 'GRID_TABBED');
  assert.deepEqual(c.tabs?.[0].variables, { providerIds: [2] });
  const mall = full.find((s) => s.id === 'mall');
  assert.ok(mall && mall.type === 'GRID_TABBED');
  assert.deepEqual(
    mall.tabs?.map((t) => t.label),
    ['먼저', '나중'],
  );
});

test('id 찾기: GROUP 안쪽과 탭까지 — 탭이면 탭 변수를 섞은 GRID', () => {
  const sections = buildFallbackPromotionSections({ communityProviders: [], mallGroups: [] });
  assert.equal(findPromotionSectionById(sections, 'impending')?.type, 'DOUBLE_ROW');
  const tab = findPromotionSectionById(sections, 'coupang');
  assert.equal(tab?.type, 'GRID');
  assert.equal(tab?.dataSource.variables.keyword, '쿠팡');
  assert.equal(tab?.dataSource.variables.limit, 6);
  assert.equal(findPromotionSectionById(sections, 'toss'), undefined);
});

test('서버 응답 매핑: 모르는 모양·queryName 없는 칸은 버린다', () => {
  const mapped = mapHomePageSections([
    { id: 'a', title: 'A', type: 'GRID', dataSource: { type: 'GRAPHQL_QUERY', queryName: 'products' } },
    { id: 'b', title: 'B', type: 'BANNER', dataSource: { type: 'GRAPHQL_QUERY', queryName: 'products' } },
    { id: 'c', title: 'C', type: 'LIST' },
    { id: 't', title: '토스', type: 'TOSS' },
  ]);
  assert.deepEqual(
    mapped.map((s) => s.id),
    ['a', 't'],
  );
});

test('토스: 섹션 키워드·제목 가격 떼기·카드 변환', () => {
  assert.equal(tossSectionKeyword('daily'), '토스_하루특가');
  assert.equal(tossSectionKeyword('없는탭'), '토스');
  assert.equal(stripPriceFromTitle('원피스 23,800원'), '원피스');
  const deal = toTossDeal({
    id: '3',
    title: '왕교자 100g당 1,133원',
    price: '12,900원',
    data: { toss: { unitPrice: { unitName: 'g', unitAmount: 100, unitPrice: 1133 } } },
  });
  assert.equal(deal.price, 12900);
  assert.equal(deal.title, '왕교자');
  assert.equal(deal.unitPrice, '100g당 1,133원');
});
