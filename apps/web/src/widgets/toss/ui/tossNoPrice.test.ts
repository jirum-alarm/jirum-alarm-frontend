import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// 토스 특가 코너 카드엔 판매가·「토스에서 가격 확인」 CTA 를 두지 않는다 — 가격 확인은 상세(from=toss)에서만.
// 앱 카드의 같은 정책은 apps/mobile/__tests__/toss-curation.test.ts 가 본다.
const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('토스 코너 카드엔 판매가·확인 CTA 가 없고 상세로 from=toss 를 넘긴다', () => {
  const card = read('./TossDealCard.tsx');
  assert.doesNotMatch(card, /토스에서 가격 확인/);
  assert.doesNotMatch(card, /toLocaleString\(\)\}원/);
  assert.match(card, /tossDetailHref/);
});

test('확인 CTA 는 상세에 있다', () => {
  assert.match(read('../../product-detail/ui/mobile/ProductInfo.tsx'), /토스에서 가격 확인/);
});
