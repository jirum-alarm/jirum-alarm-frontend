'use client';

import 'swiper/css';

import React, { Suspense } from 'react';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import RelatedProducts from './RelatedProducts';

import { ProductQuery } from '@/shared/api/gql/graphql';

export default function RelatedProductsContainer({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  return (
    <Suspense fallback={<MoreProductsSkeleton />}>
      <RelatedProducts product={product} />
    </Suspense>
  );
}
