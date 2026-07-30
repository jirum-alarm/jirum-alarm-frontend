import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { deriveKeyword } = require('./deriveKeyword.ts') as typeof import('./deriveKeyword');

// 구매 클릭 직후 배너가 이 키워드로 알림을 등록한다. 키워드가 길면 매칭되는 신규 딜이
// 없어져 알림이 영영 안 오고, 빈 문자열이면 배너 자체가 안 뜬다(둘 다 조용한 실패).
describe('deriveKeyword', () => {
  it('말머리 대괄호를 떼어낸다', () => {
    assert.equal(deriveKeyword('[지마켓] 다이슨 V15 무선청소기'), '다이슨 V15');
  });

  it('괄호 뒷단(가격·배송 정보)을 버린다', () => {
    assert.equal(deriveKeyword('삼성 오디세이 (399,000원/무배)'), '삼성 오디세이');
  });

  it('세 단어 이상이면 앞 두 단어만 남긴다', () => {
    assert.equal(deriveKeyword('LG 그램 17인치 2026년형 노트북'), 'LG 그램');
  });

  it('두 단어 이하면 그대로 쓴다', () => {
    assert.equal(deriveKeyword('에어팟프로'), '에어팟프로');
    assert.equal(deriveKeyword('나이키 덩크'), '나이키 덩크');
  });

  it('연속 공백을 하나로 접는다', () => {
    assert.equal(deriveKeyword('[쿠팡]   로지텍   MX  마스터'), '로지텍 MX');
  });

  it('20자를 넘지 않는다', () => {
    assert.ok(deriveKeyword('아주기다란브랜드이름하나 아주기다란모델명둘').length <= 20);
  });

  it('말머리만 있는 제목은 빈 문자열 — 배너가 안 뜬다', () => {
    assert.equal(deriveKeyword('[품절]'), '');
  });
});
