/**
 * 구매 후 권유(오카방·키워드)를 «돌아왔을 때» 다시 띄우기 위한 표식.
 *
 * 권유는 구매 클릭 순간 React state 로만 떴다. 쇼핑몰에서 돌아왔을 때 이 페이지가 새로 그려지면
 * (인앱 브라우저가 같은 창에서 쇼핑몰을 열고 뒤로가기로 다시 불러옴 · 백그라운드 탭 회수 · 루트 레이아웃이
 * no-store 라 bfcache 도 없다) state 가 사라져 권유를 한 번도 못 본다. 그래서 클릭 때 sessionStorage 에
 * 상품 id 를 적어 두고, 같은 상품 상세가 다시 그려지면 한 번 꺼내 권유를 이어 띄운다.
 */

export const POST_PURCHASE_PENDING_KEY = 'post_purchase_prompt_pending';
/** 쇼핑몰을 보고 돌아오는 데 걸리는 넉넉한 시간. 지나면 «방금 산 맥락»이 아니라 권하지 않는다. */
export const POST_PURCHASE_PENDING_TTL_MS = 30 * 60 * 1000;

type PendingStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function savePostPurchasePending(
  storage: PendingStorage,
  productId: number,
  now: number,
): void {
  try {
    storage.setItem(POST_PURCHASE_PENDING_KEY, JSON.stringify({ productId, at: now }));
  } catch {
    // 사파리 private 등 — 돌아왔을 때 다시 못 띄울 뿐, 지금 화면의 권유는 그대로 뜬다.
  }
}

export function clearPostPurchasePending(storage: PendingStorage): void {
  try {
    storage.removeItem(POST_PURCHASE_PENDING_KEY);
  } catch {
    // 위와 같다.
  }
}

/** 이 상품의 표식이 유효하면 true — 어느 경우든 표식은 지운다(다시 그려질 때마다 반복해 띄우지 않게). */
export function takePostPurchasePending(
  storage: PendingStorage,
  productId: number,
  now: number,
): boolean {
  let raw: string | null;
  try {
    raw = storage.getItem(POST_PURCHASE_PENDING_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;
  clearPostPurchasePending(storage);
  try {
    const pending = JSON.parse(raw) as { productId?: unknown; at?: unknown };
    return (
      pending.productId === productId &&
      typeof pending.at === 'number' &&
      now - pending.at >= 0 &&
      now - pending.at <= POST_PURCHASE_PENDING_TTL_MS
    );
  } catch {
    return false;
  }
}
