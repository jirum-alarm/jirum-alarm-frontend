import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { COMMUNITY_TABS, communityTabFilter, isNewNotice } =
  require('./community.ts') as typeof import('./community');

describe('COMMUNITY_TABS', () => {
  it('서버가 채우지 않는 「인기」 탭은 없다', () => {
    assert.deepEqual(
      COMMUNITY_TABS.map((t) => t.label),
      ['전체', '공지'],
    );
    assert.deepEqual(communityTabFilter('all'), {});
    assert.deepEqual(communityTabFilter('notice'), { isNotice: true });
  });
});

describe('isNewNotice', () => {
  const now = new Date('2026-10-24T03:00:00Z');

  it('7일 안의 공지만 NEW', () => {
    assert.equal(isNewNotice('2026-10-20T00:00:00Z', now), true);
    assert.equal(isNewNotice('2026-10-17T03:00:01Z', now), true);
    assert.equal(isNewNotice('2026-10-17T03:00:00Z', now), false);
  });

  it('끝난 지 오래된 공지(9/1)는 NEW 가 아니다', () => {
    assert.equal(isNewNotice('2026-09-01T00:00:00Z', now), false);
  });

  it('미래 시각(시계 어긋남)은 NEW 로 치지 않는다', () => {
    assert.equal(isNewNotice('2026-10-25T00:00:00Z', now), false);
  });
});
