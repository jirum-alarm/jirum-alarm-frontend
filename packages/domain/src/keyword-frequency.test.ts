import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { broadenSuggestion, daysAgoText, describeKeywordFrequency } =
  require('./keyword-frequency.ts') as typeof import('./keyword-frequency');

const NOW = new Date('2026-10-19T03:00:00+09:00');

describe('daysAgoText', () => {
  it('KST 달력 날짜로 센다', () => {
    assert.equal(daysAgoText('2026-10-19T00:10:00+09:00', NOW), '오늘');
    assert.equal(daysAgoText('2026-10-18T23:50:00+09:00', NOW), '어제');
    assert.equal(daysAgoText('2026-10-15T12:00:00+09:00', NOW), '4일 전');
  });
});

describe('describeKeywordFrequency', () => {
  it('0번 · 드묾 · 보통을 가른다', () => {
    assert.deepEqual(describeKeywordFrequency({ dealCount: 0, windowDays: 90, lastDealAt: null }, NOW), {
      text: '최근 90일 동안 올라온 적이 없어요',
      sparse: true,
    });
    assert.deepEqual(
      describeKeywordFrequency({ dealCount: 2, windowDays: 90, lastDealAt: '2026-10-15T12:00:00+09:00' }, NOW),
      { text: '최근 90일 2번뿐이에요 · 마지막 4일 전', sparse: true },
    );
    assert.deepEqual(
      describeKeywordFrequency({ dealCount: 37, windowDays: 90, lastDealAt: '2026-10-18T23:50:00+09:00' }, NOW),
      { text: '최근 90일 37번 올라왔어요 · 마지막 어제', sparse: false },
    );
  });
});

describe('broadenSuggestion', () => {
  it('드문 키워드에 서버 제안이 있을 때만', () => {
    assert.deepEqual(
      broadenSuggestion({ dealCount: 0, suggestedKeyword: '소니', suggestedDealCount: 37 }),
      {
        keyword: '소니',
        text: '‘소니’로 받으면 같은 기간 37번이에요',
        button: '‘소니’도 받기',
        registerButton: '‘소니’로 등록',
      },
    );
    assert.equal(broadenSuggestion({ dealCount: 5, suggestedKeyword: '소니', suggestedDealCount: 37 }), null);
    assert.equal(broadenSuggestion({ dealCount: 0, suggestedKeyword: null, suggestedDealCount: null }), null);
  });
});
