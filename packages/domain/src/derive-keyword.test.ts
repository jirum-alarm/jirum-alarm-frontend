import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { deriveKeyword } = require('./derive-keyword.ts') as typeof import('./derive-keyword');

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

// 특수문자: 구분자는 지우고 토큰 내부는 남긴다. 운영 키워드 1,411개 중 17개가
// m.2 / 1++ / gt-2000 처럼 특수문자를 의미로 쓰고 있어 일괄 제거하면 그것들이 깨진다.
describe('deriveKeyword 특수문자', () => {
  it('슬래시·중점 구분자는 공백으로 바꾼다', () => {
    assert.equal(deriveKeyword('[쿠팡] 로지텍/MX 마스터'), '로지텍 MX');
    assert.equal(deriveKeyword('삼성·LG 모니터'), '삼성 LG');
  });

  it('토큰 내부 점·하이픈은 보존한다 (m.2 → m2 가 되면 안 됨)', () => {
    assert.equal(deriveKeyword('m.2 SSD 1TB'), 'm.2 SSD');
    assert.equal(deriveKeyword('아식스 gt-2000 러닝화'), '아식스 gt-2000');
    assert.equal(deriveKeyword('퍼스트 2.0 세럼'), '퍼스트 2.0');
  });

  it('끝에 붙은 + 는 등급 표기라 남긴다 (1++ 한우)', () => {
    assert.equal(deriveKeyword('1++ 한우'), '1++ 한우');
  });

  it('가장자리 장식 문자는 턴다', () => {
    assert.equal(deriveKeyword('*긴급* 다이슨 청소기'), '긴급 다이슨');
  });
});

// 2026-10-12 리플레이(9/1~9/11 상세가 열린 커뮤니티 딜 1,000건 → 이후 30일 제목에 운영 매칭)에서 나온 구멍들.
// 말머리는 같은 판매처의 다른 상품에, 날짜는 숫자 든 제목 전부에 걸리고, 수량은 같은 상품의 다른 묶음을 놓친다.
describe('deriveKeyword 말머리·상태어·수량', () => {
  it('닫는 괄호로 끝나는 말머리를 뗀다', () => {
    assert.equal(deriveKeyword('하루특가) 돌쇠네 수제 떡갈비, 120g, 10팩'), '돌쇠네 수제');
    assert.equal(deriveKeyword('최저가) 주파집 전세계 호환 4구 어댑터'), '주파집 전세계');
    assert.equal(deriveKeyword('신카)롯카)현카) 3개월 미구매 할인'), '3개월 미구매');
  });

  it('닫는 괄호 말머리 뒤 대괄호는 브랜드라 남긴다', () => {
    assert.equal(deriveKeyword('티멤) [삼다수] 무라벨 2L, 12개 (9,080원/무료)'), '삼다수 무라벨');
  });

  it('이모지·상태어 뒤 대괄호는 판매처라 뗀다', () => {
    assert.equal(deriveKeyword('🔥인기 [지마켓] 웍스 WORX WX242 드라이버'), '웍스 WORX');
    assert.equal(deriveKeyword('품절 화려한우 육회 200g'), '화려한우 육회');
  });

  it('괄호로 시작하는 말머리를 떼서 빈 키워드를 막는다', () => {
    assert.equal(deriveKeyword('(무료) Modular Animal Knight Polyart'), 'Modular Animal');
  });

  it('날짜 머리를 뗀다 (9/4 → "9 4" 는 숫자 든 제목 전부에 걸린다)', () => {
    assert.equal(deriveKeyword('9/4 네이버포인트'), '네이버포인트');
  });

  it('종료 안내 글은 빈 문자열', () => {
    assert.equal(deriveKeyword('종료된 행사입니다.'), '');
  });

  it('두 번째 단어가 수량·용량이면 버린다', () => {
    assert.equal(deriveKeyword('펩시제로 210ml 30캔 +사이다제로 210ml 30캔'), '펩시제로');
    assert.equal(deriveKeyword('새우깡 8봉 + 매운새우깡 8봉'), '새우깡');
    assert.equal(deriveKeyword('구운계란 60구 대란 (5,900원/무료)'), '구운계란');
  });

  it('천 단위 쉼표 숫자(가격·용량)부터는 자른다', () => {
    assert.equal(deriveKeyword('Rocoren 5,000mAh 자기식 보조배터리'), 'Rocoren');
    assert.equal(deriveKeyword('쉐이크쉑 12,000원 이상 구매 시 할인'), '쉐이크쉑');
  });
});
