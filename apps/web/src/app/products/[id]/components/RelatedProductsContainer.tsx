'use client';

import 'swiper/css';

import { Suspense } from 'react';

import { ProductQuery } from '@/shared/api/gql/graphql';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import RelatedProducts from './RelatedProducts';

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
