import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { createHangulFilter } = require('./hangul-search.ts') as typeof import('./hangul-search');

// /deals 운영 목록에서 뽑은 실제 이름(2026-10-15).
const NAMES = [
  '제주 삼다수',
  '신라면',
  '신라면 로제 큰사발면',
  '코카콜라 제로',
  '펩시콜라 제로슈거 라임향',
  '불닭볶음면',
  '까르보 불닭볶음면 큰컵',
  '맛밤',
  '유기농 맛밤',
  'VC12 PRO',
  '달걀',
];
const search = createHangulFilter(NAMES, (name) => name);

describe('createHangulFilter', () => {
  it('초성만 치면 초성으로 찾는다 (예전엔 0건)', () => {
    assert.deepEqual(search('ㅅㄹㅁ'), ['신라면', '신라면 로제 큰사발면']);
    assert.deepEqual(search('ㅂㄷㅂㅇㅁ'), ['불닭볶음면', '까르보 불닭볶음면 큰컵']);
    assert.deepEqual(search('ㅅㄷㅅ'), ['제주 삼다수']);
  });

  it('조합 중인 마지막 글자도 잇는다 — 신라며·맛바·코카코 (예전엔 0건)', () => {
    assert.deepEqual(search('신라며'), ['신라면', '신라면 로제 큰사발면']);
    assert.deepEqual(search('맛바'), ['맛밤', '유기농 맛밤']);
    assert.deepEqual(search('코카코'), ['코카콜라 제로']);
    // 받침이 다음 글자로 넘어가기 전 모양("삼닷" → 삼다수)
    assert.deepEqual(search('삼닷'), ['제주 삼다수']);
  });

  it('그대로 들어 있는 것이 자모로만 맞은 것보다 앞', () => {
    // "닭" 은 불닭볶음면에 그대로 있고, 달걀은 "닭" 을 치던 중(달+ㄱ)이라 뒤로.
    assert.deepEqual(search('닭'), ['불닭볶음면', '까르보 불닭볶음면 큰컵', '달걀']);
  });

  it('띄어쓰기·대소문자 무시, 영문·숫자는 그대로', () => {
    assert.deepEqual(search('vc12 pro'), ['VC12 PRO']);
    assert.deepEqual(search('삼다 수'), ['제주 삼다수']);
    assert.deepEqual(search('불닭볶음면큰컵'), ['까르보 불닭볶음면 큰컵']);
  });

  it('빈 입력·없는 말은 빈 목록', () => {
    assert.deepEqual(search(''), []);
    assert.deepEqual(search('   '), []);
    assert.deepEqual(search('아이폰'), []);
    assert.deepEqual(search('ㅇㅇㅍ'), []);
  });
});
