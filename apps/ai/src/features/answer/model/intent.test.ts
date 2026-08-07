import assert from 'node:assert/strict';
import { test } from 'node:test';

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
