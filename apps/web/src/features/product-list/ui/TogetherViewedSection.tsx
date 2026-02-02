'use client';


import { ProductQueries } from '@/entities/product';
import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';
import { useSuspenseQuery } from '@tanstack/react-query';

type Props = {
  productId: number;
  title?: string;
  limit?: number;
};

export default function TogetherViewedSection({
  productId,
  title = '다른 고객이 함께 본 상품',
  limit = 20,
}: Props) {
  const { data } = useSuspenseQuery(ProductQueries.togetherViewed({ productId, limit }));
  const products = data?.togetherViewedProducts ?? [];

  if (!products.length) return null;

  return <CarouselProductsSection title={title} products={products} />;
}
