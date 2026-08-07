import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildFollowUps } from './followUp.ts';

test('상품 토큰이 없으면 제안하지 않는다', () => {
  assert.deepEqual(buildFollowUps({ term: '', hasReview: false, hasPosition: false }), []);
  assert.deepEqual(buildFollowUps({ term: '   ', hasReview: false, hasPosition: false }), []);
});

test('이미 보여준 블록은 다시 제안하지 않는다', () => {
  const both = buildFollowUps({ term: '생수', hasReview: true, hasPosition: true });
  assert.ok(!both.some((s) => s.includes('후기')));
  assert.ok(!both.some((s) => s.includes('요즘 얼마')));
  // 최저가는 게이트와 무관하게 항상 답할 수 있으므로 남는다
  assert.deepEqual(both, ['생수 최저가']);
});

test('근거가 없을 때는 시세를 다시 물어보게 제안한다', () => {
  const none = buildFollowUps({ term: '콜라', hasReview: false, hasPosition: false });
  assert.ok(none.includes('콜라 요즘 얼마'));
  assert.ok(none.includes('콜라 후기 어때'));
});

test('3개를 넘지 않고 중복이 없다', () => {
  const s = buildFollowUps({ term: '기저귀', hasReview: false, hasPosition: false });
  assert.ok(s.length <= 3, `${s.length}개`);
  assert.equal(new Set(s).size, s.length);
});

test('비싸다고 판정했으면 "싼 거"를 맨 앞에 제안한다', () => {
  const s = buildFollowUps({
    term: '생수',
    hasReview: true,
    hasPosition: true,
    verdict: 'pricey',
  });
  assert.equal(s[0], '생수 싼 거 추천');
});

test('싸다·보통 판정에는 "싼 거" 제안을 넣지 않는다', () => {
  for (const v of ['cheap', 'normal'] as const) {
    const s = buildFollowUps({ term: '콜라', hasReview: true, hasPosition: true, verdict: v });
    assert.ok(!s.some((x) => x.includes('싼 거')), `${v}: ${s.join(',')}`);
  }
});

test('제안은 원문이 아니라 상품 토큰에 붙는다', () => {
  // 원문을 그대로 쓰면 "생수 지금 사도 돼? 최저가" 같은 말이 된다
  const s = buildFollowUps({ term: '생수', hasReview: true, hasPosition: true });
  assert.deepEqual(s, ['생수 최저가']);
  assert.ok(!s[0].includes('?'));
});
