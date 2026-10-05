import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const store = new Map<string, string>();
Object.assign(globalThis, {
  window: {},
  sessionStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

const require = createRequire(import.meta.url);
const { savePendingAction, takePendingAction } =
  require('./pendingAction.ts') as typeof import('./pendingAction');

test('다른 type 소비자는 남의 의도를 지우지 않는다 (상세 = 찜 + 키워드)', () => {
  savePendingAction('wishlist-add', 1);
  assert.equal(takePendingAction('notification-keyword-add'), null);
  assert.equal(takePendingAction('wishlist-add')?.payload, 1);
  assert.equal(takePendingAction('wishlist-add'), null); // 한 번만
});
