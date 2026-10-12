import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound, useSearchParams } from 'next/navigation';

import { hotdealTextMap } from '@/shared/config/hotdeal';
import ShareButton from '@/shared/ui/ShareButton';

import { ProductQueries } from '@/entities/product';
import { isFromToss } from '@/entities/product/lib/from-toss';

import { buildProductShareDescription } from '../lib/share-card';

export default function ProductShareButton({ productId }: { productId: number }) {
  const { data: product, isLoading } = useSuspenseQuery(
    ProductQueries.productInfo({ id: productId }),
  );
  // 토스 코너 유입은 상세가 가격을 숨긴다 — 공유 문구도 따라간다(데스크톱 ProductInfo 와 같은 규칙).
  const hidePrice = isFromToss(useSearchParams().get('from'));

  if (isLoading) {
    return null;
  }

  if (!product) {
    notFound();
  }

  const title = `${product.title} | 지름알림`;

  return (
    <ShareButton
      title={title}
      description={buildProductShareDescription({
        price: product.price,
        mallName: product.mallName,
        badge: product.hotDealType ? hotdealTextMap[product.hotDealType] : null,
        isEnd: product.isEnd,
        hidePrice,
      })}
      imageUrl={product.thumbnail ?? undefined}
    />
  );
}
