import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { escapeRegExp } = require('./escapeRegExp.ts') as typeof import('./escapeRegExp');

// 운영 알림 키워드 "1++"가 new RegExp("(1++)") 로 들어가 SyntaxError → 알림 페이지 흰화면이었다.
// escapeRegExp 를 거친 키워드는 어떤 메타문자가 와도 RegExp 생성에서 throw 하면 안 된다.
test('escapeRegExp: 정규식 메타문자 키워드로 RegExp 가 throw 하지 않는다', () => {
  for (const kw of ['1++', 'C++', 'a*b', '(test)', '[x]', 'a|b', '???', '^$', 'a.b\\c']) {
    assert.doesNotThrow(() => new RegExp(`(${escapeRegExp(kw)})`, 'g'), `keyword=${kw}`);
  }
});

test('escapeRegExp: 이스케이프된 패턴이 원본 텍스트를 그대로 매칭한다', () => {
  const parts = '1++ 특가'.split(new RegExp(`(${escapeRegExp('1++')})`, 'g'));
  assert.ok(parts.includes('1++'));
});
