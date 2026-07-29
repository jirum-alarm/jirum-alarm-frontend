import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import ShareButton from '@/shared/ui/ShareButton';

import { ProductQueries } from '@/entities/product';

export default function ProductShareButton({ productId }: { productId: number }) {
  const { data: product, isLoading } = useSuspenseQuery(
    ProductQueries.productInfo({ id: productId }),
  );

  if (isLoading) {
    return null;
  }

  if (!product) {
    notFound();
  }

  const title = `${product.title} | 지름알림`;
  // 가격·판매처·썸네일은 이미 productInfo 로 받아온 값 — 있는 것만 붙인다.
  const description = [product.price, product.mallName].filter(Boolean).join(' · ') || undefined;

  return (
    <ShareButton
      title={title}
      page="DETAIL"
      description={description}
      imageUrl={product.thumbnail ?? undefined}
    />
  );
}
