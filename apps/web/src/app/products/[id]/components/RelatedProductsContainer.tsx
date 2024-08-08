'use client';

import 'swiper/css';

import { IProduct } from '@/graphql/interface';
import React, { Suspense } from 'react';
import RelatedProducts from './RelatedProducts';
import MoreProductsSkeleton from './MoreProductsSkeleton';

export default function RelatedProductsContainer({ product }: { product: IProduct }) {
  return (
    <Suspense fallback={<MoreProductsSkeleton />}>
      <RelatedProducts product={product} />
    </Suspense>
  );
}
