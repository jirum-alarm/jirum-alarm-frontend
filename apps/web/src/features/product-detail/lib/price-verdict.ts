import type { ProductPriceVerdict } from '@/shared/api/product/product.service';

/** 상세 히어로 가격 판정. 운영 포함 항상 노출. */
export const PRICE_VERDICT_HERO_ENABLED = true;

export type { ProductPriceVerdict };

/** READY+STRONG 만 히어로에 그린다. 그 외는 자리 자체를 안 잡는다. */
export function isStrongPriceVerdict(
  verdict: ProductPriceVerdict | null | undefined,
): verdict is ProductPriceVerdict {
  return (
    PRICE_VERDICT_HERO_ENABLED &&
    verdict?.status === 'READY' &&
    verdict.displayTier === 'STRONG' &&
    !!verdict.headline
  );
}
