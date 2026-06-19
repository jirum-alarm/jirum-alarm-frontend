'use client';

import { env } from 'next-runtime-env';

import { AdSenseUnit } from '@/shared/ui/adsense/AdSenseUnit';

export function ProductDetailAd({ productId, isMobile }: { productId: number; isMobile: boolean }) {
  const slot = env('NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL') ?? '';

  return (
    <AdSenseUnit
      // 상품이 바뀌면 <ins>를 새로 그려 새 광고를 다시 요청한다.
      key={productId}
      slot={slot}
      format="auto"
      className={isMobile ? 'px-5' : undefined}
      minHeight={isMobile ? 280 : 250}
    />
  );
}
