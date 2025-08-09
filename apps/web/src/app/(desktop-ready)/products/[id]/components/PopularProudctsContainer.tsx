'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { ProductQueries } from '@/entities/product';
import HorizontalProductListSkeleton from '@/features/products/components/skeleton/HorizontalProductListSkeleton';

import PopularProducts from './PopularProducts';

export default function PopularProductsContainer({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  return (
    <section>
      <SectionHeader
        shouldShowMobileUI={true}
        title={`‘${product.categoryName || '기타'}’에서 인기있는 상품`}
      />
      <Suspense fallback={<HorizontalProductListSkeleton />}>
        <PopularProducts productId={productId} />
      </Suspense>
    </section>
  );
}
