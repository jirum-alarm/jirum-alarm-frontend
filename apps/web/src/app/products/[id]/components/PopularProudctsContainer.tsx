'use client';

import { Suspense } from 'react';

import { ProductQuery } from '@/shared/api/gql/graphql';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import PopularProducts from './PopularProducts';

export default function PopularProductsContainer({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  return (
    <Suspense fallback={<MoreProductsSkeleton />}>
      <PopularProducts product={product} />
    </Suspense>
  );
}
