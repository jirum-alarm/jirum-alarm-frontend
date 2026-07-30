import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { beforeEach, describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { getViewedProductIds, pushViewedProductId } =
  require('./viewedProducts.ts') as typeof import('./viewedProducts');

// bare node --test 라 jsdom 이 없다. localStorage 최소 구현만 심는다.
const installLocalStorage = () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  return store;
};

describe('viewedProducts', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = installLocalStorage();
  });

  it('본 적 없으면 빈 배열', () => {
    assert.deepEqual(getViewedProductIds(), []);
  });

  it('본 상품을 기록하고 최신이 앞에 온다', () => {
    pushViewedProductId(1);
    pushViewedProductId(2);
    assert.deepEqual(getViewedProductIds(), ['2', '1']);
  });

  it('같은 상품 재방문 시 중복 없이 맨 앞으로', () => {
    pushViewedProductId(1);
    pushViewedProductId(2);
    pushViewedProductId(1);
    assert.deepEqual(getViewedProductIds(), ['1', '2']);
  });

  // 상세 진입은 number(+id), 카드는 string 을 넘긴다. 같은 상품으로 취급돼야 한다.
  it('숫자로 저장한 상품을 문자열로 조회해도 같은 상품', () => {
    pushViewedProductId(42);
    pushViewedProductId('42');
    assert.deepEqual(getViewedProductIds(), ['42'], '중복 저장되지 않는다');
  });

  it('500개를 넘으면 오래된 것부터 잘린다', () => {
    for (let i = 1; i <= 505; i++) pushViewedProductId(i);
    const ids = getViewedProductIds();
    assert.equal(ids.length, 500);
    assert.equal(ids[0], '505', '최신이 맨 앞');
    assert.ok(!ids.includes('1'), '가장 오래된 건 잘림');
  });

  it('저장값이 깨져 있어도 빈 배열로 복구된다', () => {
    store.set('gr-viewed-product-ids', '{not json');
    assert.deepEqual(getViewedProductIds(), []);
    // 깨진 상태에서도 기록은 계속 동작
    pushViewedProductId(7);
    assert.deepEqual(getViewedProductIds(), ['7']);
  });

  it('localStorage 가 막혀 있어도 던지지 않는다 (시크릿 모드)', () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    assert.doesNotThrow(() => pushViewedProductId(1));
    assert.deepEqual(getViewedProductIds(), []);
  });
});
