'use client';

import React, { Suspense } from 'react';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import PopularProducts from './PopularProudcts';

import { ProductQuery } from '@/shared/api/gql/graphql';

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
