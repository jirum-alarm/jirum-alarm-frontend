import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const dayjs = require('dayjs') as typeof import('dayjs');

// date.ts는 dayjs 플러그인을 확장자 없이 import해서 bare node ESM으로는 로드가 안 된다(번들러 전용).
// 그래서 getDayBefore를 직접 호출하는 대신, 회귀를 잡아야 하는 지점 두 개를 나눠서 검증한다.
//   1) 소스가 실제로 startOf('day')를 쓰는지 (granularity 회귀 감지)
//   2) day 단위 정규화가 queryKey 안정성을 보장하는지 (그 정밀도가 왜 필요한지)
const source = readFileSync(new URL('./date.ts', import.meta.url), 'utf8');

test("getDayBefore는 startOf('day')로 정규화한다 — 분 단위면 queryKey가 매분 바뀐다", () => {
  const body = source.slice(source.indexOf('export const getDayBefore'));
  const impl = body.slice(0, body.indexOf('};'));

  assert.match(impl, /startOf\('day'\)/);
  assert.doesNotMatch(impl, /startOf\('(minute|second|hour)'\)/);
});

test("startOf('minute')은 분이 넘어가면 다른 queryKey가 된다 (회귀 시 재발하는 증상)", () => {
  const now = dayjs('2026-07-29T12:00:30.000Z');
  const fiveMinutesLater = now.add(5, 'minute');

  const minuteKeyA = now.add(-3, 'day').startOf('minute').toDate();
  const minuteKeyB = fiveMinutesLater.add(-3, 'day').startOf('minute').toDate();
  assert.notEqual(minuteKeyA.getTime(), minuteKeyB.getTime());

  const dayKeyA = now.add(-3, 'day').startOf('day').toDate();
  const dayKeyB = fiveMinutesLater.add(-3, 'day').startOf('day').toDate();
  assert.equal(dayKeyA.getTime(), dayKeyB.getTime());
});

test("startOf('day')는 같은 날 안에서 하루 종일 동일한 키를 유지한다", () => {
  // startOf('day')는 로컬 타임존 기준이라 앵커도 로컬 자정으로 잡아야 한다.
  // UTC 자정으로 잡으면 KST(+9)에서 하루를 넘어가 키가 2개로 갈린다.
  const base = dayjs('2026-07-29T00:00:01.000Z').startOf('day').add(1, 'second');

  const keys = [0, 1, 59, 60, 13 * 60, 23 * 60 + 59].map((minutes) =>
    base.add(minutes, 'minute').add(-3, 'day').startOf('day').toDate().getTime(),
  );

  assert.equal(new Set(keys).size, 1);
});
