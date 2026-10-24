import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it, test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  nextTrendingView,
  orderTrendingCategories,
  rankingWindowDays,
  SPARSE_RANKING_CATEGORY_IDS,
  TRENDING_VIEW_TABS,
  trendingTabView,
} =
  require('./ranking.ts') as typeof import('./ranking');

test('딜이 드문 카테고리는 60일, 그 밖·전체는 3일', () => {
  for (const id of SPARSE_RANKING_CATEGORY_IDS) assert.equal(rankingWindowDays(id), 60);
  assert.equal(rankingWindowDays(null), 3);
  assert.equal(rankingWindowDays(1), 3);
});

const ids = (list: { id: number }[]): number[] => list.map((c) => c.id);

describe('orderTrendingCategories — 발견 탭 카테고리 순서(web·앱)', () => {
  it('서버 id 순서를 탭 순서로 바꾸고 기타는 끝에 둔다', () => {
    const server: { id: number }[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => ({ id }));
    assert.deepEqual(ids(orderTrendingCategories(server)), [1, 9, 2, 4, 6, 3, 10, 8, 7, 5, 11]);
  });

  it('관심 카테고리만 오면 그 안에서 같은 순서', () => {
    const server: { id: number }[] = [{ id: 3 }, { id: 9 }, { id: 11 }, { id: 10 }];
    assert.deepEqual(ids(orderTrendingCategories(server)), [9, 3, 10, 11]);
  });

  it('모르는 새 카테고리는 아는 것 뒤·기타 앞', () => {
    const server: { id: number }[] = [{ id: 11 }, { id: 12 }, { id: 5 }];
    assert.deepEqual(ids(orderTrendingCategories(server)), [5, 12, 11]);
  });
});

describe('발견 탭 「실시간 · 랭킹」 — 전부·핫딜만은 같은 「실시간」 탭', () => {
  it('탭은 둘, 「실시간」은 핫딜만(hot)으로 연다', () => {
    assert.deepEqual(
      TRENDING_VIEW_TABS.map((t) => [t.view, t.label]),
      [
        ['hot', '실시간'],
        ['ranking', '랭킹'],
      ],
    );
  });

  it('전부(live)·핫딜만(hot)은 「실시간」 소속, 랭킹은 랭킹', () => {
    assert.equal(trendingTabView('live'), 'hot');
    assert.equal(trendingTabView('hot'), 'hot');
    assert.equal(trendingTabView('ranking'), 'ranking');
  });

  it('하단 「발견」: 랭킹이면 실시간(핫딜만), 그 밖이면 랭킹', () => {
    assert.equal(nextTrendingView('ranking'), 'hot');
    assert.equal(nextTrendingView('hot'), 'ranking');
    assert.equal(nextTrendingView('live'), 'ranking');
    assert.equal(nextTrendingView(null), 'ranking');
  });
});
