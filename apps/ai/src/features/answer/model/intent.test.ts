import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isPolluted } from './gate.ts';
import { extractProductTerm } from './intent.ts';

test('extractProductTerm: 예시 뱃지 5개에서 상품 토큰을 뽑는다', () => {
  // 실측 버그: 이 문장들이 게이트를 무효화했다
  assert.equal(extractProductTerm('콜라 요즘 얼마'), '콜라');
  assert.equal(extractProductTerm('라면 시세'), '라면');
  assert.equal(extractProductTerm('기저귀 최저가'), '기저귀');
  assert.equal(extractProductTerm('무선이어폰'), '무선이어폰');
  assert.equal(extractProductTerm('생수'), '생수');
});

test('extractProductTerm: 조사를 떼어낸다', () => {
  assert.equal(extractProductTerm('콜라는 지금 얼마야'), '콜라');
  assert.equal(extractProductTerm('노트북이 싼가'), '노트북');
  assert.equal(extractProductTerm('기저귀가 얼마야'), '기저귀');
});

test('extractProductTerm: 가격 표현은 상품명이 아니다', () => {
  assert.equal(extractProductTerm('10만원 이하 무선이어폰'), '무선이어폰');
  assert.equal(extractProductTerm('무선이어폰 5만원 이하'), '무선이어폰');
});

test('extractProductTerm: 여러 단어 상품명은 보존한다', () => {
  assert.equal(extractProductTerm('갤럭시 버즈 시세'), '갤럭시 버즈');
  assert.equal(extractProductTerm('코카콜라 제로 얼마'), '코카콜라 제로');
});

test('extractProductTerm: 의도어만 있으면 원문을 유지한다 (게이트 무효화 방지)', () => {
  // 상품 토큰이 하나도 없으면 원문 반환 — 빈 문자열로 검색하는 것보다 낫다
  assert.equal(extractProductTerm('최저가 추천'), '최저가 추천');
  assert.equal(extractProductTerm('얼마'), '얼마');
});

test('extractProductTerm: 물음표·구두점을 지운다', () => {
  assert.equal(extractProductTerm('콜라 얼마?'), '콜라');
  assert.equal(extractProductTerm('라면, 시세!'), '라면');
});

/**
 * ★되묻기(follow-up)가 만든 문장이 **자기 게이트를 끄는** 경로 방지.
 *
 * 실측 2026-08-08(멀티턴 검증): "콜라 후기 어때" → term "콜라 후기" 가 되어
 * 어떤 제목에도 그 문자열이 없으니 isPolluted 가 조용히 무효화됐다.
 * buildFollowUps 가 그 문장을 직접 만들므로 앱이 스스로 만든 구멍이었다.
 */
test('되묻기 제안이 오염 게이트를 무효화하지 않는다', () => {
  const probe = '저분자 콜라겐 펩타이드 300g';
  for (const q of [
    '콜라 요즘 얼마',
    '콜라 최저가',
    '콜라 후기 어때',
    '콜라 리뷰 어때',
    '콜라 싼 거 추천',
    '콜라 살까',
  ]) {
    const term = extractProductTerm(q);
    assert.equal(term, '콜라', `${q} → "${term}"`);
    assert.equal(isPolluted(probe, term), true, `${q}: 게이트 무효화`);
  }
});

test('의도어 제거가 상품명을 깎지 않는다', () => {
  assert.equal(extractProductTerm('기저귀 후기 어때'), '기저귀');
  assert.equal(extractProductTerm('코카콜라 제로 얼마'), '코카콜라 제로');
  assert.equal(extractProductTerm('무선이어폰 최저가'), '무선이어폰');
});
