'use client';

import { IProduct } from '@/graphql/interface';
import React, { Suspense } from 'react';
import PopularProducts from './PopularProudcts';
import MoreProductsSkeleton from './MoreProductsSkeleton';
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
