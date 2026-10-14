import dayjs from 'dayjs';

import { dealFreshnessAt } from './product-seo';

/** 종료 딜 블록(ExpiredProductWarning)과 같은 7일 — 그보다 오래된 딜은 그쪽이 「최신 핫딜」을 띄운다. */
const LIVE_ALTERNATIVE_MAX_DEAL_AGE_DAYS = 7;
export const LIVE_ALTERNATIVE_LIMIT = 3;

/** 「다른 곳 진행 중인 딜」을 띄울 딜인가 — 서버 프리페치와 클라이언트 블록이 같은 판정을 쓴다. */
export function isLiveAlternativeTarget(product: { postedAt?: unknown; data?: unknown }): boolean {
  const at = dealFreshnessAt(product as { postedAt?: string; data?: unknown });
  return !!at && dayjs().diff(dayjs(at), 'day') < LIVE_ALTERNATIVE_MAX_DEAL_AGE_DAYS;
}
