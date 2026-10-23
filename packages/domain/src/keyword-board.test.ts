import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  describeKeywordActivity,
  isGoodDeal,
  keywordBoardSummaryLine,
  sortKeywordBoard,
  summarizeKeywordBoard,
} = require('./keyword-board.ts') as typeof import('./keyword-board');
const { relativeTimeLabel } = require('./relative-time.ts') as typeof import('./relative-time');

type Entry = import('./keyword-board').KeywordBoardEntry;

const NOW = Date.parse('2026-10-23T12:00:00+09:00');
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(NOW - ms).toISOString();

const entry = (over: Partial<Entry> & { keyword: string }): Entry => ({
  dealCount: 0,
  windowDays: 90,
  lastDealAt: null,
  weekDealCount: 0,
  recentDeals: [],
  ...over,
});

/** 화면이 하는 그대로 — 마지막 딜 라벨은 relative-time 으로 만들어 넘긴다. */
const activity = (e: Pick<Entry, 'dealCount' | 'windowDays' | 'lastDealAt' | 'weekDealCount'>) =>
  describeKeywordActivity(e, relativeTimeLabel(e.lastDealAt as string | null, NOW), NOW);

describe('describeKeywordActivity', () => {
  it('하루 안에 올라왔으면 today — 「오늘 올라왔어요 · 이번 주 N건」', () => {
    assert.deepEqual(
      activity({ dealCount: 12, windowDays: 90, lastDealAt: ago(3 * HOUR), weekDealCount: 4 }),
      { tone: 'today', text: '오늘 올라왔어요 · 이번 주 4건' },
    );
  });

  it('이번 주 안이면 week — 마지막이 며칠 전인지 같이', () => {
    assert.deepEqual(
      activity({ dealCount: 12, windowDays: 90, lastDealAt: ago(2 * DAY), weekDealCount: 2 }),
      { tone: 'week', text: '이번 주 2건 · 마지막 2일 전' },
    );
  });

  it('이번 주엔 없었지만 90일 안엔 있었으면 quiet', () => {
    assert.deepEqual(
      activity({ dealCount: 5, windowDays: 90, lastDealAt: ago(20 * DAY), weekDealCount: 0 }),
      { tone: 'quiet', text: '이번 주엔 없었어요 · 최근 90일 5번 · 마지막 20일 전' },
    );
  });

  it('90일 동안 0건이면 none — 화면이 넓혀 받기를 붙이는 자리', () => {
    assert.deepEqual(activity({ dealCount: 0, windowDays: 90, lastDealAt: null, weekDealCount: 0 }), {
      tone: 'none',
      text: '최근 90일 동안 올라온 적이 없어요',
    });
  });
});

describe('isGoodDeal', () => {
  it('1년 최저가거나 기준가 대비 할인이 있는 진행 중 딜만', () => {
    assert.equal(isGoodDeal({ id: 1, isYearLowest: true }), true);
    assert.equal(isGoodDeal({ id: 2, priceSaving: { basis: 'USUAL', percent: 12 } }), true);
    assert.equal(isGoodDeal({ id: 3, priceSaving: { basis: 'USUAL', percent: 0 } }), false);
    assert.equal(isGoodDeal({ id: 4, isYearLowest: true, isEnd: true }), false);
    assert.equal(isGoodDeal({ id: 5 }), false);
  });
});

describe('sortKeywordBoard', () => {
  it('마지막 딜이 최근인 키워드부터, 없던 키워드는 맨 뒤(등록 순 유지)', () => {
    const sorted = sortKeywordBoard([
      entry({ keyword: 'a', lastDealAt: null }),
      entry({ keyword: 'b', lastDealAt: ago(5 * DAY) }),
      entry({ keyword: 'c', lastDealAt: null }),
      entry({ keyword: 'd', lastDealAt: ago(HOUR) }),
    ]);
    assert.deepEqual(
      sorted.map((e) => e.keyword),
      ['d', 'b', 'a', 'c'],
    );
  });
});

describe('summarizeKeywordBoard · keywordBoardSummaryLine', () => {
  it('이번 주 건수는 키워드별 합, 좋은 딜은 같은 딜을 한 번만', () => {
    const summary = summarizeKeywordBoard([
      entry({
        keyword: '삼다수',
        weekDealCount: 3,
        recentDeals: [
          { id: 10, isYearLowest: true },
          { id: 11, priceSaving: { basis: 'COUPANG', percent: 8 } },
        ],
      }),
      entry({ keyword: '생수', weekDealCount: 2, recentDeals: [{ id: 10, isYearLowest: true }] }),
      entry({ keyword: '에어팟', weekDealCount: 0 }),
    ]);
    assert.deepEqual(summary, {
      keywordCount: 3,
      weekDealCount: 5,
      goodDealCount: 2,
      activeKeywordCount: 2,
    });
    assert.deepEqual(keywordBoardSummaryLine(summary), {
      emphasis: '지금 사기 좋은 딜 2건',
      text: '이번 주 5건 올라왔어요',
    });
  });

  it('좋은 딜이 없으면 건수부터, 아무것도 없으면 지켜보는 중', () => {
    assert.deepEqual(
      keywordBoardSummaryLine({ keywordCount: 2, weekDealCount: 4, goodDealCount: 0, activeKeywordCount: 1 }),
      { emphasis: null, text: '이번 주 키워드 1개에서 4건 올라왔어요' },
    );
    assert.deepEqual(
      keywordBoardSummaryLine({ keywordCount: 2, weekDealCount: 0, goodDealCount: 0, activeKeywordCount: 0 }),
      { emphasis: null, text: '이번 주엔 조용했어요 · 키워드 2개를 지켜보고 있어요' },
    );
  });
});
