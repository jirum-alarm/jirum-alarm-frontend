/**
 * 상품 카드 클릭 → 상세 진입(post_view)에 「어느 목록 몇 번째에서 왔나」를 싣는다.
 *
 * ★왜: 웹 상세 진입은 CollectProductOnView 가 source 없이 기록해서, 목록 노출(post_impression)과
 * 같은 기기·상품으로 이어 봐도 어느 목록의 클릭인지 알 수 없었다(앱은 source 가 붙어 ~95% 이어짐, 2026-10-12).
 * 카드 클릭 순간에 출처를 적어 두고 상세가 마운트될 때 꺼내 쓴다. 새 탭으로 열어도 보이게 localStorage.
 */
const CARD_CLICK_KEY = 'jirum-alarm-card-click';
/** 이보다 오래된 클릭은 이번 상세 진입의 출처가 아니다(뒤로 갔다가 주소로 들어온 경우 등). */
const MAX_AGE_MS = 60_000;

export type CardOrigin = { source: string; position: number };
type StoredCardClick = CardOrigin & { productId: number; at: number };

/** 저장된 클릭이 이 상품의 최근 클릭이면 출처를 돌려준다. */
export function pickCardOrigin(
  raw: string | null,
  productId: number,
  now: number,
): CardOrigin | null {
  if (!raw) return null;
  try {
    const click = JSON.parse(raw) as Partial<StoredCardClick>;
    if (click.productId !== productId || typeof click.at !== 'number') return null;
    if (now - click.at < 0 || now - click.at > MAX_AGE_MS) return null;
    if (typeof click.source !== 'string' || typeof click.position !== 'number') return null;
    return { source: click.source, position: click.position };
  } catch {
    return null;
  }
}

export function rememberCardClick(click: CardOrigin & { productId: number }) {
  try {
    localStorage.setItem(CARD_CLICK_KEY, JSON.stringify({ ...click, at: Date.now() }));
  } catch {
    // 저장소가 막힌 브라우저 — 출처 없이 기록된다.
  }
}

/** 상세 진입 때 한 번 꺼낸다. 같은 클릭이 다음 상세에 다시 붙지 않게 지운다. */
export function takeCardOrigin(productId: number): CardOrigin | null {
  try {
    const origin = pickCardOrigin(localStorage.getItem(CARD_CLICK_KEY), productId, Date.now());
    if (origin) localStorage.removeItem(CARD_CLICK_KEY);
    return origin;
  } catch {
    return null;
  }
}
