import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildCaption, buildIntentUrl, buildShareMessage, buildShareUrl } =
  require('./share.ts') as typeof import('./share');

describe('buildShareUrl', () => {
  it('유입 utm 을 제거하고 채널 utm 으로 교체', () => {
    const out = buildShareUrl('https://a.com/p/1?utm_source=kakao&utm_medium=broadcast&id=9', 'x');
    const u = new URL(out);
    assert.equal(u.searchParams.get('utm_source'), 'share');
    assert.equal(u.searchParams.get('utm_medium'), 'x');
    assert.equal(u.searchParams.get('id'), '9', 'utm 아닌 쿼리는 보존');
  });

  it('native 채널만 native_share 로 표기', () => {
    assert.equal(
      new URL(buildShareUrl('https://a.com/p/1', 'native')).searchParams.get('utm_medium'),
      'native_share',
    );
    assert.equal(
      new URL(buildShareUrl('https://a.com/p/1', 'copy')).searchParams.get('utm_medium'),
      'copy',
    );
  });
});

describe('buildShareMessage', () => {
  it('설명이 있으면 제목·설명·링크 3줄', () => {
    assert.equal(
      buildShareMessage('에어팟 | 지름알림', 'https://a.com/1', '129,000원 · 쿠팡'),
      '에어팟 | 지름알림\n129,000원 · 쿠팡\nhttps://a.com/1',
    );
  });

  it('설명이 없으면 제목+링크', () => {
    assert.equal(buildShareMessage('t', 'https://a.com/1'), 't\nhttps://a.com/1');
  });

  it('링크는 항상 마지막 줄 — 카톡이 URL 을 미리보기로 잡게', () => {
    const msg = buildShareMessage('t', 'https://a.com/1', '9,900원');
    assert.equal(msg.split('\n').at(-1), 'https://a.com/1');
  });
});

describe('buildIntentUrl', () => {
  it('x 는 본문에 링크를 넣지 않는다 (url 파라미터와 중복 방지)', () => {
    const out = buildIntentUrl('x', buildCaption('에어팟', '129,000원'), 'https://a.com/1');
    const text = new URL(out).searchParams.get('text') ?? '';
    assert.ok(!text.includes('https://a.com/1'), 'text 에 url 이 없어야 함');
    assert.equal(new URL(out).searchParams.get('url'), 'https://a.com/1');
  });

  it('스레드는 url 파라미터가 없어 본문에 합친다', () => {
    const out = buildIntentUrl('threads', buildCaption('에어팟'), 'https://a.com/1');
    const text = new URL(out).searchParams.get('text') ?? '';
    assert.ok(text.includes('https://a.com/1'), 'text 에 url 이 포함돼야 함');
  });

  it('한글·특수문자를 인코딩한다', () => {
    const out = buildIntentUrl('x', '에어팟 & 가격', 'https://a.com/1?a=b&c=d');
    assert.ok(!out.includes('에어팟'), '한글은 percent-encoding 돼야 함');
    // url 파라미터의 & 가 쿼리 구분자로 새지 않아야 한다.
    assert.equal(new URL(out).searchParams.get('url'), 'https://a.com/1?a=b&c=d');
  });
});
