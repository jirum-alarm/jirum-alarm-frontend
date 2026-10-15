import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { formatDealCount, frequencyToShow } =
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
