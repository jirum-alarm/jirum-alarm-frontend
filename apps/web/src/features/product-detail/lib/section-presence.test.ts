import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { createSectionStore, evidenceScrollTarget } =
  require('./section-presence.ts') as typeof import('./section-presence');

test('근거 보기 — 대상 섹션이 그려져 있을 때만 링크', () => {
  const store = createSectionStore();
  assert.equal(
    evidenceScrollTarget('HISTORY', store.has),
    null,
    '가격 추이가 아직(로딩·점 부족·holdout)',
  );
  store.add('price-history');
  assert.equal(evidenceScrollTarget('HISTORY', store.has), 'price-history');
  assert.equal(
    evidenceScrollTarget('COMMUNITY', store.has),
    null,
    '커뮤니티 반응은 없음(유저 등록 딜)',
  );
  store.add('community-reaction');
  assert.equal(evidenceScrollTarget('COMMUNITY', store.has), 'community-reaction');
  assert.equal(evidenceScrollTarget('DANAWA', store.has), null, '다나와 근거는 링크가 없다');
  store.remove('price-history');
  assert.equal(evidenceScrollTarget('HISTORY', store.has), null, '섹션이 사라지면 링크도');
});

test('같은 섹션이 두 번 등록돼도(StrictMode 이중 마운트) 하나가 빠질 때 사라지지 않는다', () => {
  const store = createSectionStore();
  let calls = 0;
  const off = store.subscribe(() => calls++);
  store.add('price-history');
  store.add('price-history');
  store.remove('price-history');
  assert.equal(store.has('price-history'), true);
  store.remove('price-history');
  assert.equal(store.has('price-history'), false);
  assert.equal(calls, 2, '있음/없음이 바뀔 때만 알린다');
  off();
  store.add('price-history');
  assert.equal(calls, 2, '구독 해제 뒤엔 알리지 않는다');
});
