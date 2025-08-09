'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import HorizontalProductCarousel from '@/features/products/components/carousel/ProductCarouselList';

export default function RelatedProducts({ productId }: { productId: number }) {
  const result = useSuspenseQuery(ProductQueries.togetherViewed({ limit: 20, productId }));
  const products = result.data.togetherViewedProducts;

  if (!products?.length) {
    return null;
  }

  return (
    <HorizontalProductCarousel products={products} type="hotDeal" logging={{ page: 'DETAIL' }} />
  );
}
