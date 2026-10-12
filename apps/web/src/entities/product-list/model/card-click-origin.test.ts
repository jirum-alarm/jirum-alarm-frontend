import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { pickCardOrigin } =
  require('./card-click-origin.ts') as typeof import('./card-click-origin');

describe('pickCardOrigin — 상세 진입에 실을 카드 클릭 출처', () => {
  const now = 1_800_000_000_000;
  const stored = (click: object) => JSON.stringify(click);

  it('방금 누른 그 상품이면 출처·위치를 돌려준다', () => {
    const raw = stored({ productId: 7, source: 'home_ranking', position: 3, at: now - 2_000 });
    assert.deepEqual(pickCardOrigin(raw, 7, now), { source: 'home_ranking', position: 3 });
  });

  it('다른 상품의 클릭은 붙이지 않는다(주소창·알림으로 들어온 상세)', () => {
    const raw = stored({ productId: 8, source: 'search', position: 0, at: now - 2_000 });
    assert.equal(pickCardOrigin(raw, 7, now), null);
  });

  it('1분 넘은 클릭·미래 시각은 버린다', () => {
    assert.equal(
      pickCardOrigin(
        stored({ productId: 7, source: 'search', position: 0, at: now - 61_000 }),
        7,
        now,
      ),
      null,
    );
    assert.equal(
      pickCardOrigin(
        stored({ productId: 7, source: 'search', position: 0, at: now + 5_000 }),
        7,
        now,
      ),
      null,
    );
  });

  it('비었거나 깨진 값은 출처 없음', () => {
    assert.equal(pickCardOrigin(null, 7, now), null);
    assert.equal(pickCardOrigin('{oops', 7, now), null);
    assert.equal(pickCardOrigin(stored({ productId: 7, at: now }), 7, now), null);
  });
});
