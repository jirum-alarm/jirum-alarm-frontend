import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { parseEntrance } = require('./entrance.ts') as typeof import('./entrance');

test('utm_source 를 입구로 읽는다', () => {
  assert.equal(parseEntrance('?utm_source=threads&utm_medium=post'), 'threads');
});

test('없거나 비면 null', () => {
  assert.equal(parseEntrance(''), null);
  assert.equal(parseEntrance('?utm_source='), null);
  assert.equal(parseEntrance('?utm_source=%20%3C%3E'), null);
});

test('캠페인 값에 못 넣는 글자는 빼고 소문자 20자까지', () => {
  assert.equal(parseEntrance('?utm_source=Kakao%20Notice!'), 'kakaonotice');
  assert.equal(parseEntrance(`?utm_source=${'a'.repeat(30)}`), 'a'.repeat(20));
  assert.equal(parseEntrance('?utm_source=x%26ct%3Devil'), 'xctevil');
});
