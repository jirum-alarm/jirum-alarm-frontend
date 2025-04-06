'use client';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { ProductQuery, ThumbnailType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';

export default function PopularProducts({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const { mutate } = useMutation({ mutationFn: ProductService.collectProduct });
  const result = useSuspenseQuery(
    ProductQueries.products({
      limit: 20,
      categoryId: product.categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
    }),
  );
  const products = result?.data?.products;

  if (!products?.length) {
    return null;
  }

  return (
    <section className="px-5">
      <h2 className="pb-5 font-semibold text-gray-900">
        ‘{product.categoryName || '기타'}’에서 인기있는 상품
      </h2>
      <HorizontalProductCarousel products={products} type="hotDeal" logging={{ page: 'DETAIL' }} />
    </section>
  );
}
