/**
 * 푸시 알림을 눌러 들어온 상세의 조회(post_view)·구매 클릭에 그 발송의 nid 를 싣는다 — 알림 → 열람 → 구매 귀속.
 *
 * ★왜: 서버는 기기별 발송마다 nid(12자)를 만들어 푸시 링크에 `?nid=` 로 붙이고, collectProduct·
 * collectPurchaseClick 이 같은 nid 를 받으면 user_history 에 같이 적는다. 그래야 발송 하나가 열람·구매로
 * 이어졌는지를 기기·시각 추정 없이 한 키로 잇는다.
 *
 * - 주소는 클라이언트에서만 읽는다 — 서버 searchParams 를 읽으면 상세 페이지가 정적 캐시를 잃고 dynamic 이 된다.
 * - 읽은 뒤 주소에서 nid 를 지운다 — 남기면 공유·새로고침·북마크가 같은 nid 로 열람을 또 적어 귀속이 부푼다.
 * - sessionStorage(탭 단위)에 30분 둔다 — 상세에서 구매 버튼을 누르는 건 조회보다 늦고, 다른 탭의 열람엔 붙지 않게.
 *   꺼내도 지우지 않는다(조회·구매 둘 다 같은 nid 를 실어야 한다). 다른 푸시로 들어오면 덮인다.
 */
const NOTIFICATION_ORIGIN_KEY = 'jirum-alarm-notification-origin';
const NID_PARAM = 'nid';
/** 이보다 오래 지난 푸시 진입은 이번 구매의 출처로 보지 않는다. */
const MAX_AGE_MS = 30 * 60 * 1000;
// 서버 검증과 같은 모양(/^[A-Za-z0-9_-]{12}$/) — 다르면 서버가 거절해 조회 기록째 잃는다.
const NID_PATTERN = /^[A-Za-z0-9_-]{12}$/;

type StoredNotificationOrigin = { nid: string; productId: number; at: number };

/** 저장된 푸시 진입이 이 상품의 30분 안 진입이면 nid 를 돌려준다. */
export function pickNotificationOrigin(
  raw: string | null,
  productId: number,
  now: number,
): string | null {
  if (!raw) return null;
  try {
    const origin = JSON.parse(raw) as Partial<StoredNotificationOrigin>;
    if (origin.productId !== productId || typeof origin.at !== 'number') return null;
    if (now - origin.at < 0 || now - origin.at > MAX_AGE_MS) return null;
    if (typeof origin.nid !== 'string' || !NID_PATTERN.test(origin.nid)) return null;
    return origin.nid;
  } catch {
    return null;
  }
}

/**
 * 상세 마운트 때 한 번 — 주소의 `?nid=` 를 저장하고 주소에서 지운다.
 * 모양이 틀린 nid 는 저장하지 않지만 주소에선 지운다(공유 링크로 퍼지지 않게).
 */
export function captureNotificationOrigin(productId: number) {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    const nid = url.searchParams.get(NID_PARAM);
    if (nid === null) return;
    if (NID_PATTERN.test(nid)) {
      sessionStorage.setItem(
        NOTIFICATION_ORIGIN_KEY,
        JSON.stringify({ nid, productId, at: Date.now() } satisfies StoredNotificationOrigin),
      );
    }
    url.searchParams.delete(NID_PARAM);
    // Next App Router 는 history.replaceState 를 라우터 상태와 맞춰 준다(재요청·리렌더 없음).
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // 저장소가 막힌 브라우저 — nid 없이 기록된다.
  }
}

/** 이 상품을 30분 안에 푸시로 열었으면 그 nid. 조회·구매 클릭 기록이 부른다. */
export function peekNotificationOrigin(productId: number): string | undefined {
  try {
    return (
      pickNotificationOrigin(
        sessionStorage.getItem(NOTIFICATION_ORIGIN_KEY),
        productId,
        Date.now(),
      ) ?? undefined
    );
  } catch {
    return undefined;
  }
}
