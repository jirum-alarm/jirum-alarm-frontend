/** web product-seo.ts 의 STALE_AFTER_DAYS — 이보다 오래된 딜만 안내한다. */
const STALE_AFTER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 신선도(오래됨 안내·품절 가능 경고)를 잴 기준 시각 — web `dealFreshnessAt` 과 같은 규칙.
 * 크롤러가 매일 다시 확인하는 토스 딜은 `data.toss.lastSeenAt`(마지막 확인 시각), 나머지는 게시일.
 * 게시일(=최초 수집일)로 재면 오늘도 판매 중인 딜에 "N개월 전·품절됐을 수 있어요"가 붙는다(2026-10-06).
 */
export function dealFreshnessAt(product: {
  postedAt?: string | null;
  data?: unknown;
}): string | null | undefined {
  const seen = (
    product.data as {toss?: {lastSeenAt?: unknown}} | null | undefined
  )?.toss?.lastSeenAt;
  if (typeof seen === 'string' && !Number.isNaN(Date.parse(seen))) return seen;
  return product.postedAt;
}

/** 표시 시각이 확인 시각이면 true — "3시간 전 확인"처럼 게시가 아님을 밝힌다. */
export function isSeenBasedFreshness(product: {
  postedAt?: string | null;
  data?: unknown;
}): boolean {
  return dealFreshnessAt(product) !== product.postedAt;
}

/**
 * 오래된 딜 안내 문구. web `formatDealAgeNotice` 와 같은 문구·경계.
 * 종료 딜은 이미 판매종료 표시가 있어 안내하지 않는다.
 */
export function formatDealAgeNotice(
  postedAt?: string | Date | null,
  isEnd?: boolean | null,
  now: number = Date.now(),
): string | null {
  if (isEnd) return null;

  const posted = postedAt ? new Date(postedAt) : null;
  if (!posted || Number.isNaN(posted.getTime())) return null;

  const ageDays = (now - posted.getTime()) / DAY_MS;
  if (ageDays <= STALE_AFTER_DAYS) return null;

  const label =
    ageDays >= 365
      ? `${Math.floor(ageDays / 365)}년 전`
      : `${Math.max(1, Math.floor(ageDays / 30))}개월 전`;

  return `${label}에 올라온 핫딜이에요. 가격·재고가 지금과 다를 수 있어요.`;
}
