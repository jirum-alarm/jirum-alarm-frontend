'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { ProductQuery } from '@/shared/api/gql/graphql';

export default function RelatedProducts({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const result = useSuspenseQuery(
    ProductQueries.togetherViewed({ limit: 20, productId: +product.id }),
  );
  const products = result.data.togetherViewedProducts;

  if (!products?.length) {
    return null;
  }

  return (
    <section className="px-5">
      <h2 className="pb-5 font-semibold text-gray-900">다른 고객이 함께 본 상품</h2>
      <HorizontalProductCarousel products={products} type="hotDeal" logging={{ page: 'DETAIL' }} />
    </section>
  );
}
