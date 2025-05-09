'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import SectionHeader from '@/components/SectionHeader';
import { ProductQueries } from '@/entities/product';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { ProductQuery, ThumbnailType } from '@/shared/api/gql/graphql';

export default function PopularProducts({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const result = useSuspenseQuery(
    ProductQueries.products({
      limit: 20,
      categoryId: product.categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
    }),
  );
  const products = result.data.products;

  if (!products?.length) {
    return null;
  }

  return (
    <section className="px-5">
      <SectionHeader title={`‘${product.categoryName || '기타'}’에서 인기있는 상품`} />
      <HorizontalProductCarousel products={products} type="hotDeal" logging={{ page: 'DETAIL' }} />
    </section>
  );
}
