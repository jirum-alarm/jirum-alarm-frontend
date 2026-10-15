import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { formatDealCount, frequencyToShow, sheetStratumSuffix } =
  require('./first-visit-frequency.ts') as typeof import('./first-visit-frequency');

describe('frequencyToShow', () => {
  it('control·응답 없음은 띄우지 않는다', () => {
    assert.equal(frequencyToShow(null), null);
    assert.equal(frequencyToShow({ variant: 'control', dealCount: null, windowDays: 90 }), null);
  });

  it('frequency 군이라도 3번 미만이면 지금 문구', () => {
    assert.equal(frequencyToShow({ variant: 'frequency', dealCount: 2, windowDays: 90 }), null);
    assert.equal(frequencyToShow({ variant: 'frequency', dealCount: 3, windowDays: 90 }), 3);
  });
});

describe('formatDealCount', () => {
  it('100 이상은 「100번 넘게」', () => {
    assert.equal(formatDealCount(42), '42번');
    assert.equal(formatDealCount(100), '100번 넘게');
  });
});

describe('sheetStratumSuffix', () => {
  it('N≥3 이면 군에 따라 _freq·_n3, 그 밖은 빈 표시', () => {
    assert.equal(
      sheetStratumSuffix({ variant: 'frequency', dealCount: 5, windowDays: 90 }),
      '_freq',
    );
    assert.equal(sheetStratumSuffix({ variant: 'control', dealCount: 5, windowDays: 90 }), '_n3');
    assert.equal(sheetStratumSuffix({ variant: 'control', dealCount: 2, windowDays: 90 }), '');
    assert.equal(sheetStratumSuffix(null), '');
  });
});
