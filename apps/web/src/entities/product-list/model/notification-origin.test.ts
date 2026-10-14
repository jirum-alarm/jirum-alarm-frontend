import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { pickNotificationOrigin } =
  require('./notification-origin.ts') as typeof import('./notification-origin');

describe('pickNotificationOrigin — 상세 조회·구매 클릭에 실을 푸시 nid', () => {
  const now = 1_800_000_000_000;
  const nid = 'aB3_x-9QzK1m';
  const stored = (origin: object) => JSON.stringify(origin);

  it('이 상품을 30분 안에 푸시로 열었으면 nid', () => {
    assert.equal(
      pickNotificationOrigin(stored({ nid, productId: 7, at: now - 60_000 }), 7, now),
      nid,
    );
  });

  it('다른 상품의 푸시 진입은 붙이지 않는다(푸시로 연 뒤 다른 상세로 이동)', () => {
    assert.equal(pickNotificationOrigin(stored({ nid, productId: 8, at: now }), 7, now), null);
  });

  it('30분 넘은 진입·미래 시각은 버린다', () => {
    assert.equal(
      pickNotificationOrigin(stored({ nid, productId: 7, at: now - 30 * 60 * 1000 - 1 }), 7, now),
      null,
    );
    assert.equal(pickNotificationOrigin(stored({ nid, productId: 7, at: now + 1 }), 7, now), null);
  });

  it('서버 검증 모양이 아닌 nid·비었거나 깨진 값은 없음', () => {
    assert.equal(
      pickNotificationOrigin(stored({ nid: 'short', productId: 7, at: now }), 7, now),
      null,
    );
    assert.equal(
      pickNotificationOrigin(stored({ nid: 'has space 12', productId: 7, at: now }), 7, now),
      null,
    );
    assert.equal(pickNotificationOrigin(null, 7, now), null);
    assert.equal(pickNotificationOrigin('{oops', 7, now), null);
    assert.equal(pickNotificationOrigin(stored({ productId: 7, at: now }), 7, now), null);
  });
});
