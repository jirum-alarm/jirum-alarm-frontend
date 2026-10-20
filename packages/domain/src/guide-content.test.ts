import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createRequire } from 'node:module';

import type { GuideSegment } from './guide-content';

const require = createRequire(import.meta.url);
const { parseGuideContent } = require('./guide-content.ts') as typeof import('./guide-content');

const links = (segs: GuideSegment[]) => segs.filter((s) => s.type === 'link');

test('글만 있으면 글 한 조각(공백 정리)', () => {
  assert.deepEqual(parseGuideContent('  토스페이  1.5% 할인\n적용 '), [
    { type: 'text', text: '토스페이 1.5% 할인 적용' },
  ]);
});

test('맨 주소는 링크로 살린다 — 라벨은 도메인, 끝 문장부호는 글자로', () => {
  const segs = parseGuideContent('쿠폰 받기: https://www.coupang.com/np/coupon?x=1. 이후 결제');
  assert.deepEqual(segs, [
    { type: 'text', text: '쿠폰 받기: ' },
    {
      type: 'link',
      href: 'https://www.coupang.com/np/coupon?x=1',
      label: 'coupang.com',
    },
    { type: 'text', text: '. 이후 결제' },
  ]);
});

test('괄호 안 주소 — 닫는 괄호는 주소가 아니다', () => {
  assert.deepEqual(parseGuideContent('쿠폰(https://a.com/c)'), [
    { type: 'text', text: '쿠폰(' },
    { type: 'link', href: 'https://a.com/c', label: 'a.com' },
    { type: 'text', text: ')' },
  ]);
});

test('마크다운 링크는 라벨 그대로', () => {
  assert.deepEqual(parseGuideContent('[10% 쿠폰](https://shop.example.com/c?id=3) 적용'), [
    {
      type: 'link',
      href: 'https://shop.example.com/c?id=3',
      label: '10% 쿠폰',
    },
    { type: 'text', text: ' 적용' },
  ]);
});

test('XSS — javascript:·data: 주소는 링크가 되지 않는다(마크다운이면 라벨만 남는다)', () => {
  assert.deepEqual(parseGuideContent('[눌러](javascript:alert(1))'), [
    { type: 'text', text: '눌러' },
  ]);
  assert.deepEqual(links(parseGuideContent('javascript:alert(document.cookie)')), []);
  assert.deepEqual(links(parseGuideContent('[x](data:text/html,<script>alert(1)</script>)')), []);
  // 따옴표·꺾쇠로 속성을 깨려는 주소 — 주소는 그 앞에서 끊긴다.
  const segs = parseGuideContent('https://a.com/"onmouseover="alert(1)');
  assert.deepEqual(links(segs), [{ type: 'link', href: 'https://a.com/', label: 'a.com' }]);
  for (const s of links(parseGuideContent('https://a.com/<script>'))) {
    assert.ok(!s.href.includes('<'));
  }
});

test('userinfo(@)로 호스트를 속이는 주소는 링크가 아니다', () => {
  assert.deepEqual(links(parseGuideContent('[쿠폰](https://coupang.com@evil.example/x)')), []);
});

test('주소만 있는 행도 비지 않는다(예전엔 다 지워져 행이 사라졌다)', () => {
  assert.deepEqual(parseGuideContent('https://link.coupang.com/a/abc'), [
    {
      type: 'link',
      href: 'https://link.coupang.com/a/abc',
      label: 'link.coupang.com',
    },
  ]);
});
