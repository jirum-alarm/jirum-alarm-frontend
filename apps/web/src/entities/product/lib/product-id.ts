/**
 * URL 세그먼트를 상품 id 로 해석한다. 양의 정수가 아니면 null.
 *
 * 왜: `/products/null` 과 `/products/abc` 가 **500** 을 내고 있었다(2026-09-03 게이트웨이 로그
 * 75분 표본: `/products/null` 29건 전부 500, UA 는 봇이 아니라 실제 브라우저 — 하루 약 550건).
 * `+id` 가 NaN 이 되어 GraphQL 조회가 던지면 그대로 500 이 나간다. 없는 상품은 500 이 아니라
 * 404 여야 한다 — 500 은 크롤러에게 "사이트가 불안정하다"는 신호이고 색인에서 불리하다.
 */
export function parseProductId(raw: string | null | undefined): number | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  // 정규식으로 먼저 거른다. Number('1e3')·Number(' 12 ')·Number('0x1f') 처럼
  // 숫자로 변환은 되지만 id 로는 쓸 수 없는 입력을 막는다.
  if (!/^\d+$/.test(trimmed)) return null;

  const id = Number(trimmed);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
