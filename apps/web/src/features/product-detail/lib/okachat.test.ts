import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildPostPurchasePromptQueue, pickLiveDeal, shouldShowOkachatSoftPrompt } =
  require('./okachat.ts') as typeof import('./okachat');

describe('shouldShowOkachatSoftPrompt', () => {
  it('오카방 UTM 유입이면 숨긴다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: true, joined: false }), false);
  });

  it('이미 입장했으면 숨긴다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: false, joined: true }), false);
  });

  it('그 외 방문자에게는 보인다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: false, joined: false }), true);
  });
});

describe('buildPostPurchasePromptQueue', () => {
  it('오카방 유입이면 키워드만', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(false, { fromKakao: true, joined: false }), [
      'keyword',
    ]);
  });

  it('이미 입장했으면 키워드만', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(true, { fromKakao: false, joined: true }), [
      'keyword',
    ]);
  });

  it('비로그인은 오카방 → 키워드', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(false, { fromKakao: false, joined: false }), [
      'kakao',
      'keyword',
    ]);
  });

  it('로그인은 키워드 → 오카방', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(true, { fromKakao: false, joined: false }), [
      'keyword',
      'kakao',
    ]);
  });
});

describe('pickLiveDeal', () => {
  it('가격 없음·0원 이벤트를 건너뛰고 "N원" 꼴 첫 딜을 고른다', () => {
    const deals: { id: number; price: string | null }[] = [
      { id: 1, price: null },
      { id: 2, price: '￦ 0 (KRW)' },
      { id: 3, price: '0원' },
      { id: 4, price: '8,620원' },
      { id: 5, price: '100원' },
    ];
    assert.equal(pickLiveDeal(deals)?.id, 4);
  });

  it('쓸 만한 딜이 없으면 undefined', () => {
    assert.equal(pickLiveDeal([{ price: null }]), undefined);
  });
});
