'use client';

import { env } from 'next-runtime-env';

import { AdSenseUnit } from '@/shared/ui/adsense/AdSenseUnit';

/**
 * PC 상품 상세 우측 컬럼(ProductInfo 아래)에 들어가는 세로형 광고.
 * 왼쪽 본문이 더 길어 생기는 빈 sticky 공간을 채우므로 콘텐츠를 가리지 않는다.
 * 모바일에는 우측 컬럼 자체가 없으므로 사용하지 않는다.
 */
export function ProductDetailSideAd({ productId }: { productId: number }) {
  const slot = env('NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL_SIDE') ?? '';

  return (
    <AdSenseUnit
      // 상품이 바뀌면 <ins>를 새로 그려 새 광고를 다시 요청한다.
      key={productId}
      slot={slot}
      format="vertical"
      minHeight={600}
    />
  );
}
