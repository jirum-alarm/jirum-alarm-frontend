import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { parseProductId } = require('./product-id.ts') as typeof import('./product-id');

describe('parseProductId', () => {
  it('정상 id 는 숫자로', () => {
    assert.equal(parseProductId('30484423'), 30484423);
    assert.equal(parseProductId(' 12 '), 12);
  });

  it('운영에서 500 을 내던 입력들 — 전부 null(→404)', () => {
    assert.equal(parseProductId('null'), null);
    assert.equal(parseProductId('undefined'), null);
    assert.equal(parseProductId('abc'), null);
    assert.equal(parseProductId(''), null);
    assert.equal(parseProductId(null), null);
  });

  it('숫자로 변환은 되지만 id 가 아닌 것도 막는다', () => {
    assert.equal(parseProductId('1e3'), null);
    assert.equal(parseProductId('0x1f'), null);
    assert.equal(parseProductId('12.5'), null);
    assert.equal(parseProductId('-5'), null);
    assert.equal(parseProductId('0'), null);
  });

  it('안전 정수 범위를 넘으면 null', () => {
    assert.equal(parseProductId('9'.repeat(20)), null);
  });
});
