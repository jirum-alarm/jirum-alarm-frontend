import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import type { ErrorEvent, Event } from '@sentry/nextjs';

const require = createRequire(import.meta.url);
const { createBurstLimiter, createClientErrorFilter, createTransactionFilter } =
  require('./sentry-filter.ts') as typeof import('./sentry-filter');
const { isCrawlerUA } = require('../config/user-agent.ts') as typeof import('../config/user-agent');
const dropUnneededTransaction = createTransactionFilter(isCrawlerUA);

const errorEvent = (value: string): ErrorEvent =>
  ({ type: undefined, exception: { values: [{ type: 'FetchError', value }] } }) as ErrorEvent;

test('같은 에러는 10분 안에 3건까지만 통과한다', () => {
  const t = 0;
  const limit = createBurstLimiter(() => t);
  const results = Array.from({ length: 5 }, () => limit(errorEvent('ECONNREFUSED')));
  assert.equal(results.filter(Boolean).length, 3);
});

test('다른 에러는 따로 센다', () => {
  const limit = createBurstLimiter(() => 0);
  for (let i = 0; i < 3; i += 1) limit(errorEvent('a'));
  assert.ok(limit(errorEvent('b')));
});

test('10분이 지나면 다시 보낸다', () => {
  let t = 0;
  const limit = createBurstLimiter(() => t);
  for (let i = 0; i < 4; i += 1) limit(errorEvent('a'));
  assert.equal(limit(errorEvent('a')), null);
  t = 10 * 60 * 1000 + 1;
  assert.ok(limit(errorEvent('a')));
});

test('브라우저 필터 — 헤드리스·크롤러 UA 의 에러는 버리고, 사람 UA 는 폭주 제한만 거친다', () => {
  // Node 의 globalThis.navigator 는 getter 뿐이라 defineProperty 로 바꿔 끼운다.
  const prev = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const setUA = (userAgent: string) =>
    Object.defineProperty(globalThis, 'navigator', { value: { userAgent }, configurable: true });
  try {
    setUA('Mozilla/5.0 (Macintosh) AppleWebKit/537.36 HeadlessChrome/145.0 Safari/537.36');
    assert.equal(createClientErrorFilter(isCrawlerUA)(errorEvent('reading call')), null);
    setUA('Mozilla/5.0 (iPhone) Safari/604.1');
    const filter = createClientErrorFilter(isCrawlerUA);
    assert.ok(filter(errorEvent('a')));
    for (let i = 0; i < 3; i += 1) filter(errorEvent('a'));
    assert.equal(filter(errorEvent('a')), null);
  } finally {
    if (prev) Object.defineProperty(globalThis, 'navigator', prev);
  }
});

const transactionEvent = (headers?: Record<string, string>, extra: Partial<Event> = {}): Event =>
  ({
    type: 'transaction',
    transaction: 'GET /products/[id]',
    request: headers ? { headers } : undefined,
    ...extra,
  }) as Event;

test('크롤러 요청의 트랜잭션은 버린다(서버 소문자 헤더·브라우저 대문자 헤더)', () => {
  const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  assert.equal(dropUnneededTransaction(transactionEvent({ 'user-agent': googlebot })), null);
  assert.equal(
    dropUnneededTransaction(
      transactionEvent({ 'User-Agent': 'Mozilla/5.0 (compatible; Yeti/1.1)' }),
    ),
    null,
  );
});

test('사람·앱 웹뷰 트랜잭션은 그대로 보낸다', () => {
  const human = transactionEvent({
    'user-agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 KAKAOTALK',
  });
  assert.equal(dropUnneededTransaction(human), human);
  const noHeaders = transactionEvent();
  assert.equal(dropUnneededTransaction(noHeaders), noHeaders);
});

test('요청 헤더가 sdkProcessingMetadata 에만 있어도 크롤러를 거른다', () => {
  const event = transactionEvent(undefined, {
    sdkProcessingMetadata: {
      normalizedRequest: { headers: { 'user-agent': 'Mozilla/5.0 (compatible; bingbot/2.0)' } },
    },
  });
  assert.equal(dropUnneededTransaction(event), null);
});

test('이미지 최적화·미들웨어 트랜잭션은 버린다', () => {
  assert.equal(
    dropUnneededTransaction(transactionEvent({}, { transaction: 'GET /_next/image' })),
    null,
  );
  const middleware = transactionEvent(
    {},
    {
      transaction: 'middleware GET',
      contexts: { trace: { op: 'http.server.middleware', trace_id: 't', span_id: 's' } },
    },
  );
  assert.equal(dropUnneededTransaction(middleware), null);
});
