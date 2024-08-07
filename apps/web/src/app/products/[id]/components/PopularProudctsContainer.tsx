'use client';

import { IProduct } from '@/graphql/interface';
import React, { Suspense } from 'react';
import PopularProducts from './PopularProudcts';
import MoreProductsSkeleton from './MoreProductsSkeleton';

export default function PopularProductsContainer({ product }: { product: IProduct }) {
  return (
    <Suspense fallback={<MoreProductsSkeleton />}>
      <PopularProducts product={product} />
    </Suspense>
  );
}
