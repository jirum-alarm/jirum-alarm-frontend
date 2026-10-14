/**
 * 푸시를 눌러 들어온 상세의 조회·구매 클릭에 그 푸시의 nid 를 싣는다 — 알림 → 열람 → 구매 귀속.
 *
 * ★왜: 서버는 기기별 발송마다 nid(12자)를 만들어 FCM data 에 싣고, collectProduct·collectPurchaseClick 이
 * 같은 nid 를 받으면 user_history(post_view·purchase_link_click)에 같이 적는다. 그래야 «이 발송이 열람·구매로
 * 이어졌나»를 기기·시각 추정 없이 한 키로 잇는다. 상세 화면은 푸시 데이터를 못 보므로, 푸시를 여는 순간
 * (FCMHandler) 적어 두고 상세가 꺼내 쓴다.
 *
 * 메모리에만 둔다 — 앱을 껐다 켜면 그 푸시 세션은 끝난 것으로 본다(저장소에 남기면 엉뚱한 날의 열람에 붙는다).
 * 상세를 떠났다 돌아와 구매를 눌러도 붙도록 꺼내도 지우지 않고(peek), 다른 푸시를 열면 덮인다.
 */
const MAX_AGE_MS = 30 * 60 * 1000;
// 서버 검증과 같은 모양(/^[A-Za-z0-9_-]{12}$/) — 다르면 서버가 거절해 조회 기록째 잃는다.
const NID_PATTERN = /^[A-Za-z0-9_-]{12}$/;

export type PushOpen = {nid: string; productId: number; at: number};

let lastPushOpen: PushOpen | null = null;

/** 푸시 data 의 link(`/products/<id>`)·target_id 에서 상품 id 를 꺼낸다. 상품 알림이 아니면 null. */
export function resolvePushProductId(data: {
  link?: unknown;
  target_id?: unknown;
}): number | null {
  if (typeof data.link === 'string') {
    const matched = data.link.match(/\/products\/(\d+)(?:[/?#]|$)/);
    if (matched) return Number(matched[1]);
  }
  const fromTarget = Number(data.target_id);
  return Number.isInteger(fromTarget) && fromTarget > 0 ? fromTarget : null;
}

/** 푸시를 연 순간 부른다. nid 가 없거나(옛 서버·다른 알림) 모양이 틀리면 아무것도 안 적는다. */
export function rememberPushOpen(open: {
  nid: unknown;
  productId: number | null;
  at: number;
}): void {
  if (typeof open.nid !== 'string' || !NID_PATTERN.test(open.nid)) return;
  if (open.productId === null) return;
  lastPushOpen = {nid: open.nid, productId: open.productId, at: open.at};
}

/** 순수 판정 — 같은 상품이고 30분 안이면 nid. */
export function pickPushNid(
  open: PushOpen | null,
  productId: number,
  now: number,
): string | undefined {
  if (!open || open.productId !== productId) return undefined;
  const age = now - open.at;
  if (age < 0 || age > MAX_AGE_MS) return undefined;
  return open.nid;
}

/** 상세 조회·구매 클릭이 부른다. 같은 상품 푸시를 30분 안에 열었을 때만 nid. */
export function peekPushOrigin(
  productId: number,
  now = Date.now(),
): string | undefined {
  return pickPushNid(lastPushOpen, productId, now);
}

/** 테스트 전용 — 모듈 상태를 비운다. */
export function resetPushOriginForTest(): void {
  lastPushOpen = null;
}
