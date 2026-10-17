import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  POST_PURCHASE_PENDING_KEY,
  POST_PURCHASE_PENDING_TTL_MS,
  clearPostPurchasePending,
  savePostPurchasePending,
  takePostPurchasePending,
} = require('./post-purchase-pending.ts') as typeof import('./post-purchase-pending');

type FakeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & {
  data: Map<string, string>;
};

const makeStorage = (): FakeStorage => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
};

test('같은 상품으로 돌아오면 한 번만 꺼낸다', () => {
  const storage = makeStorage();
  savePostPurchasePending(storage, 42, 1_000);
  assert.equal(takePostPurchasePending(storage, 42, 61_000), true);
  assert.equal(takePostPurchasePending(storage, 42, 62_000), false);
});

test('다른 상품 상세에선 띄우지 않고 표식도 버린다', () => {
  const storage = makeStorage();
  savePostPurchasePending(storage, 42, 1_000);
  assert.equal(takePostPurchasePending(storage, 7, 2_000), false);
  assert.equal(storage.data.has(POST_PURCHASE_PENDING_KEY), false);
});

test('30분이 지나면 방금 산 맥락이 아니라 띄우지 않는다', () => {
  const storage = makeStorage();
  savePostPurchasePending(storage, 42, 0);
  assert.equal(takePostPurchasePending(storage, 42, POST_PURCHASE_PENDING_TTL_MS + 1), false);
});

test('권유를 끝까지 넘기면 표식을 지워 다시 그려져도 안 뜬다', () => {
  const storage = makeStorage();
  savePostPurchasePending(storage, 42, 0);
  clearPostPurchasePending(storage);
  assert.equal(takePostPurchasePending(storage, 42, 1), false);
});

test('깨진 값·저장소 예외에도 던지지 않는다', () => {
  const storage = makeStorage();
  storage.data.set(POST_PURCHASE_PENDING_KEY, '{oops');
  assert.equal(takePostPurchasePending(storage, 42, 1), false);

  const throwing: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
    removeItem: () => {
      throw new Error('denied');
    },
  };
  savePostPurchasePending(throwing, 42, 0);
  clearPostPurchasePending(throwing);
  assert.equal(takePostPurchasePending(throwing, 42, 1), false);
});
