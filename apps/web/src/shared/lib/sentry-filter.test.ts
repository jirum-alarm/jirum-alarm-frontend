import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import type { ErrorEvent, Event } from '@sentry/nextjs';

const require = createRequire(import.meta.url);
const { createBurstLimiter, createTransactionFilter } =
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

type SpanJSON = NonNullable<Event['spans']>[number];

const span = (
  span_id: string,
  parent_span_id: string,
  op: string,
  description: string,
  status = 'ok',
): SpanJSON => ({
  span_id,
  parent_span_id,
  op,
  description,
  status,
  trace_id: 't',
  start_timestamp: 0,
  data: {},
});

const serverTransaction = (spans: SpanJSON[], op = 'http.server'): Event =>
  transactionEvent({}, { contexts: { trace: { op, trace_id: 't', span_id: 'root' } }, spans });

test('서버 트랜잭션은 GraphQL 호출·Next 내부 단계 span 을 빼고 페이지 단위 단계만 남긴다', () => {
  const event = serverTransaction([
    span('render', 'root', 'default', 'render route (app) /products/[id]'),
    span('tree', 'render', 'default', 'build component tree'),
    span('page', 'tree', 'function.nextjs', 'resolve page server component "/products/[id]"'),
    span('layout', 'tree', 'function.nextjs', 'resolve layout server component "(detail)"'),
    span(
      'meta',
      'root',
      'default',
      'generateMetadata /(desktop-ready)/products/[id]/(detail)/page',
    ),
    span('load', 'root', 'default', 'load route module'),
    span('gql', 'page', 'http.client', 'POST http://backend/graphql'),
  ]);
  const result = dropUnneededTransaction(event);
  assert.deepEqual(
    result?.spans?.map((s) => [s.span_id, s.parent_span_id]),
    [
      ['render', 'root'],
      ['page', 'render'], // 잘린 build component tree 대신 남은 조상에 잇는다
      ['meta', 'root'],
    ],
  );
});

test('실패한 span 은 종류와 상관없이 남긴다', () => {
  const event = serverTransaction([
    span('gql', 'load', 'http.client', 'POST http://backend/graphql', 'internal_error'),
    span('load', 'root', 'default', 'load route module'),
  ]);
  assert.deepEqual(
    dropUnneededTransaction(event)?.spans?.map((s) => [s.span_id, s.parent_span_id]),
    [['gql', 'root']],
  );
});

test('브라우저 트랜잭션의 span 은 건드리지 않는다', () => {
  const spans = [span('res', 'root', 'resource.script', 'https://jirum-alarm.com/x.js')];
  const event = serverTransaction(spans, 'pageload');
  assert.equal(dropUnneededTransaction(event)?.spans?.length, 1);
});
