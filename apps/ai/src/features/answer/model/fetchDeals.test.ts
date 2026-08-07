import assert from 'node:assert/strict';
import { test } from 'node:test';

/**
 * Docker ARG 에 기본값이 없으면 ENV 가 빈 문자열로 구워진다. `??` 는 빈 문자열을
 * 통과시켜 new URL('') → ERR_INVALID_URL 이 된다(운영 실측 2026-08-07).
 * 이 테스트는 fetchDeals 를 import 하지 않고 폴백 규칙 자체를 고정한다
 * (모듈 최상단에서 ENDPOINT 를 계산하므로 env 를 바꿔 재import 하기 어렵다).
 */
const resolve = (env: string | undefined) => env || 'https://jirum-alarm.com/api/graphql';

test('엔드포인트 폴백: 빈 문자열도 기본값으로 떨어져야 한다', () => {
  assert.equal(resolve(''), 'https://jirum-alarm.com/api/graphql');
  assert.equal(resolve(undefined), 'https://jirum-alarm.com/api/graphql');
  assert.equal(resolve('http://internal:3100/graphql'), 'http://internal:3100/graphql');
});

test('폴백 규칙은 ?? 가 아니라 || 여야 한다', () => {
  // ?? 는 빈 문자열을 통과시킨다(null/undefined 만 잡음) → new URL('') 이 던진다.
  // 실제 버그가 이것이었다: prod ENV 가 "" 로 구워져 ERR_INVALID_URL.
  const nullishFallback = (env: string | undefined) => env ?? 'https://fallback';
  assert.equal(nullishFallback(''), '', '?? 로 짜면 빈 문자열이 그대로 나온다');
  assert.throws(() => new URL(nullishFallback('')));

  // || 는 잡는다
  assert.doesNotThrow(() => new URL(resolve('')));
});
