import type {ProductPriceVerdictQuery} from '@/shared/api/gql/graphql';

export type PriceVerdict = NonNullable<
  NonNullable<ProductPriceVerdictQuery['product']>['priceVerdict']
>;

/**
 * READY+STRONG 만 판정 카드를 그린다. 그 외는 자리 자체를 안 잡는다.
 * web `features/product-detail/lib/price-verdict.ts` isStrongPriceVerdict 와 같은 규칙.
 */
export function isStrongPriceVerdict(
  verdict: PriceVerdict | null | undefined,
): verdict is PriceVerdict & {headline: string} {
  return (
    verdict?.status === 'READY' &&
    verdict.displayTier === 'STRONG' &&
    !!verdict.headline
  );
}

/** web product-seo.ts 의 STALE_AFTER_DAYS — 이보다 오래된 딜만 안내한다. */
const STALE_AFTER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

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
